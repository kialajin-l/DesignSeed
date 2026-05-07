'use strict';

/**
 * CSS 变量提取器
 * 
 * 从 CSS/HTML/JSX 内容中提取 CSS 自定义属性（变量），
 * 解析变量间的引用链，映射到设计 token 语义。
 * 
 * 支持：
 *   - :root / :host / .class 作用域中的 --var 声明
 *   - var(--name) 引用链解析
 *   - 嵌套变量解引用（--a 引用 --b，--b 引用 --c）
 *   - 语义映射（--color-primary → colors.primary）
 */

class CssExtractor {
  constructor() {
    /** 已知的语义映射规则 */
    this.semanticRules = [
      // 颜色
      { pattern: /^--(?:color-)?primary$/i, token: 'colors.primary' },
      { pattern: /^--(?:color-)?secondary$/i, token: 'colors.secondary' },
      { pattern: /^--(?:color-)?accent$/i, token: 'colors.accent' },
      { pattern: /^--(?:color-)?background$/i, token: 'colors.background' },
      { pattern: /^--(?:color-)?surface$/i, token: 'colors.surface' },
      { pattern: /^--(?:color-)?border$/i, token: 'colors.border' },
      { pattern: /^--(?:color-)?text$/i, token: 'colors.text' },
      { pattern: /^--(?:color-)?text-?secondary$/i, token: 'colors.textSecondary' },
      { pattern: /^--(?:color-)?muted$/i, token: 'colors.muted' },
      { pattern: /^--(?:color-)?error$/i, token: 'colors.error' },
      { pattern: /^--(?:color-)?success$/i, token: 'colors.success' },
      { pattern: /^--(?:color-)?warning$/i, token: 'colors.warning' },
      { pattern: /^--(?:color-)?info$/i, token: 'colors.info' },
      // 字体
      { pattern: /^--font-?family$/i, token: 'typography.fontFamily' },
      { pattern: /^--font-?family-?heading$/i, token: 'typography.fontFamilyHeading' },
      { pattern: /^--font-?family-?mono$/i, token: 'typography.fontFamilyMono' },
      { pattern: /^--font-?size$/i, token: 'typography.fontSize' },
      { pattern: /^--line-?height$/i, token: 'typography.lineHeight' },
      { pattern: /^--font-?weight-?normal$/i, token: 'typography.fontWeight.normal' },
      { pattern: /^--font-?weight-?bold$/i, token: 'typography.fontWeight.bold' },
      // 间距
      { pattern: /^--spacing$/i, token: 'spacing.base' },
      { pattern: /^--(?:space|gap)-(\w+)$/i, token: 'spacing.$1' },
      { pattern: /^--radius$/i, token: 'spacing.radius' },
      { pattern: /^--radius-?(\w+)$/i, token: 'spacing.radius.$1' },
      // 阴影
      { pattern: /^--shadow-?(\w+)$/i, token: 'shadows.$1' },
      // 断点
      { pattern: /^--breakpoint-?(\w+)$/i, token: 'breakpoints.$1' },
      // 动画
      { pattern: /^--duration-?(\w+)$/i, token: 'animation.duration.$1' },
      { pattern: /^--ease-?(\w+)$/i, token: 'animation.easing.$1' },
    ];
  }

  /**
   * 从文本内容中提取所有 CSS 变量
   * @param {string} content - CSS/HTML/JSX 文本
   * @returns {Map<string, string>} 变量名 → 原始值
   */
  extractRaw(content) {
    const vars = new Map();

    // 匹配 --var-name: value; 模式
    // 支持 :root, :host, .class, @layer 等作用域
    const declRegex = /--([\w][\w-]*)\s*:\s*([^;{}!]+?)(?:\s*!important)?\s*;/g;
    let match;

    while ((match = declRegex.exec(content)) !== null) {
      const name = `--${match[1]}`;
      const value = match[2].trim();
      // 不覆盖已存在的值（外层作用域优先）
      if (!vars.has(name)) {
        vars.set(name, value);
      }
    }

    // 也匹配 CSS-in-JS / Tailwind 配置中的变量
    // 如 "'--color-primary': '#635BFF'"
    const jsVarRegex = /['"](--[\w][\w-]*)['"]\s*:\s*['"]([^'"]+)['"]/g;
    while ((match = jsVarRegex.exec(content)) !== null) {
      if (!vars.has(match[1])) {
        vars.set(match[1], match[2].trim());
      }
    }

    return vars;
  }

  /**
   * 解析变量引用链，将 var(--name) 替换为实际值
   * @param {Map<string, string>} rawVars - 原始变量表
   * @param {number} [maxDepth=10] - 最大递归深度
   * @returns {Map<string, string>} 解析后的变量表
   */
  resolve(rawVars, maxDepth = 10) {
    const resolved = new Map(rawVars);
    const varRefRegex = /var\(\s*--([\w][\w-]*)\s*(?:,\s*([^)]+))?\)/g;

    for (let depth = 0; depth < maxDepth; depth++) {
      let changed = false;

      for (const [name, value] of resolved) {
        if (!varRefRegex.test(value)) continue;
        varRefRegex.lastIndex = 0;

        let newValue = value;
        let m;
        while ((m = varRefRegex.exec(value)) !== null) {
          const refName = `--${m[1]}`;
          const fallback = m[2] ? m[2].trim() : null;

          if (resolved.has(refName) && refName !== name) {
            newValue = newValue.replace(m[0], resolved.get(refName));
            changed = true;
          } else if (fallback) {
            newValue = newValue.replace(m[0], fallback);
            changed = true;
          }
        }

        if (changed) {
          resolved.set(name, newValue);
        }
      }

      if (!changed) break;
    }

    return resolved;
  }

  /**
   * 将解析后的变量映射到设计 token 语义
   * @param {Map<string, string>} resolvedVars - 解析后的变量表
   * @returns {Object} 设计 token 对象
   */
  mapToTokens(resolvedVars) {
    const tokens = {};

    for (const [name, value] of resolvedVars) {
      for (const rule of this.semanticRules) {
        const match = name.match(rule.pattern);
        if (match) {
          const tokenPath = rule.token.replace(/\$(\d+)/g, (_, i) => match[parseInt(i)] || '');
          this._setNested(tokens, tokenPath, value);
          break;
        }
      }
    }

    return tokens;
  }

  /**
   * 完整流程：从文本提取 → 解析引用 → 映射 token
   * @param {string} content - 文本内容
   * @returns {{ raw: Map, resolved: Map, tokens: Object, stats: Object }}
   */
  extract(content) {
    const raw = this.extractRaw(content);
    const resolved = this.resolve(raw);
    const tokens = this.mapToTokens(resolved);

    // 统计信息
    const withVarRefs = [...raw.values()].filter(v => v.includes('var(')).length;
    const resolvedRefs = withVarRefs - [...resolved.values()].filter(v => v.includes('var(')).length;

    return {
      raw,
      resolved,
      tokens,
      stats: {
        totalVars: raw.size,
        referencesFound: withVarRefs,
        referencesResolved: resolvedRefs,
        semanticTokens: this._countLeaves(tokens),
      },
    };
  }

  /**
   * 从多个来源（CSS 文件、HTML style 标签、JSX）批量提取
   * @param {Array<{content: string, type: string}>} sources
   * @returns {Map<string, string>} 合并后的变量表
   */
  extractBatch(sources) {
    const merged = new Map();

    for (const source of sources) {
      const raw = this.extractRaw(source.content);
      for (const [k, v] of raw) {
        if (!merged.has(k)) {
          merged.set(k, v);
        }
      }
    }

    return this.resolve(merged);
  }

  // ─── 工具方法 ───

  /**
   * 设置嵌套对象属性
   * @private
   */
  _setNested(obj, path, value) {
    const parts = path.split('.');
    let current = obj;

    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]] || typeof current[parts[i]] !== 'object') {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }

    current[parts[parts.length - 1]] = value;
  }

  /**
   * 统计对象叶子节点数量
   * @private
   */
  _countLeaves(obj) {
    let count = 0;
    for (const val of Object.values(obj)) {
      if (typeof val === 'object' && val !== null) {
        count += this._countLeaves(val);
      } else {
        count++;
      }
    }
    return count;
  }
}

module.exports = CssExtractor;
