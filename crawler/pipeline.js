'use strict';

/**
 * DesignSeed — 设计爬虫批量学习管道
 *
 * 流程：sources.json -> fetch -> 解析 HTML -> 提取 CSS/组件 -> 质量评分 -> 存入 memory
 * 支持增量学习（跳过已学习的源）和批量模式
 */

const fs = require('fs');
const path = require('path');
const { DesignFetcher } = require('./fetcher');
const { DesignParser } = require('./parser');
const CssExtractor = require('./css-extractor');
const ComponentDetector = require('./component-detector');

class CrawlerPipeline {
  constructor(memory, options = {}) {
    this.memory = memory;
    this.fetcher = new DesignFetcher();
    this.parser = new DesignParser();
    this.cssExtractor = new CssExtractor();
    this.componentDetector = new ComponentDetector();
    this.options = {
      maxConcurrent: options.maxConcurrent || 3,
      retryCount: options.retryCount || 2,
      timeout: options.timeout || 15000,
      skipExisting: options.skipExisting !== false,
      onProgress: options.onProgress || null,
      onResult: options.onResult || null,
    };
    this.stats = { total: 0, success: 0, skipped: 0, failed: 0, errors: [] };
  }

  async run(filter) {
    const sourcesPath = path.join(__dirname, 'sources.json');
    const raw = fs.readFileSync(sourcesPath, 'utf8');
    const sources = JSON.parse(raw);
    let targets = sources.designSystems || sources;
    if (filter && filter.company) {
      targets = targets.filter(s => s.company.toLowerCase().includes(filter.company.toLowerCase()));
    }
    if (filter && filter.tags && filter.tags.length > 0) {
      targets = targets.filter(s => s.tags && filter.tags.some(t => s.tags.includes(t)));
    }
    this.stats.total = targets.length;
    this._report('start', { total: targets.length });
    for (let i = 0; i < targets.length; i++) {
      const source = targets[i];
      if (this.options.skipExisting) {
        const existing = this.memory.searchDesignSystems(source.company);
        if (existing.length > 0) { this.stats.skipped++; this._report('skip', { company: source.company }); continue; }
      }
      try {
        const result = await this._learnOne(source, i);
        if (result) { this.stats.success++; this._report('success', { company: source.company, score: result.quality_score }); }
      } catch (err) {
        this.stats.failed++;
        this.stats.errors.push({ company: source.company, error: err.message });
        this._report('error', { company: source.company, error: err.message });
      }
    }
    this._report('complete', this.stats);
    return this.stats;
  }

  async learnUrl(url, company) {
    return this._learnOne({ company: company || this._guessCompany(url), url }, 0);
  }

  learnFromContent(html, company, url) {
    const extracted = this._extractFeatures(html);
    const qualityScore = this._assessQuality(extracted);
    const data = { company, url: url || null, content: html.substring(0, 50000), colors: extracted.colors, typography: extracted.typography, layout: extracted.layout, components: extracted.components, tone: extracted.tone, philosophy: null, quality_score: qualityScore, source: 'offline' };
    const id = this.memory.saveDesignSystem(data);
    return { id, ...data };
  }

  async _learnOne(source, index) {
    this._report('fetching', { company: source.company, url: source.url, index: index + 1 });
    const html = await this.fetcher.fetch(source.url, { timeout: this.options.timeout, retries: this.options.retryCount });
    if (!html || html.length < 500) throw new Error('内容过短或为空');
    const extracted = this._extractFeatures(html);
    const qualityScore = this._assessQuality(extracted);
    const data = { company: source.company, url: source.url, content: html.substring(0, 50000), colors: extracted.colors, typography: extracted.typography, layout: extracted.layout, components: extracted.components, tone: extracted.tone, philosophy: source.philosophy || null, quality_score: qualityScore, source: source.source || 'crawler' };
    const id = this.memory.saveDesignSystem(data);
    const result = { id, ...data };
    if (this.options.onResult) this.options.onResult(result);
    return result;
  }

  _extractFeatures(html) {
    const result = { colors: {}, typography: {}, layout: {}, components: {}, tone: {} };
    const cssVars = this.cssExtractor.extract(html);
    const tokens = this.cssExtractor.mapToTokens(cssVars);
    if (tokens.colors) result.colors = tokens.colors;
    if (tokens.typography) result.typography = tokens.typography;
    if (tokens.spacing) result.layout.spacing = tokens.spacing;
    if (tokens.breakpoints) result.layout.breakpoints = tokens.breakpoints;
    const detected = this.componentDetector.detect(html);
    if (detected.length > 0) {
      result.components = { frameworks: detected.map(d => ({ id: d.id, name: d.name, confidence: d.confidence })), primary: detected[0].name };
    }
    result.tone = this._inferTone(html, tokens, detected);
    return result;
  }

  _inferTone(html, cssTokens, frameworks) {
    const tone = { formality: 0.5, warmth: 0.5, complexity: 0.5, innovation: 0.5 };
    const fontStr = JSON.stringify(cssTokens.typography || {}).toLowerCase();
    if (fontStr.includes('serif') && !fontStr.includes('sans-serif')) tone.formality += 0.2;
    if (fontStr.includes('rounded') || fontStr.includes('cursive')) { tone.formality -= 0.2; tone.warmth += 0.15; }
    const colorStr = JSON.stringify(cssTokens.colors || {}).toLowerCase();
    const warmCount = ['red','orange','yellow','pink','#ff','#f9','#fb'].filter(c => colorStr.includes(c)).length;
    const coolCount = ['blue','cyan','teal','indigo','#00','#06','#08'].filter(c => colorStr.includes(c)).length;
    tone.warmth = Math.max(0, Math.min(1, tone.warmth + (warmCount - coolCount) * 0.05));
    const varCount = cssTokens.colors ? Object.keys(cssTokens.colors).length : 0;
    tone.complexity = Math.min(1, 0.3 + varCount * 0.03);
    const fIds = frameworks.map(f => f.id);
    if (fIds.includes('tailwind') || fIds.includes('shadcn')) tone.innovation += 0.15;
    if (fIds.includes('bootstrap')) tone.innovation -= 0.1;
    if (html.includes('animation') || html.includes('transition')) tone.innovation += 0.1;
    for (const k of Object.keys(tone)) tone[k] = Math.round(Math.max(0, Math.min(1, tone[k])) * 100) / 100;
    return tone;
  }

  _assessQuality(extracted) {
    let score = 0;
    const colorKeys = Object.keys(extracted.colors || {});
    if (colorKeys.length >= 3) score += 15;
    if (colorKeys.length >= 5) score += 10;
    if (extracted.colors.primary || extracted.colors.background) score += 5;
    const typoKeys = Object.keys(extracted.typography || {});
    if (typoKeys.length >= 2) score += 10;
    if (extracted.typography.fontFamily) score += 8;
    if (extracted.typography.scale || extracted.typography.fontSize) score += 7;
    if (extracted.components.frameworks && extracted.components.frameworks.length > 0) { score += 10; if (extracted.components.frameworks.length > 1) score += 5; }
    const tone = extracted.tone || {};
    const toneVariance = Object.values(tone).reduce((s, v) => s + Math.abs(v - 0.5), 0) / 4;
    score += Math.round(toneVariance * 30);
    score += Math.min(15, Object.keys(extracted.layout || {}).length * 5);
    return Math.min(100, score);
  }

  _guessCompany(url) {
    try { const h = new URL(url).hostname.replace('www.', '').split('.')[0]; return h.charAt(0).toUpperCase() + h.slice(1); } catch { return 'Unknown'; }
  }

  _report(event, data) {
    if (this.options.onProgress) this.options.onProgress({ event, ...data, timestamp: new Date().toISOString() });
  }
}

module.exports = CrawlerPipeline;
