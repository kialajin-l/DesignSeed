'use strict';

/**
 * design.md 验证器
 * 检查格式合规性、数据完整性、CSS 有效性
 */

const { DesignMdParser } = require('./parser');

class DesignMdValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * 验证 design.md 内容
   * @param {string} content - design.md 原始内容
   * @returns {object} { valid: boolean, errors: string[], warnings: string[], score: number }
   */
  validate(content) {
    this.errors = [];
    this.warnings = [];

    // 1. 基本结构检查
    this._checkStructure(content);

    // 2. 解析并检查 frontmatter
    const parsed = DesignMdParser.parse(content);
    this._checkFrontmatter(parsed.frontmatter);

    // 3. 检查各 section
    this._checkSections(parsed.sections);

    // 4. 检查色彩数据
    if (parsed.sections['色彩']) {
      this._checkColors(parsed.sections['色彩']);
    }

    // 5. 检查排版数据
    if (parsed.sections['排版']) {
      this._checkTypography(parsed.sections['排版']);
    }

    // 6. 检查 CSS 代码块
    this._checkCssBlocks(parsed.sections);

    // 计算分数 (0-100)
    const score = this._calculateScore(parsed);

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings,
      score,
      parsed,
    };
  }

  _checkStructure(content) {
    if (!content || !content.trim()) {
      this.errors.push('文件为空');
      return;
    }

    // 检查 frontmatter
    if (!content.match(/^---\n/)) {
      this.errors.push('缺少 YAML frontmatter（文件应以 --- 开头）');
    }

    // 检查标题
    if (!content.match(/^---[\s\S]*?---\s*\n# /)) {
      this.warnings.push('缺少一级标题（# 标题）');
    }

    // 检查至少有一个 section
    if (!content.match(/^## /m)) {
      this.warnings.push('缺少二级标题（## Section）');
    }
  }

  _checkFrontmatter(fm) {
    if (!fm || Object.keys(fm).length === 0) {
      this.errors.push('frontmatter 为空');
      return;
    }

    const required = ['name', 'slug', 'version'];
    for (const field of required) {
      if (!fm[field]) {
        this.errors.push(`frontmatter 缺少必需字段: ${field}`);
      }
    }

    if (fm.version && !/^\d+\.\d+\.\d+/.test(String(fm.version))) {
      this.warnings.push(`version 格式不规范: "${fm.version}"（建议 semver 格式）`);
    }

    if (fm.slug && !/^[a-z0-9-]+$/.test(String(fm.slug))) {
      this.warnings.push(`slug 包含特殊字符: "${fm.slug}"（建议只用小写字母、数字和连字符）`);
    }
  }

  _checkSections(sections) {
    const sectionNames = Object.keys(sections);

    if (sectionNames.length === 0) {
      this.warnings.push('没有任何 section 内容');
      return;
    }

    // 检查必需 section
    const hasColors = sectionNames.some(n => n.includes('色彩'));
    if (!hasColors) {
      this.warnings.push('缺少"色彩" section（推荐添加）');
    }

    // 检查 section 命名规范
    for (const name of sectionNames) {
      if (name.length > 20) {
        this.warnings.push(`section 标题过长: "${name}"`);
      }
    }
  }

  _checkColors(colorSection) {
    // 检查是否有表格
    const tables = colorSection.match(/\|.+\|.+\|.+/g);
    if (!tables || tables.length === 0) {
      this.warnings.push('色彩 section 缺少表格数据');
      return;
    }

    // 检查色值格式
    const colorValues = colorSection.match(/\|[^|]*#[0-9a-fA-F]{3,8}[^|]*\|/g) || [];
    for (const match of colorValues) {
      const hex = match.match(/#[0-9a-fA-F]{3,8}/);
      if (hex) {
        const val = hex[0];
        if (val.length !== 4 && val.length !== 5 && val.length !== 7 && val.length !== 9) {
          this.warnings.push(`色值格式不标准: ${val}（建议 3/4/6/8 位 hex）`);
        }
      }
    }
  }

  _checkTypography(typoSection) {
    // 检查是否有字体定义
    if (!typoSection.includes('font') && !typoSection.includes('字体')) {
      this.warnings.push('排版 section 缺少字体定义');
    }

    // 检查是否有字号表
    if (!typoSection.includes('|') || typoSection.split('|').length < 6) {
      this.warnings.push('排版 section 缺少字号表格');
    }
  }

  _checkCssBlocks(sections) {
    for (const [name, content] of Object.entries(sections)) {
      const cssBlocks = DesignMdParser.extractCodeBlocks(content, 'css');
      for (const block of cssBlocks) {
        // 检查是否使用了 CSS 变量（推荐）
        if (!block.includes('var(--')) {
          this.warnings.push(`"${name}" 中的 CSS 代码块未使用 CSS 变量（推荐使用）`);
        }

        // 检查基本语法（简单检查括号匹配）
        const openBraces = (block.match(/{/g) || []).length;
        const closeBraces = (block.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
          this.errors.push(`"${name}" 中的 CSS 代码块括号不匹配`);
        }
      }
    }
  }

  _calculateScore(parsed) {
    let score = 0;

    // frontmatter 完整性 (30 分)
    const fm = parsed.frontmatter;
    if (fm.name) score += 10;
    if (fm.slug) score += 5;
    if (fm.version) score += 5;
    if (fm.tags && fm.tags.length) score += 5;
    if (fm.source) score += 5;

    // section 覆盖度 (40 分)
    const sectionNames = Object.keys(parsed.sections);
    const sectionScores = {
      '色彩': 15,
      '排版': 8,
      '间距': 7,
      '组件': 5,
      '布局': 3,
      '调性': 2,
    };

    for (const [key, points] of Object.entries(sectionScores)) {
      if (sectionNames.some(n => n.includes(key))) {
        score += points;
      }
    }

    // 数据质量 (30 分)
    for (const [name, content] of Object.entries(parsed.sections)) {
      // 有表格
      if (content.includes('|') && content.split('\n').filter(l => l.includes('|')).length >= 3) {
        score += 5;
      }
      // 有 CSS 代码块
      if (content.includes('```css')) {
        score += 5;
      }
      // 有 CSS 变量
      if (content.includes('var(--')) {
        score += 5;
      }
    }

    // 扣分
    score -= this.errors.length * 10;
    score -= this.warnings.length * 2;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * 快速验证（只返回是否通过）
   */
  static quickCheck(content) {
    const validator = new DesignMdValidator();
    const result = validator.validate(content);
    return result.valid;
  }

  /**
   * 格式化验证报告
   */
  static formatReport(result) {
    const lines = [];
    lines.push(`📊 验证报告 — 得分: ${result.score}/100`);
    lines.push('');

    if (result.valid) {
      lines.push('✅ 验证通过');
    } else {
      lines.push('❌ 验证失败');
    }

    if (result.errors.length > 0) {
      lines.push('');
      lines.push('🔴 错误:');
      for (const err of result.errors) {
        lines.push(`  - ${err}`);
      }
    }

    if (result.warnings.length > 0) {
      lines.push('');
      lines.push('🟡 警告:');
      for (const warn of result.warnings) {
        lines.push(`  - ${warn}`);
      }
    }

    return lines.join('\n');
  }
}

module.exports = { DesignMdValidator };
