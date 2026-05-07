'use strict';

/**
 * design.md 导入器
 * 读取 design.md 并转换为渲染引擎可用的设计数据
 */

const { DesignMdParser } = require('./parser');

class DesignMdImporter {
  /**
   * 导入 design.md 并转换为渲染数据
   * @param {string} content - design.md 原始内容
   * @returns {object} 渲染引擎兼容的设计数据
   */
  static import(content) {
    const parsed = DesignMdParser.parse(content);

    const result = {
      meta: {
        name: parsed.frontmatter.name || parsed.title || 'Unknown',
        slug: parsed.frontmatter.slug || 'unknown',
        version: parsed.frontmatter.version || '1.0.0',
        tags: parsed.frontmatter.tags || [],
        source: parsed.frontmatter.source || '',
      },
      colors: DesignMdImporter._importColors(parsed.sections),
      typography: DesignMdImporter._importTypography(parsed.sections),
      spacing: DesignMdImporter._importSpacing(parsed.sections),
      components: DesignMdImporter._importComponents(parsed.sections),
      tone: DesignMdImporter._importTone(parsed.sections),
      anchors: DesignMdImporter._importAnchors(parsed.sections),
      rules: DesignMdImporter._importRules(parsed.sections),
    };

    return result;
  }

  /**
   * 导入色彩数据
   */
  static _importColors(sections) {
    const colorSection = sections['色彩'] || '';
    if (!colorSection) return {};

    const colors = {};

    // 解析所有表格行
    const tables = colorSection.split('\n').filter(l => l.includes('|') && !l.match(/^[\s|:-]+$/));
    for (const line of tables) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2 && cells[0] !== '角色') {
        const role = cells[0];
        const value = cells[1];
        // 只取有效的色值
        if (value && (value.startsWith('#') || value.startsWith('rgb') || value.startsWith('hsl'))) {
          colors[role] = value;
        }
      }
    }

    // 提取 CSS 变量
    const cssBlocks = DesignMdParser.extractCodeBlocks(colorSection, 'css');
    for (const block of cssBlocks) {
      const vars = DesignMdParser.extractCssVars(block);
      for (const [key, value] of Object.entries(vars)) {
        if (!colors[key]) colors[key] = value;
      }
    }

    return colors;
  }

  /**
   * 导入排版数据
   */
  static _importTypography(sections) {
    const typoSection = sections['排版'] || '';
    if (!typoSection) return {};

    const result = {};

    // 提取字体栈
    const cssBlocks = DesignMdParser.extractCodeBlocks(typoSection, 'css');
    for (const block of cssBlocks) {
      const vars = DesignMdParser.extractCssVars(block);
      if (vars['font-sans']) result.fontFamily = vars['font-sans'];
      if (vars['font-mono']) result.fontMono = vars['font-mono'];
    }

    // 提取字号表
    const lines = typoSection.split('\n').filter(l => l.includes('|') && !l.match(/^[\s|:-]+$/));
    const scale = {};
    for (const line of lines) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 4 && cells[0] !== '角色') {
        scale[cells[0]] = {
          size: cells[1],
          lineHeight: cells[2],
          weight: cells[3],
          usage: cells[4] || '',
        };
      }
    }
    if (Object.keys(scale).length) result.scale = scale;

    return result;
  }

  /**
   * 导入间距数据
   */
  static _importSpacing(sections) {
    const spacingSection = sections['间距与圆角'] || sections['间距'] || '';
    if (!spacingSection) return {};

    const result = {};
    const lines = spacingSection.split('\n').filter(l => l.includes('|') && !l.match(/^[\s|:-]+$/));

    let isRadius = false;
    const scale = {};
    const radius = {};

    for (const line of lines) {
      if (line.includes('圆角')) { isRadius = true; continue; }

      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2 && cells[0] !== 'Token') {
        const token = cells[0];
        const value = cells[1];

        if (isRadius) {
          radius[token.replace('radius-', '')] = value;
        } else {
          scale[token.replace('space-', '')] = value;
        }
      }
    }

    if (Object.keys(scale).length) result.scale = scale;
    if (Object.keys(radius).length) result.radius = radius;

    return result;
  }

  /**
   * 导入组件数据
   */
  static _importComponents(sections) {
    const compSection = sections['组件'] || '';
    if (!compSection) return {};

    const components = {};

    // 按 ### 分割组件
    const parts = compSection.split(/^### /m).filter(Boolean);
    for (const part of parts) {
      const nameMatch = part.match(/^(.+)\n/);
      if (!nameMatch) continue;

      const name = nameMatch[1].trim();
      const cssBlocks = DesignMdParser.extractCodeBlocks(part, 'css');
      if (cssBlocks.length) {
        components[name] = cssBlocks.join('\n\n');
      }
    }

    return components;
  }

  /**
   * 导入调性数据
   */
  static _importTone(sections) {
    const toneSection = sections['调性'] || '';
    if (!toneSection) return {};

    const tone = {};
    const lines = toneSection.split('\n').filter(l => l.includes('|') && !l.match(/^[\s|:-]+$/));

    for (const line of lines) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2 && cells[0] !== '维度') {
        const value = parseInt(cells[1]);
        if (!isNaN(value)) {
          tone[cells[0]] = value;
        }
      }
    }

    return tone;
  }

  /**
   * 导入锚点数据
   */
  static _importAnchors(sections) {
    const anchorSection = sections['锚点'] || '';
    if (!anchorSection) return [];

    const anchors = [];
    const lines = anchorSection.split('\n').filter(l => l.includes('|') && !l.match(/^[\s|:-]+$/));

    for (const line of lines) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 2 && cells[0] !== 'prompt 关键词') {
        anchors.push({
          prompt: cells[0],
          preference: cells[1],
          source: cells[2] || '',
        });
      }
    }

    return anchors;
  }

  /**
   * 导入规则数据
   */
  static _importRules(sections) {
    const ruleSection = sections['规则'] || '';
    if (!ruleSection) return [];

    const rules = [];
    const lines = ruleSection.split('\n').filter(l => l.includes('|') && !l.match(/^[\s|:-]+$/));

    for (const line of lines) {
      const cells = line.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 3 && cells[0] !== '规则') {
        rules.push({
          name: cells[0],
          condition: cells[1],
          action: cells[2],
        });
      }
    }

    return rules;
  }

  /**
   * 将导入的数据转换为渲染引擎的 prompt 增强参数
   * @param {object} imported - import() 的返回值
   * @returns {string} 增强后的 prompt 片段
   */
  static toPromptFragment(imported) {
    const parts = [];

    if (imported.meta.name) {
      parts.push(`Design system: ${imported.meta.name}`);
    }

    if (Object.keys(imported.colors).length) {
      const colorList = Object.entries(imported.colors)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      parts.push(`Colors: ${colorList}`);
    }

    if (imported.typography.fontFamily) {
      parts.push(`Font: ${imported.typography.fontFamily}`);
    }

    if (Object.keys(imported.tone).length) {
      const toneList = Object.entries(imported.tone)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');
      parts.push(`Tone: ${toneList}`);
    }

    return parts.join('. ');
  }
}

module.exports = { DesignMdImporter };
