'use strict';

/**
 * design.md 生成器
 * 从种子数据、爬虫结果、用户偏好生成标准 design.md 文件
 */

const seedDesignSystems = require('../engine/seed-design-systems');

class DesignMdGenerator {
  /**
   * 获取所有种子设计系统的 ID 列表
   */
  static getSeedIds() {
    // 种子数据可能是数组或对象
    if (Array.isArray(seedDesignSystems)) {
      return seedDesignSystems.map((s, i) => s.nameEn?.toLowerCase() || s.name?.toLowerCase() || String(i));
    }
    return Object.keys(seedDesignSystems);
  }

  /**
   * 根据 ID 查找种子设计系统
   */
  static findSeed(systemId) {
    const id = systemId.toLowerCase();
    if (Array.isArray(seedDesignSystems)) {
      return seedDesignSystems.find(s =>
        (s.nameEn && s.nameEn.toLowerCase() === id) ||
        (s.name && s.name.toLowerCase() === id)
      );
    }
    return seedDesignSystems[systemId] || seedDesignSystems[id];
  }

  /**
   * 从种子数据生成 design.md
   * @param {string} systemId - 种子设计系统 ID（如 'stripe', 'linear'）
   * @returns {string} design.md 内容
   */
  static fromSeed(systemId) {
    const system = DesignMdGenerator.findSeed(systemId);
    if (!system) {
      const available = DesignMdGenerator.getSeedIds().join(', ');
      throw new Error(`Unknown design system: ${systemId}. Available: ${available}`);
    }

    return DesignMdGenerator.fromDesignData({
      name: system.name || systemId,
      slug: systemId,
      description: system.description || '',
      colors: system.colors || {},
      typography: system.typography || {},
      spacing: system.spacing || {},
      components: system.components || {},
      tone: system.tone || {},
      tags: system.tags || [],
      source: system.url || system.source || '',
    });
  }

  /**
   * 从爬虫结果生成 design.md
   * @param {object} crawlResult - 爬虫提取的设计数据
   * @returns {string} design.md 内容
   */
  static fromCrawlResult(crawlResult) {
    const data = {
      name: crawlResult.name || 'Unknown Design System',
      slug: DesignMdGenerator.toSlug(crawlResult.name || 'unknown'),
      description: crawlResult.description || '',
      colors: {},
      typography: {},
      spacing: {},
      components: {},
      tone: {},
      tags: crawlResult.tags || [],
      source: crawlResult.url || '',
    };

    // 转换爬虫提取的色彩
    if (crawlResult.colors) {
      if (crawlResult.colors.primary) data.colors.primary = crawlResult.colors.primary;
      if (crawlResult.colors.background) data.colors.background = crawlResult.colors.background;
      if (crawlResult.colors.text) data.colors.text = crawlResult.colors.text;
      if (crawlResult.colors.accent) data.colors.accent = crawlResult.colors.accent;
    }

    // 转换爬虫提取的排版
    if (crawlResult.typography) {
      data.typography = crawlResult.typography;
    }

    // 转换调性
    if (crawlResult.tone) {
      data.tone = crawlResult.tone;
    }

    return DesignMdGenerator.fromDesignData(data);
  }

  /**
   * 从结构化数据生成 design.md
   * @param {object} data - 设计数据
   * @returns {string} design.md 内容
   */
  static fromDesignData(data) {
    const now = new Date().toISOString().split('T')[0];
    const lines = [];

    // YAML Frontmatter
    lines.push('---');
    lines.push(`name: "${data.name}"`);
    lines.push(`slug: "${data.slug}"`);
    lines.push(`version: "1.0.0"`);
    lines.push(`author: "DesignSeed"`);
    lines.push(`license: "MIT"`);
    if (data.tags && data.tags.length) {
      lines.push(`tags: [${data.tags.map(t => `"${t}"`).join(', ')}]`);
    }
    if (data.source) {
      lines.push(`source: "${data.source}"`);
    }
    lines.push(`created: "${now}"`);
    lines.push(`updated: "${now}"`);
    lines.push('---');
    lines.push('');

    // 标题和描述
    lines.push(`# ${data.name}`);
    lines.push('');
    if (data.description) {
      lines.push(data.description);
      lines.push('');
    }

    // 色彩 section
    if (data.colors && Object.keys(data.colors).length) {
      lines.push('## 🎨 色彩');
      lines.push('');
      lines.push('### 主色调');
      lines.push('| 角色 | 色值 | 用途 |');
      lines.push('|------|------|------|');

      const colorMap = {
        primary: '主按钮、链接、强调',
        secondary: '次要按钮、辅助元素',
        accent: '高亮、提示',
        background: '页面背景',
        surface: '卡片、面板',
        text: '主要文字',
        border: '边框、分割线',
        success: '成功状态',
        warning: '警告状态',
        error: '错误状态',
      };

      for (const [role, value] of Object.entries(data.colors)) {
        const usage = colorMap[role] || '通用';
        lines.push(`| ${role} | ${value} | ${usage} |`);
      }
      lines.push('');
    }

    // 排版 section
    if (data.typography && Object.keys(data.typography).length) {
      lines.push('## 📐 排版');
      lines.push('');

      if (data.typography.fontFamily) {
        lines.push('### 字体栈');
        lines.push('```css');
        lines.push(`--font-sans: ${data.typography.fontFamily};`);
        lines.push('```');
        lines.push('');
      }

      if (data.typography.scale) {
        lines.push('### 字号系统');
        lines.push('| 角色 | 大小 | 行高 | 字重 | 用途 |');
        lines.push('|------|------|------|------|------|');

        const usageMap = {
          display: '首屏大标题',
          h1: '页面标题',
          h2: '章节标题',
          h3: '子标题',
          body: '正文',
          small: '辅助文字',
          caption: '标注',
        };

        for (const [role, spec] of Object.entries(data.typography.scale)) {
          const size = spec.size || spec;
          const leading = spec.leading || spec.lineHeight || '1.5';
          const weight = spec.weight || '400';
          const usage = usageMap[role] || '通用';
          lines.push(`| ${role} | ${size} | ${leading} | ${weight} | ${usage} |`);
        }
        lines.push('');
      }
    }

    // 间距与圆角
    if (data.spacing && Object.keys(data.spacing).length) {
      lines.push('## 📏 间距与圆角');
      lines.push('');

      if (data.spacing.scale) {
        lines.push('### 间距比例');
        lines.push('| Token | 值 | 用途 |');
        lines.push('|-------|-----|------|');

        const spacingUsage = {
          xs: '紧凑间距',
          sm: '元素内间距',
          md: '组件间距',
          lg: '区块间距',
          xl: '大区块间距',
          '2xl': '页面级间距',
        };

        for (const [token, value] of Object.entries(data.spacing.scale)) {
          const usage = spacingUsage[token] || '通用';
          lines.push(`| space-${token} | ${value} | ${usage} |`);
        }
        lines.push('');
      }

      if (data.spacing.radius) {
        lines.push('### 圆角');
        lines.push('| Token | 值 | 用途 |');
        lines.push('|-------|-----|------|');

        const radiusUsage = {
          sm: '小按钮、标签',
          md: '卡片、输入框',
          lg: '弹窗、面板',
          full: '头像、徽章',
        };

        for (const [token, value] of Object.entries(data.spacing.radius)) {
          const usage = radiusUsage[token] || '通用';
          lines.push(`| radius-${token} | ${value} | ${usage} |`);
        }
        lines.push('');
      }
    }

    // 组件
    if (data.components && Object.keys(data.components).length) {
      lines.push('## 🧩 组件');
      lines.push('');

      for (const [name, css] of Object.entries(data.components)) {
        lines.push(`### ${name}`);
        lines.push('```css');
        lines.push(typeof css === 'string' ? css : JSON.stringify(css, null, 2));
        lines.push('```');
        lines.push('');
      }
    }

    // 调性
    if (data.tone && Object.keys(data.tone).length) {
      lines.push('## 🎭 调性');
      lines.push('');
      lines.push('| 维度 | 值（0-100） | 说明 |');
      lines.push('|------|------------|------|');

      const toneDesc = {
        formality: '正式程度',
        warmth: '温暖程度',
        complexity: '复杂程度',
        innovation: '创新程度',
        density: '信息密度',
      };

      for (const [dim, val] of Object.entries(data.tone)) {
        const desc = toneDesc[dim] || dim;
        lines.push(`| ${dim} | ${val} | ${desc} |`);
      }
      lines.push('');
    }

    // 变更日志
    lines.push('## 📝 变更日志');
    lines.push('');
    lines.push('| 版本 | 日期 | 变更 |');
    lines.push('|------|------|------|');
    lines.push(`| 1.0.0 | ${now} | 初始版本 |`);
    lines.push('');

    return lines.join('\n');
  }

  /**
   * 从混合结果生成 design.md
   * @param {object} mixed - 混合后的设计数据
   * @param {string[]} sources - 来源系统名称
   * @returns {string} design.md 内容
   */
  static fromMixed(mixed, sources = []) {
    const data = {
      name: `Mixed: ${sources.join(' + ')}`,
      slug: DesignMdGenerator.toSlug(`mixed-${sources.join('-')}`),
      description: `由 ${sources.join('、')} 混合生成的设计系统`,
      colors: mixed.colors || {},
      typography: mixed.typography || {},
      spacing: mixed.spacing || {},
      components: mixed.components || {},
      tone: mixed.tone || {},
      tags: ['mixed', ...sources.map(s => s.toLowerCase())],
      source: '',
    };

    return DesignMdGenerator.fromDesignData(data);
  }

  /**
   * 字符串转 slug
   */
  static toSlug(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

module.exports = { DesignMdGenerator };
