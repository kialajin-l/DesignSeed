/**
 * DesignSeed — 核心渲染器
 * v0.7: 支持风格包 ID、装饰素材自动注入、布局引擎集成
 */

const styles = require('./templates/styles');
const ui = require('./components/ui-components');
const mixer = require('./mixer');
const { RuleEngine } = require('../rules');
const layoutEngine = require('./layout-engine');
const stylePackLoader = require('./style-pack-loader');
const decorations = require('./decorations');
const decorationsExtra = require('./decorations-extra');

const DEFAULT_STYLE = 'minimalism';

function getStyle(styleId) {
  // 1. 内置风格
  if (styles[styleId]) {
    // 如果同时存在同名风格包，合并其 decorations
    try {
      var pack = stylePackLoader.loadPack(styleId);
      if (pack.decorations && pack.decorations.length > 0) {
        styles[styleId].decorations = pack.decorations;
      }
    } catch(e) {}
    return styles[styleId];
  }

  // 2. 混合风格语法 "styleA:styleB:ratio"
  const mix = mixer.parseMixString(styleId);
  if (mix) {
    const a = getStyle(mix.styleA);
    const b = getStyle(mix.styleB);
    if (a && b) return mixer.blend(a, b, { ratio: mix.ratio });
    console.warn("Warning: Mixed style \"" + styleId + "\" has unknown component, falling back.");
  }

  // 3. 风格包 ID（如 "guochao"、"cyberpunk"）
  try {
    const pack = stylePackLoader.loadPack(styleId);
    const packIds = Object.keys(pack.palettes);
    if (packIds.length > 0) {
      const firstPalette = pack.palettes[packIds[0]];
      const fonts = pack.fonts || {};
      const s = stylePackLoader.paletteToRendererStyle(firstPalette, fonts, pack.meta);
      if (pack.decorations && pack.decorations.length > 0) {
        s.decorations = pack.decorations;
      }
      return s;
    }
  } catch (e) {
    // 不是风格包，继续 fallback
  }

  return styles[DEFAULT_STYLE];
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parsePrompt(prompt) {
  const words = prompt.split(/[\s,，、。！？]+/).filter(w => w.length > 1);
  const keywords = words.slice(0, 8);
  return { original: prompt, keywords, sections: keywords.length > 4 ? 3 : 2 };
}

function buildHead(title, style, opts) {
  const c = style.colors || {};
  const t = style.typography || {};
  const bg = (c.background || '#FFFFFF');
  const isGradient = bg.includes('gradient');
  const bgColor = isGradient ? '#0B0E17' : bg;

  // 风格包字体加载
  let fontLinks = '';
  if (opts && opts.packFonts) {
    const seen = new Set();
    opts.packFonts.forEach(function(f) {
      if (f.source === 'google' && !seen.has(f.name)) {
        seen.add(f.name);
        const weights = (f.weights || [400]).join(';');
        fontLinks += `\n  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.name)}:wght@${weights}&display=swap" rel="stylesheet">`;
      }
    });
  }

  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>${fontLinks}
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${t.fontFamily || 'sans-serif'}; background: ${bgColor}; color: ${c.text || '#1A1A1A'}; line-height: ${t.lineHeight || 1.6}; -webkit-font-smoothing: antialiased; }
    img { max-width: 100%; height: auto; }
    a { text-decoration: none; }
  </style>
</head>`;
}

function buildDefaultContent(prompt, style) {
  const parsed = parsePrompt(prompt);
  const c = style.colors || {};
  const l = style.layout || {};
  const t = style.typography || {};

  const links = [
    { text: '首页', href: '#' },
    { text: '功能', href: '#features' },
    { text: '关于', href: '#about' },
    { text: '联系', href: '#contact' },
  ];

  const navHtml = ui.nav(links, style);

  const heroHtml = ui.hero(
    escapeHtml(prompt),
    `基于「${escapeHtml(parsed.keywords.slice(0, 3).join('、'))}」等关键词自动生成的页面设计`,
    '了解更多',
    style
  );

  const featureCards = parsed.keywords.slice(0, 6).map((kw, i) => {
    const descriptions = [
      '精心设计的核心功能模块，提供卓越的用户体验和高效的交互流程。',
      '智能化的数据处理引擎，实时分析并呈现关键业务指标。',
      '灵活的配置系统，支持个性化定制和多场景适配。',
      '安全可靠的底层架构，保障数据隐私和系统稳定性。',
      '简洁直观的操作界面，降低学习成本，提升使用效率。',
      '开放的 API 接口，支持第三方集成和生态扩展。',
    ];
    return ui.card(
      escapeHtml(kw),
      `<p>${descriptions[i % descriptions.length]}</p>`,
      style
    );
  });

  const featuresGrid = ui.grid(featureCards, parsed.sections >= 3 ? 3 : 2, style);

  const statsData = [
    { label: '用户数', value: '10,000+' },
    { label: '满意度', value: '98.5%' },
    { label: '响应时间', value: '<50ms' },
    { label: '可用性', value: '99.99%' },
  ];
  const statsHtml = ui.stats(statsData, style);

  const aboutCards = parsed.keywords.slice(0, 3).map(kw =>
    ui.card(
      `关于 ${escapeHtml(kw)}`,
      `<p>我们致力于打造行业领先的解决方案，通过持续创新和技术突破，为用户创造更大价值。</p>`,
      style
    )
  );
  const aboutGrid = ui.grid(aboutCards, 3, style);

  const footerHtml = ui.footer(
    `© 2026 DesignSeed. 使用 ${style.name || '默认'} 风格生成 · Powered by DesignSeed Engine`,
    style
  );

  return `${navHtml}
${heroHtml}

<section id="features" style="padding: ${l.sectionSpacing || '80px'} ${l.spacing || '20px'};">
  <div style="max-width: ${l.maxWidth || '1200px'}; margin: 0 auto;">
    <h2 style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[4] + 'px' : '28px'}; font-weight: ${t.fontWeight ? t.fontWeight.bold : 700}; color: ${c.primary || '#000'}; text-align: center; margin-bottom: 48px;">核心功能</h2>
    ${featuresGrid}
  </div>
</section>

${statsHtml}

<section id="about" style="padding: ${l.sectionSpacing || '80px'} ${l.spacing || '20px'};">
  <div style="max-width: ${l.maxWidth || '1200px'}; margin: 0 auto;">
    <h2 style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[4] + 'px' : '28px'}; font-weight: ${t.fontWeight ? t.fontWeight.bold : 700}; color: ${c.primary || '#000'}; text-align: center; margin-bottom: 48px;">关于我们</h2>
    ${aboutGrid}
  </div>
</section>

${footerHtml}`;
}

function renderSection(sec, style, opts) {
  switch (sec.type) {
    case 'header':
      return ui.header(sec.title || '', sec.subtitle || '', style);
    case 'hero':
      return ui.hero(sec.title || '', sec.subtitle || '', '了解更多', style);
    case 'card':
      return ui.card(sec.title || '', sec.body || '', style, undefined, opts);
    case 'button':
      return ui.button(sec.text || '点击', sec.variant || 'primary', style);
    case 'grid': {
      var cards = (sec.items || []).map(function(item) {
        return ui.card(item.title || '', item.body || '', style);
      });
      return ui.grid(cards, sec.columns || 2, style);
    }
    case 'stats':
      return ui.stats(sec.items || [], style);
    case 'nav':
      return ui.nav(sec.links || [], style);
    case 'footer':
      return ui.footer(sec.text || '', style);
    default:
      return '';
  }
}

function buildContent(prompt, style, sections) {
  if (!sections || sections.length === 0) {
    return buildDefaultContent(prompt, style);
  }
  return layoutEngine.arrange(sections, style, function(sec, opts) {
    return renderSection(sec, style, opts);
  });
}

/**
 * 为页面内容注入装饰元素
 * @param {string} bodyHtml - 已渲染的页面 body
 * @param {object} style - 风格对象
 * @param {object} opts - { decorations: ['circle','divider-ornate',...], position: 'random'|'header'|'footer' }
 * @returns {string} 带装饰的 body HTML
 */
function injectDecorations(bodyHtml, style, opts) {
  if (!opts || !opts.decorations || opts.decorations.length === 0) return bodyHtml;

  const c = style.colors || {};
  const decoHtml = opts.decorations.map(function(name) {
    // 先查基础装饰，再查扩展装饰
    const fn = decorations.get(name) || getExtraDecoration(name);
    if (!fn) return '';
    return fn({ color: c.primary || '#000', secondary: c.secondary || '#666', accent: c.accent || '#0066CC' });
  }).filter(Boolean).join('\n');

  if (!decoHtml) return bodyHtml;

  // 根据 position 决定插入位置
  const position = opts.position || 'random';
  if (position === 'header') {
    return `<div style="position:relative;overflow:hidden;">${decoHtml}</div>\n${bodyHtml}`;
  } else if (position === 'footer') {
    return `${bodyHtml}\n<div style="position:relative;overflow:hidden;">${decoHtml}</div>`;
  }
  // random: 在 hero 之后插入
  const heroEnd = bodyHtml.indexOf('</section>');
  if (heroEnd > 0) {
    const insertAt = bodyHtml.indexOf('\n', heroEnd) + 1;
    return bodyHtml.slice(0, insertAt) + `<div style="position:relative;overflow:hidden;">${decoHtml}</div>\n` + bodyHtml.slice(insertAt);
  }
  return `<div style="position:relative;overflow:hidden;">${decoHtml}</div>
${bodyHtml}`;
}

/**
 * 从扩展装饰包中按名称查找装饰函数
 */
function getExtraDecoration(name) {
  const extra = decorationsExtra;
  if (!extra) return null;
  const categories = ['cultural', 'stickers', 'frames', 'effects'];
  for (var i = 0; i < categories.length; i++) {
    if (extra[categories[i]] && extra[categories[i]][name]) {
      return extra[categories[i]][name];
    }
  }
  return null;
}

/**
 * 列出所有可用风格（内置 + 风格包）
 */
function listStyles() {
  var result = [];
  Object.keys(styles).filter(function(id) { return id !== "STYLE_INDEX" && !id.startsWith("_"); }).forEach(function(id) {
    result.push({ id: id, name: styles[id].name || id, nameEn: styles[id].nameEn || '', tone: styles[id].tone || {}, source: 'builtin' });
  });
  try {
    var packIds = stylePackLoader.listPacks();
    packIds.forEach(function(id) {
      try {
        var pack = stylePackLoader.loadPack(id);
        var paletteIds = Object.keys(pack.palettes || {});
        paletteIds.forEach(function(pid) {
          var paletteStyle = stylePackLoader.paletteToRendererStyle(pack.palettes[pid], pack.fonts || {}, pack.meta);
          result.push({ id: id + ':' + pid, name: pack.palettes[pid].name || pid, tone: paletteStyle.tone || {}, source: 'pack:' + id });
        });
      } catch (e) {
        result.push({ id: id, name: id, source: 'pack', error: e.message });
      }
    });
  } catch (e) {
  }
  return result;
}

/**
 * 列出所有可混合的风格对
 */
function listMixPairs() {
  var pairs = [];
  var styleIds = Object.keys(styles);
  for (var i = 0; i < styleIds.length; i++) {
    for (var j = i + 1; j < styleIds.length; j++) {
      pairs.push({
        a: styleIds[i],
        b: styleIds[j],
        ratio: 0.5,
        id: styleIds[i] + ':' + styleIds[j]
      });
    }
  }
  return pairs;
}

/**
 * 列出所有可用风格包
 */
function listStylePacks() {
  return stylePackLoader.listPacks().map(function(id) {
    try {
      const pack = stylePackLoader.loadPack(id);
      return { id: id, name: pack.meta.name, description: pack.meta.description, tags: pack.meta.tags };
    } catch (e) {
      return { id: id, error: e.message };
    }
  });
}

/**
 * 核心渲染函数
 */
function render(prompt, opts) {
  opts = opts || {};
  var styleId = opts.style || DEFAULT_STYLE;
  var style = getStyle(styleId);
  var title = opts.title || prompt;
  var packFonts = [];
  try {
    var packId = typeof styleId === 'string' ? styleId.split(':')[0] : null;
    if (packId) {
      var pack = stylePackLoader.loadPack(packId);
      if (pack.fonts) {
        Object.keys(pack.fonts).forEach(function(k) {
          packFonts.push(pack.fonts[k]);
        });
      }
    }
  } catch (e) {
  }
  var headHtml = buildHead(title, style, { packFonts: packFonts });
  var bodyHtml = buildContent(prompt, style, opts.sections);
  var decoList = opts.decorations;
  if ((!decoList || decoList.length === 0) && style.decorations && style.decorations.length > 0) {
    decoList = style.decorations;
  }
  if (decoList && decoList.length > 0) {
    bodyHtml = injectDecorations(bodyHtml, style, { decorations: decoList, position: opts.decoPosition || 'random' });
  }
  return `<!DOCTYPE html>
<html lang="zh-CN">
${headHtml}
<body>
${bodyHtml}
</body>
</html>`;
}

/**
 * 生成 demo 页面
 */
function generateDemo() {
  var styleIds = Object.keys(styles);
  var demoStyle = styleIds.length > 0 ? styleIds[0] : DEFAULT_STYLE;
  return render('DesignSeed Demo — 风格预览', { style: demoStyle, title: 'DesignSeed Demo' });
}

module.exports = { render, generateDemo, listStyles, listMixPairs, listStylePacks, getStyle, injectDecorations };
