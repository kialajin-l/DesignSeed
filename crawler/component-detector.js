'use strict';

/**
 * 组件库识别器
 * 
 * 从 HTML/CSS/JSX 内容中识别使用的 UI 组件库和框架，
 * 提取组件模式和设计特征。
 * 
 * 支持识别：
 *   - Tailwind CSS（class 检测）
 *   - Bootstrap（class/变量检测）
 *   - Material UI / MUI（import/className 检测）
 *   - Ant Design / antd（import/className 检测）
 *   - Chakra UI（import/props 检测）
 *   - Shadcn/ui（import 路径检测）
 *   - Radix UI（import 检测）
 *   - Headless UI（import 检测）
 *   - styled-components / Emotion（import 检测）
 *   - CSS Modules（import 模式检测）
 *   - 内联样式（style 属性统计）
 */

class ComponentDetector {
  constructor() {
    /** 已知组件库的检测规则 */
    this.libraries = [
      {
        id: 'tailwind',
        name: 'Tailwind CSS',
        type: 'utility-css',
        confidence: 'high',
        patterns: [
          { type: 'className', regex: /\b(?:flex|grid|gap|p-\d|m-\d|text-\w+-\d|bg-\w+-\d|rounded|shadow|border)\b/ },
          { type: 'className', regex: /\b(?:sm:|md:|lg:|xl:|2xl:)/ },
          { type: 'config', regex: /tailwind\.config|@tailwind/ },
          { type: 'class', regex: /class="[^"]*(?:flex|grid|gap|rounded|shadow)[^"]*"/ },
        ],
        minMatches: 3,
      },
      {
        id: 'bootstrap',
        name: 'Bootstrap',
        type: 'component-lib',
        confidence: 'high',
        patterns: [
          { type: 'className', regex: /\b(?:container|row|col-(?:xs|sm|md|lg|xl)-\d+)\b/ },
          { type: 'className', regex: /\b(?:btn|btn-(?:primary|secondary|danger|warning|success|info|light|dark))\b/ },
          { type: 'className', regex: /\b(?:card|card-body|card-header|card-footer|modal|navbar|nav-link)\b/ },
          { type: 'className', regex: /\b(?:form-control|form-group|form-check|input-group)\b/ },
          { type: 'className', regex: /\b(?:badge|alert|breadcrumb|pagination|dropdown|carousel)\b/ },
          { type: 'variable', regex: /--bs-/ },
          { type: 'import', regex: /bootstrap/ },
        ],
        minMatches: 2,
      },
      {
        id: 'mui',
        name: 'Material UI (MUI)',
        type: 'component-lib',
        confidence: 'high',
        patterns: [
          { type: 'import', regex: /from\s+['"]@mui\/material/ },
          { type: 'import', regex: /from\s+['"]@mui\/icons-material/ },
          { type: 'import', regex: /from\s+['"]@mui\/lab/ },
          { type: 'className', regex: /MuiButton|MuiCard|MuiDialog|MuiTextField|MuiAppBar/ },
          { type: 'sx', regex: /\bsx=\s*\{/ },
        ],
        minMatches: 1,
      },
      {
        id: 'antd',
        name: 'Ant Design',
        type: 'component-lib',
        confidence: 'high',
        patterns: [
          { type: 'import', regex: /from\s+['"]antd/ },
          { type: 'import', regex: /from\s+['"]@ant-design/ },
          { type: 'className', regex: /\bant-(?:btn|card|modal|form|table|menu|layout|space|flex|tag|badge|alert|tooltip|popover|dropdown|tabs|steps|timeline|upload|avatar|divider|spin|skeleton|result|empty|notification|message)\b/ },
          { type: 'cssVar', regex: /--ant-/ },
        ],
        minMatches: 1,
      },
      {
        id: 'chakra',
        name: 'Chakra UI',
        type: 'component-lib',
        confidence: 'high',
        patterns: [
          { type: 'import', regex: /from\s+['"]@chakra-ui/ },
          { type: 'component', regex: /<(?:Box|Flex|Stack|HStack|VStack|Grid|SimpleGrid|Container|Center|Wrap|AbsoluteCenter|Heading|Text|Link|Image|Icon|Button|IconButton|Input|Textarea|Select|Checkbox|Radio|Switch|Slider|Progress|Spinner|Alert|AlertIcon|Badge|Avatar|AvatarGroup|Tag|Tooltip|Popover|Modal|Drawer|Menu|Tabs|Accordion|Breadcrumb|Stepper|Card|Divider|Kbd|Code|Stat|Table)\b/ },
        ],
        minMatches: 1,
      },
      {
        id: 'shadcn',
        name: 'Shadcn/ui',
        type: 'component-lib',
        confidence: 'high',
        patterns: [
          { type: 'import', regex: /from\s+['"]@\/components\/ui\// },
          { type: 'import', regex: /from\s+['"]@\/components\/(button|card|dialog|input|label|select|table|tabs|toast|form|badge|avatar|dropdown|popover|separator|skeleton|slider|switch|textarea|tooltip)/ },
          { type: 'className', regex: /\bborder-?rounded\b/ },
          { type: 'className', regex: /\b(?:ring|focus-visible:ring)\b/ },
        ],
        minMatches: 2,
      },
      {
        id: 'radix',
        name: 'Radix UI',
        type: 'headless',
        confidence: 'high',
        patterns: [
          { type: 'import', regex: /from\s+['"]@radix-ui/ },
        ],
        minMatches: 1,
      },
      {
        id: 'headlessui',
        name: 'Headless UI',
        type: 'headless',
        confidence: 'high',
        patterns: [
          { type: 'import', regex: /from\s+['"]@headlessui/ },
        ],
        minMatches: 1,
      },
      {
        id: 'styled-components',
        name: 'styled-components',
        type: 'css-in-js',
        confidence: 'medium',
        patterns: [
          { type: 'import', regex: /from\s+['"]styled-components/ },
          { type: 'usage', regex: /styled\.\w+`/ },
          { type: 'usage', regex: /styled\(\w+\)`/ },
        ],
        minMatches: 1,
      },
      {
        id: 'emotion',
        name: 'Emotion',
        type: 'css-in-js',
        confidence: 'medium',
        patterns: [
          { type: 'import', regex: /from\s+['"]@emotion\/styled/ },
          { type: 'import', regex: /from\s+['"]@emotion\/react/ },
          { type: 'usage', regex: /css`/ },
        ],
        minMatches: 1,
      },
      {
        id: 'css-modules',
        name: 'CSS Modules',
        type: 'css-methodology',
        confidence: 'medium',
        patterns: [
          { type: 'import', regex: /import\s+\w+\s+from\s+['"][^'"]+\.module\.css['"]/ },
          { type: 'import', regex: /import\s+styles\s+from\s+['"][^'"]+\.module\.css['"]/ },
          { type: 'className', regex: /\bstyles\.\w+/ },
        ],
        minMatches: 1,
      },
      {
        id: 'vanilla-extract',
        name: 'Vanilla Extract',
        type: 'css-in-js',
        confidence: 'high',
        patterns: [
          { type: 'import', regex: /from\s+['"]@vanilla-extract/ },
          { type: 'usage', regex: /style\(\(\)\s*=>\s*\(/ },
        ],
        minMatches: 1,
      },
    ];
  }

  /**
   * 从文本内容中检测使用的组件库
   * @param {string} content - HTML/CSS/JSX 文本
   * @returns {Array<{id: string, name: string, type: string, confidence: string, matches: number, details: Object}>}
   */
  detect(content) {
    const results = [];

    for (const lib of this.libraries) {
      const matchCounts = {};
      let totalMatches = 0;

      for (const pattern of lib.patterns) {
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        const matches = content.match(regex);
        const count = matches ? (Array.isArray(matches) ? matches.length : 1) : 0;

        if (count > 0) {
          matchCounts[pattern.type] = (matchCounts[pattern.type] || 0) + count;
          totalMatches += count;
        }
      }

      if (totalMatches >= lib.minMatches) {
        results.push({
          id: lib.id,
          name: lib.name,
          type: lib.type,
          confidence: lib.confidence,
          matches: totalMatches,
          details: matchCounts,
        });
      }
    }

    // 按匹配数排序
    results.sort((a, b) => b.matches - a.matches);

    return results;
  }

  /**
   * 从文本中提取组件模式（按钮、卡片、表单等）
   * @param {string} content - HTML/JSX 文本
   * @returns {Object} 组件模式统计
   */
  extractPatterns(content) {
    const patterns = {
      buttons: this._countPattern(content, [
        /<(?:button|a)\s[^>]*(?:class|className)=["'][^"']*(?:btn|button|Button)[^"']*["']/gi,
        /<Button\b/gi,
        /<IconButton\b/gi,
      ]),
      cards: this._countPattern(content, [
        /<(?:div|section|article)\s[^>]*(?:class|className)=["'][^"']*(?:card|Card)[^"']*["']/gi,
        /<Card\b/gi,
      ]),
      forms: this._countPattern(content, [
        /<(?:input|textarea|select)\b/gi,
        /<Input\b/gi,
        /<TextField\b/gi,
        /<Textarea\b/gi,
      ]),
      navigation: this._countPattern(content, [
        /<(?:nav|header)\b/gi,
        /<Navbar\b/gi,
        /<AppBar\b/gi,
        /<Nav\b/gi,
      ]),
      modals: this._countPattern(content, [
        /<(?:div|section)\s[^>]*(?:class|className)=["'][^"']*(?:modal|dialog|Modal|Dialog)[^"']*["']/gi,
        /<Modal\b/gi,
        /<Dialog\b/gi,
      ]),
      tables: this._countPattern(content, [
        /<table\b/gi,
        /<Table\b/gi,
      ]),
      lists: this._countPattern(content, [
        /<(?:ul|ol)\b/gi,
        /<List\b/gi,
      ]),
      images: this._countPattern(content, [
        /<img\b/gi,
        /<Image\b/gi,
        /<Avatar\b/gi,
      ]),
      icons: this._countPattern(content, [
        /<(?:svg|i)\b/gi,
        /<Icon\b/gi,
        /<Icon\b/gi,
      ]),
      layout: {
        flex: this._countPattern(content, [/\bflex\b/gi, /<Flex\b/gi, /<Stack\b/gi]),
        grid: this._countPattern(content, [/\bgrid\b/gi, /<Grid\b/gi, /<SimpleGrid\b/gi]),
      },
    };

    return patterns;
  }

  /**
   * 完整分析：检测库 + 提取模式
   * @param {string} content - 文本内容
   * @returns {{ libraries: Array, patterns: Object, summary: Object }}
   */
  analyze(content) {
    const libraries = this.detect(content);
    const patterns = this.extractPatterns(content);

    // 生成摘要
    const primaryLib = libraries[0] || null;
    const totalComponents = Object.values(patterns)
      .filter(v => typeof v === 'number')
      .reduce((sum, v) => sum + v, 0);

    return {
      libraries,
      patterns,
      summary: {
        primaryLibrary: primaryLib?.name || 'None detected',
        libraryCount: libraries.length,
        totalComponentInstances: totalComponents,
        hasDesignSystem: libraries.some(l => l.type === 'component-lib'),
        hasUtilityCss: libraries.some(l => l.type === 'utility-css'),
        hasCssInJs: libraries.some(l => l.type === 'css-in-js'),
        hasHeadless: libraries.some(l => l.type === 'headless'),
      },
    };
  }

  // ─── 工具方法 ───

  /**
   * 统计多个正则的总匹配数
   * @private
   */
  _countPattern(content, regexes) {
    let total = 0;
    for (const regex of regexes) {
      const matches = content.match(regex);
      if (matches) total += matches.length;
    }
    return total;
  }
}

module.exports = ComponentDetector;
