'use strict';

/**
 * DesignParser — 从设计系统文档中提取结构化特征
 *
 * 解析 DESIGN.md 或类似文档，提取颜色、字体、布局、组件、调性等信息。
 * 调性分析基于关键词匹配（未来可接 LLM 增强）。
 */
class DesignParser {
  constructor(options = {}) {
    /** 自定义颜色名称映射 */
    this.namedColors = {
      white: '#FFFFFF',
      black: '#000000',
      red: '#FF0000',
      green: '#008000',
      blue: '#0000FF',
      yellow: '#FFFF00',
      orange: '#FFA500',
      purple: '#800080',
      pink: '#FFC0CB',
      gray: '#808080',
      grey: '#808080',
      cyan: '#00FFFF',
      magenta: '#FF00FF',
      lime: '#00FF00',
      maroon: '#800000',
      navy: '#000080',
      teal: '#008080',
      olive: '#808000',
      silver: '#C0C0C0',
      gold: '#FFD700',
      brown: '#A52A2A',
      coral: '#FF7F50',
      crimson: '#DC143C',
      indigo: '#4B0082',
      ivory: '#FFFFF0',
      khaki: '#F0E68C',
      lavender: '#E6E6FA',
      salmon: '#FA8072',
      sienna: '#A0522D',
      tomato: '#FF6347',
      turquoise: '#40E0D0',
      violet: '#EE82EE',
      wheat: '#F5DEB3',
      chocolate: '#D2691E',
      firebrick: '#B22222',
      skyblue: '#87CEEB',
      slategray: '#708090',
      steelblue: '#4682B4',
      transparent: null,
      ...options.namedColors,
    };

    /** 调性关键词词典 */
    this.toneKeywords = {
      formality: {
        high: [
          '专业', '企业', '金融', '商务', '正式', '严谨', '权威', '高端',
          'professional', 'enterprise', 'corporate', 'formal', 'business',
          'premium', 'luxury', 'executive',
        ],
        low: [
          '活泼', '趣味', '卡通', '可爱', '轻松', '休闲', '游戏', '儿童',
          'playful', 'fun', 'cartoon', 'cute', 'casual', 'game', 'kids',
          'whimsical', 'quirky',
        ],
      },
      warmth: {
        high: [
          '暖', '红', '橙', '黄', '木', '自然', '有机', '温馨', '热情',
          'warm', 'red', 'orange', 'yellow', 'wood', 'natural', 'organic',
          'cozy', 'passionate', 'earthy', 'terracotta',
        ],
        low: [
          '冷', '蓝', '钢', '冰', '科技', '未来', '极客', '机械',
          'cold', 'blue', 'steel', 'ice', 'tech', 'futuristic', 'geek',
          'mechanical', 'industrial', 'metallic',
        ],
      },
      complexity: {
        high: [
          '丰富', '多层', '渐变', '纹理', '装饰', '华丽', '繁复', '细节',
          'rich', 'layered', 'gradient', 'texture', 'decorative', 'ornate',
          'detailed', 'complex', 'elaborate',
        ],
        low: [
          '极简', '留白', '简洁', '干净', '清爽', '素雅', '克制', '呼吸',
          'minimal', 'whitespace', 'clean', 'simple', 'fresh', 'restrained',
          'breathing', 'flat',
        ],
      },
      innovation: {
        high: [
          '前沿', '未来', '实验', '创新', '突破', '颠覆', '先锋', '新锐',
          'cutting-edge', 'futuristic', 'experimental', 'innovative',
          'disruptive', 'avant-garde', 'emerging', 'next-gen',
        ],
        low: [
          '传统', '经典', '标准', '规范', '保守', '稳重', '惯例',
          'traditional', 'classic', 'standard', 'conventional', 'conservative',
          'stable', 'established', 'legacy',
        ],
      },
    };
  }

  // ─── 主入口 ────────────────────────────────────────────────

  /**
   * 解析设计系统文档
   * @param {string} content - 文档文本内容
   * @param {string} source  - 来源标识（URL 或文件路径）
   * @returns {Object} 结构化特征对象
   */
  async parse(content, source = '') {
    const meta = this._extractMeta(content, source);
    const colors = this.extractColors(content);
    const typography = this.extractTypography(content);
    const layout = this.extractLayout(content);
    const components = this._extractComponents(content);
    const tone = this.analyzeTone({ colors, typography, layout, components });
    const philosophy = this._extractPhilosophy(content);

    return {
      meta,
      colors,
      typography,
      layout,
      components,
      tone,
      philosophy,
    };
  }

  // ─── 元数据提取 ────────────────────────────────────────────

  /**
   * 从文档头部提取元数据
   * @private
   */
  _extractMeta(content, source) {
    const lines = content.split('\n').slice(0, 30);

    // 尝试从标题提取公司名
    let company = '';
    for (const line of lines) {
      const h1Match = line.match(/^#\s+(.+)/);
      if (h1Match) {
        company = h1Match[1]
          .replace(/\s*(Design|System|Guidelines|Style\s*Guide|Brand)\s*/gi, '')
          .trim();
        break;
      }
    }

    // 尝试提取更新日期
    let lastUpdated = '';
    const datePatterns = [
      /(?:updated|last\s*(?:updated|modified)|日期|更新)[:\s]*(\d{4}[-/]\d{1,2}[-/]\d{1,2})/i,
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
    ];
    for (const line of lines) {
      for (const pat of datePatterns) {
        const m = line.match(pat);
        if (m) {
          lastUpdated = m[1];
          break;
        }
      }
      if (lastUpdated) break;
    }

    return {
      company,
      url: source,
      lastUpdated,
    };
  }

  // ─── 颜色提取 ──────────────────────────────────────────────

  /**
   * 从文本中提取颜色值
   *
   * 支持格式：
   *   - Hex: #FFF, #FFFFFF, #ffffff, #FFFFFFFF (带 alpha)
   *   - RGB: rgb(255, 255, 255), rgba(255, 255, 255, 0.5)
   *   - HSL: hsl(0, 0%, 100%), hsla(0, 0%, 100%, 0.5)
   *   - 命名颜色: white, black, blue 等
   *   - CSS 变量: --primary-color, --color-blue-500 等
   *
   * @param {string} text
   * @returns {{ primary: string[], secondary: string[], background: string, palette: string[], temperature: number, saturation: number }}
   */
  extractColors(text) {
    const palette = new Set();

    // 1. Hex 颜色
    const hexRegex = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
    let m;
    while ((m = hexRegex.exec(text)) !== null) {
      palette.add(this._normalizeHex(m[0]));
    }

    // 2. RGB / RGBA
    const rgbRegex = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*[\d.]+\s*)?\)/gi;
    while ((m = rgbRegex.exec(text)) !== null) {
      const hex = this._rgbToHex(
        parseInt(m[1], 10),
        parseInt(m[2], 10),
        parseInt(m[3], 10)
      );
      palette.add(hex);
    }

    // 3. HSL / HSLA
    const hslRegex = /hsla?\(\s*(\d{1,3})\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*[\d.]+\s*)?\)/gi;
    while ((m = hslRegex.exec(text)) !== null) {
      const hex = this._hslToHex(
        parseInt(m[1], 10),
        parseFloat(m[2]),
        parseFloat(m[3])
      );
      palette.add(hex);
    }

    // 4. 命名颜色
    const namedColorWords = Object.keys(this.namedColors);
    const namedRegex = new RegExp(
      `\\b(?:${namedColorWords.join('|')})\\b`,
      'gi'
    );
    while ((m = namedRegex.exec(text)) !== null) {
      const hex = this.namedColors[m[0].toLowerCase()];
      if (hex) {
        palette.add(hex);
      }
    }

    // 5. CSS 变量（记录但不解析值）
    const cssVarRegex = /--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8}|rgb|hsl)/gi;
    const cssVars = [];
    while ((m = cssVarRegex.exec(text)) !== null) {
      cssVars.push(`--${m[1]}`);
    }

    // 分类颜色
    const paletteArr = [...palette];
    const primary = this._pickPrimaryColors(paletteArr, text);
    const secondary = this._pickSecondaryColors(paletteArr, primary);
    const background = this._pickBackgroundColor(paletteArr, text);

    // 计算色温和饱和度
    const temperature = this._calcTemperature(paletteArr);
    const saturation = this._calcSaturation(paletteArr);

    return {
      primary,
      secondary,
      background,
      palette: paletteArr,
      temperature,
      saturation,
      cssVars,
    };
  }

  // ─── 字体提取 ──────────────────────────────────────────────

  /**
   * 从文本中提取字体信息
   * @param {string} text
   * @returns {{ fontFamily: string, fontSize: number[], lineHeight: number, fontWeight: Object }}
   */
  extractTypography(text) {
    // 字体族
    let fontFamily = '';
    const fontPatterns = [
      /font-family\s*[:=]\s*['"]?([^'";\n]+)['"]?/gi,
      /字体[族系]?\s*[:=]\s*([^\n]+)/gi,
      /typeface\s*[:=]\s*['"]?([^'";\n]+)['"]?/gi,
    ];
    for (const pat of fontPatterns) {
      const m = pat.exec(text);
      if (m) {
        fontFamily = m[1].trim().replace(/['"]/g, '');
        break;
      }
    }

    // 字号比例
    const fontSize = [];
    const fontSizeRegex = /(?:font-size|字号|text-size)\s*[:=]\s*([\d.]+)\s*(px|rem|em|pt)/gi;
    let m;
    while ((m = fontSizeRegex.exec(text)) !== null) {
      let val = parseFloat(m[1]);
      const unit = m[2].toLowerCase();
      // 统一转为 px（近似）
      if (unit === 'rem' || unit === 'em') val *= 16;
      if (unit === 'pt') val *= 1.333;
      fontSize.push(Math.round(val * 10) / 10);
    }

    // 行高
    let lineHeight = 0;
    const lhRegex = /line-height\s*[:=]\s*([\d.]+)\s*(px|rem|em|%)?/gi;
    const lhMatch = lhRegex.exec(text);
    if (lhMatch) {
      lineHeight = parseFloat(lhMatch[1]);
      if (lhMatch[2] === '%') lineHeight /= 100;
    }

    // 字重
    const fontWeight = {};
    const fwRegex = /(?:font-weight|字重)\s*[:=]\s*(\w+|\d{3})/gi;
    while ((m = fwRegex.exec(text)) !== null) {
      const val = m[1].toLowerCase();
      const numVal = parseInt(val, 10);
      if (!isNaN(numVal)) {
        fontWeight[numVal] = true;
      } else {
        fontWeight[val] = true;
      }
    }

    return {
      fontFamily,
      fontSize: [...new Set(fontSize)].sort((a, b) => a - b),
      lineHeight,
      fontWeight,
    };
  }

  // ─── 布局提取 ──────────────────────────────────────────────

  /**
   * 从文本中提取布局信息
   * @param {string} text
   * @returns {{ gridSystem: string, spacing: number[], breakpoints: Object, alignment: string }}
   */
  extractLayout(text) {
    // 栅格系统
    let gridSystem = '';
    const gridPatterns = [
      /(?:grid|栅格|网格)\s*(?:system|系统)?\s*[:=]\s*([^\n]+)/gi,
      /(\d+)\s*(?:col(?:umn)?s?|列)/gi,
    ];
    for (const pat of gridPatterns) {
      const m = pat.exec(text);
      if (m) {
        gridSystem = m[1].trim();
        break;
      }
    }

    // 间距系统
    const spacing = [];
    const spacingRegex = /(?:spacing|间距|gap)\s*[:=]\s*([\d.]+)\s*(px|rem)?/gi;
    let m;
    while ((m = spacingRegex.exec(text)) !== null) {
      let val = parseFloat(m[1]);
      if (m[2] === 'rem') val *= 16;
      spacing.push(Math.round(val * 10) / 10);
    }

    // 断点
    const breakpoints = {};
    const bpRegex = /(?:breakpoint|断点|screen)\s*(?:\([\w]+\))?\s*[:=]\s*(\d+)\s*px/gi;
    while ((m = bpRegex.exec(text)) !== null) {
      const val = parseInt(m[1], 10);
      if (val <= 480) breakpoints.mobile = val;
      else if (val <= 768) breakpoints.tablet = val;
      else if (val <= 1024) breakpoints.laptop = val;
      else breakpoints.desktop = val;
    }

    // 对齐方式
    let alignment = '';
    const alignRegex = /(?:align(?:ment)?|对齐)\s*[:=]\s*(left|center|right|justify|两端|居中|左对齐|右对齐)/gi;
    const alignMatch = alignRegex.exec(text);
    if (alignMatch) {
      alignment = alignMatch[1].toLowerCase();
    }

    return {
      gridSystem,
      spacing: [...new Set(spacing)].sort((a, b) => a - b),
      breakpoints,
      alignment,
    };
  }

  // ─── 组件提取 ──────────────────────────────────────────────

  /**
   * 从文档中提取组件信息
   * @private
   * @param {string} text
   * @returns {{ buttons: Object, cards: Object, forms: Object, navigation: Object }}
   */
  _extractComponents(text) {
    const components = {
      buttons: {},
      cards: {},
      forms: {},
      navigation: {},
    };

    // 按章节分割
    const sections = text.split(/^#{1,3}\s+/m);

    for (const section of sections) {
      const firstLine = section.split('\n')[0].trim();

      if (/button|按钮|btn/i.test(firstLine)) {
        components.buttons = this._parseComponentSection(section);
      } else if (/card|卡片|panel|面板/i.test(firstLine)) {
        components.cards = this._parseComponentSection(section);
      } else if (/form|表单|input|输入/i.test(firstLine)) {
        components.forms = this._parseComponentSection(section);
      } else if (/nav|导航|menu|菜单|header|页头/i.test(firstLine)) {
        components.navigation = this._parseComponentSection(section);
      }
    }

    return components;
  }

  /**
   * 解析单个组件章节
   * @private
   */
  _parseComponentSection(section) {
    const info = {};

    // 提取圆角
    const radiusMatch = section.match(/(?:border-?radius|圆角)\s*[:=]\s*([\d.]+)\s*(px|rem)/i);
    if (radiusMatch) {
      info.borderRadius = radiusMatch[1] + radiusMatch[2];
    }

    // 提取阴影
    const shadowMatch = section.match(/(?:box-?shadow|阴影)\s*[:=]\s*([^\n]+)/i);
    if (shadowMatch) {
      info.boxShadow = shadowMatch[1].trim();
    }

    // 提取尺寸
    const sizeMatch = section.match(/(?:width|宽度)\s*[:=]\s*([\d.]+)\s*(px|rem|%)/i);
    if (sizeMatch) {
      info.width = sizeMatch[1] + sizeMatch[2];
    }

    // 提取内边距
    const paddingMatch = section.match(/(?:padding|内边距)\s*[:=]\s*([\d.]+)\s*(px|rem)/i);
    if (paddingMatch) {
      info.padding = paddingMatch[1] + paddingMatch[2];
    }

    // 提取描述
    const descMatch = section.match(/(?:description|描述|说明)\s*[:=]\s*(.+)/i);
    if (descMatch) {
      info.description = descMatch[1].trim();
    }

    return info;
  }

  // ─── 调性分析 ──────────────────────────────────────────────

  /**
   * 分析设计调性（基于已解析特征的信号推断）
   *
   * @param {Object} parsedFeatures - 已解析的特征对象
   * @returns {{ formality: number, warmth: number, complexity: number, innovation: number }}
   */
  analyzeTone(parsedFeatures) {
    const { colors, typography, layout } = parsedFeatures;

    // 收集所有可分析的文本信号
    const signals = [];

    // 从颜色推断
    if (colors.temperature > 0.6) signals.push({ category: 'warmth', weight: 0.3 });
    if (colors.temperature < 0.4) signals.push({ category: 'warmth', weight: -0.3 });
    if (colors.saturation > 0.7) signals.push({ category: 'complexity', weight: 0.1 });
    if (colors.saturation < 0.3) signals.push({ category: 'complexity', weight: -0.1 });

    // 从字体推断
    if (typography.fontWeight[700] || typography.fontWeight[900] || typography.fontWeight.bold) {
      signals.push({ category: 'formality', weight: 0.1 });
    }

    // 从布局推断
    if (layout.spacing.length > 5) signals.push({ category: 'complexity', weight: 0.15 });
    if (layout.spacing.length <= 2) signals.push({ category: 'complexity', weight: -0.15 });

    // 基础分（0.5 = 中性）
    const result = {
      formality: 0.5,
      warmth: 0.5,
      complexity: 0.5,
      innovation: 0.5,
    };

    // 应用信号
    for (const sig of signals) {
      if (result[sig.category] !== undefined) {
        result[sig.category] += sig.weight;
      }
    }

    // 限制在 0-1 范围
    for (const key of Object.keys(result)) {
      result[key] = Math.max(0, Math.min(1, Math.round(result[key] * 100) / 100));
    }

    return result;
  }

  /**
   * 基于文本关键词分析调性（增强版，可传入原始文档文本）
   * @param {string} text - 原始文档文本
   * @returns {{ formality: number, warmth: number, complexity: number, innovation: number }}
   */
  analyzeToneFromText(text) {
    const lower = text.toLowerCase();
    const result = {
      formality: 0.5,
      warmth: 0.5,
      complexity: 0.5,
      innovation: 0.5,
    };

    for (const [category, dict] of Object.entries(this.toneKeywords)) {
      let highHits = 0;
      let lowHits = 0;

      for (const kw of dict.high) {
        if (lower.includes(kw.toLowerCase())) highHits++;
      }
      for (const kw of dict.low) {
        if (lower.includes(kw.toLowerCase())) lowHits++;
      }

      const total = highHits + lowHits;
      if (total > 0) {
        // 归一化到 0-1，0.5 为中性
        result[category] = Math.round((highHits / total) * 100) / 100;
      }
    }

    return result;
  }

  // ─── 设计哲学提取 ──────────────────────────────────────────

  /**
   * 从文档中提取设计哲学/理念
   * @private
   */
  _extractPhilosophy(text) {
    const patterns = [
      /(?:philosophy|理念|哲学|原则|principles?)\s*[:：]\s*\n?([\s\S]*?)(?=\n#{1,3}\s|\n---|\Z)/i,
      /(?:design\s*(?:principle|philosophy|belief))\s*[:：]\s*\n?([\s\S]*?)(?=\n#{1,3}\s|\n---|\Z)/i,
    ];

    for (const pat of patterns) {
      const m = text.match(pat);
      if (m) {
        return m[1]
          .split('\n')
          .map((l) => l.replace(/^[-*]\s*/, '').trim())
          .filter((l) => l.length > 0)
          .join('\n')
          .trim();
      }
    }

    return '';
  }

  // ─── 颜色工具方法 ──────────────────────────────────────────

  /**
   * 标准化 Hex 颜色为 6 位大写
   * @private
   */
  _normalizeHex(hex) {
    let h = hex.replace('#', '');

    // 3 位 → 6 位
    if (h.length === 3 || h.length === 4) {
      h = h
        .split('')
        .map((c) => c + c)
        .join('');
    }

    // 去掉 alpha 通道
    if (h.length === 8) {
      h = h.slice(0, 6);
    }

    return '#' + h.toUpperCase();
  }

  /**
   * RGB → Hex
   * @private
   */
  _rgbToHex(r, g, b) {
    const clamp = (v) => Math.max(0, Math.min(255, v));
    return (
      '#' +
      [clamp(r), clamp(g), clamp(b)]
        .map((v) => v.toString(16).padStart(2, '0').toUpperCase())
        .join('')
    );
  }

  /**
   * HSL → Hex
   * @private
   */
  _hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0,
      g = 0,
      b = 0;

    if (h < 60) {
      r = c; g = x; b = 0;
    } else if (h < 120) {
      r = x; g = c; b = 0;
    } else if (h < 180) {
      r = 0; g = c; b = x;
    } else if (h < 240) {
      r = 0; g = x; b = c;
    } else if (h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    return this._rgbToHex(
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    );
  }

  /**
   * Hex → HSL
   * @private
   */
  _hexToHsl(hex) {
    const h = hex.replace('#', '');
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    if (max === min) return { h: 0, s: 0, l };

    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    let hue;
    if (max === r) hue = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) hue = ((b - r) / d + 2) / 6;
    else hue = ((r - g) / d + 4) / 6;

    return { h: hue * 360, s, l };
  }

  /**
   * 从调色板中挑选主色调
   * @private
   */
  _pickPrimaryColors(palette, text) {
    if (palette.length === 0) return [];

    // 查找文档中明确标记为 primary 的颜色
    const primaryFromText = [];
    const primaryRegex = /(?:primary|主色|主题色|品牌色)\s*[:=]?\s*(#[0-9a-fA-F]{3,8})/gi;
    let m;
    while ((m = primaryRegex.exec(text)) !== null) {
      primaryFromText.push(this._normalizeHex(m[1]));
    }

    if (primaryFromText.length > 0) return [...new Set(primaryFromText)];

    // 回退：取前 3 个颜色作为主色
    return palette.slice(0, Math.min(3, palette.length));
  }

  /**
   * 从调色板中挑选辅助色
   * @private
   */
  _pickSecondaryColors(palette, primary) {
    if (palette.length <= primary.length) return [];

    // 回退：取主色之后的颜色
    return palette.slice(primary.length, primary.length + 3);
  }

  /**
   * 推断背景色
   * @private
   */
  _pickBackgroundColor(palette, text) {
    // 查找明确标记
    const bgRegex = /(?:background|bg|背景)\s*[:=]?\s*(#[0-9a-fA-F]{3,8})/gi;
    const m = bgRegex.exec(text);
    if (m) return this._normalizeHex(m[1]);

    // 查找白色或接近白色的作为背景
    for (const hex of palette) {
      const { l } = this._hexToHsl(hex);
      if (l > 0.9) return hex;
    }

    return palette[0] || '';
  }

  /**
   * 计算色板的色温（0=冷，1=暖）
   * @private
   */
  _calcTemperature(palette) {
    if (palette.length === 0) return 0.5;

    let warmCount = 0;
    for (const hex of palette) {
      const { h, s } = this._hexToHsl(hex);
      if (s < 0.1) continue; // 无彩色不计入

      // 暖色范围：0-60 (红橙黄) 和 300-360 (红紫)
      if ((h >= 0 && h <= 60) || h >= 300) {
        warmCount++;
      }
    }

    const coloredCount = palette.filter((hex) => {
      const { s } = this._hexToHsl(hex);
      return s >= 0.1;
    }).length;

    if (coloredCount === 0) return 0.5;
    return Math.round((warmCount / coloredCount) * 100) / 100;
  }

  /**
   * 计算色板的平均饱和度（0-1）
   * @private
   */
  _calcSaturation(palette) {
    if (palette.length === 0) return 0;

    let totalSat = 0;
    for (const hex of palette) {
      const { s } = this._hexToHsl(hex);
      totalSat += s;
    }

    return Math.round((totalSat / palette.length) * 100) / 100;
  }
}

module.exports = DesignParser;
