'use strict';

/**
 * design.md 解析器
 * 从 Markdown 文件中提取 YAML frontmatter 和各 section 内容
 */

class DesignMdParser {
  /**
   * 解析 design.md 文件
   * @param {string} content - 文件内容
   * @returns {object} 结构化设计数据
   */
  static parse(content) {
    const result = {
      frontmatter: {},
      title: '',
      description: '',
      sections: {},
      raw: content,
    };

    // 提取 YAML frontmatter
    const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (fmMatch) {
      result.frontmatter = DesignMdParser.parseYaml(fmMatch[1]);
      content = content.slice(fmMatch[0].length).trim();
    }

    // 按 ## 标题分割 sections
    const lines = content.split('\n');
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      const h2Match = line.match(/^## (.+)/);
      if (h2Match) {
        if (currentSection) {
          result.sections[currentSection] = currentContent.join('\n').trim();
        }
        currentSection = h2Match[1].replace(/^[^\w\u4e00-\u9fff]+/, '').trim();
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      } else if (line.trim() && !result.title) {
        const h1Match = line.match(/^# (.+)/);
        if (h1Match) {
          result.title = h1Match[1];
        } else {
          result.title = line.trim();
        }
      } else if (line.trim() && result.title && !currentSection) {
        if (!line.match(/^#/)) {
          result.description += (result.description ? '\n' : '') + line.trim();
        }
      }
    }
    if (currentSection) {
      result.sections[currentSection] = currentContent.join('\n').trim();
    }

    return result;
  }

  /**
   * 简易 YAML 解析器
   */
  static parseYaml(yamlStr) {
    const result = {};
    const lines = yamlStr.split('\n');
    let currentKey = null;
    let currentObj = null;

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const topMatch = trimmed.match(/^(\w[\w-]*):\s*(.*)/);
      if (topMatch) {
        const key = topMatch[1];
        let value = topMatch[2].trim();

        if (value === '' || value === '|' || value === '>') {
          currentKey = key;
          currentObj = {};
          result[key] = currentObj;
        } else {
          result[key] = DesignMdParser.parseYamlValue(value);
          currentKey = null;
          currentObj = null;
        }
        continue;
      }

      if (currentKey && currentObj) {
        const subMatch = trimmed.match(/^(\w[\w-]*):\s*(.*)/);
        if (subMatch) {
          currentObj[subMatch[1]] = DesignMdParser.parseYamlValue(subMatch[2].trim());
        }
      }
    }

    return result;
  }

  /**
   * 解析 YAML 值
   */
  static parseYamlValue(value) {
    if (!value) return '';
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      return value.slice(1, -1);
    }
    if (value.startsWith('[') && value.endsWith(']')) {
      return value.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
    }
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^\d+(\.\d+)?$/.test(value)) return Number(value);
    return value;
  }

  /**
   * 解析 Markdown 表格为对象数组
   */
  static parseTable(tableStr) {
    const lines = tableStr.trim().split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];

    const parseRow = (line) => {
      return line.split('|').map(c => c.trim()).filter(c => c);
    };

    const headers = parseRow(lines[0]);
    const rows = [];

    for (let i = 2; i < lines.length; i++) {
      const cells = parseRow(lines[i]);
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = cells[idx] || '';
      });
      rows.push(row);
    }

    return rows;
  }

  /**
   * 提取 CSS 代码块
   */
  static extractCodeBlocks(sectionStr, lang = 'css') {
    const regex = new RegExp('```' + lang + '\\n([\\s\\S]*?)```', 'g');
    const blocks = [];
    let match;
    while ((match = regex.exec(sectionStr)) !== null) {
      blocks.push(match[1].trim());
    }
    return blocks;
  }

  /**
   * 提取 CSS 变量
   */
  static extractCssVars(cssStr) {
    const vars = {};
    const regex = /--([\w-]+):\s*(.+?);/g;
    let match;
    while ((match = regex.exec(cssStr)) !== null) {
      vars[match[1]] = match[2].trim();
    }
    return vars;
  }
}

module.exports = { DesignMdParser };
