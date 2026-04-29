'use strict';

const fs = require('fs');
const path = require('path');

class RuleEngine {
  constructor(options = {}) {
    this.rules = [];
    this.customRules = [];
    this.onViolation = options.onViolation || null;
  }

  loadDefaults() {
    const defaultsPath = path.join(__dirname, 'defaults.json');
    const raw = fs.readFileSync(defaultsPath, 'utf8');
    const data = JSON.parse(raw);
    if (data.rules && Array.isArray(data.rules)) {
      this.rules.push(...data.rules);
    }
    return this;
  }

  loadCustomRules(rulesArray) {
    if (!Array.isArray(rulesArray)) return this;
    for (const rule of rulesArray) {
      this.addCustomRule(rule);
    }
    return this;
  }

  addCustomRule(rule) {
    if (!rule || !rule.id) return false;
    const exists = this.customRules.some(r => r.id === rule.id);
    if (exists) return false;
    const customRule = { ...rule, source: rule.source || 'custom' };
    this.customRules.push(customRule);
    this.rules.push(customRule);
    return true;
  }

  removeCustomRule(ruleId) {
    const idx = this.customRules.findIndex(r => r.id === ruleId);
    if (idx === -1) return false;
    this.customRules.splice(idx, 1);
    const mainIdx = this.rules.findIndex(r => r.id === ruleId);
    if (mainIdx !== -1) this.rules.splice(mainIdx, 1);
    return true;
  }

  getAllRules() {
    return [...this.rules];
  }

  validate(designOutput) {
    const result = { valid: true, violations: [], warnings: [], autoFixes: [] };
    if (!designOutput) {
      result.valid = false;
      result.violations.push({
        ruleId: '__no_input__',
        severity: 'critical',
        message: 'designOutput 为空',
        suggestion: '请提供有效的设计输出对象',
      });
      return result;
    }
    const css = designOutput.css || {};
    for (const rule of this.rules) {
      const checkResult = this._checkRule(rule, css);
      if (!checkResult) continue;
      if (checkResult.type === 'violation') {
        result.violations.push({
          ruleId: rule.id,
          severity: rule.type === 'hard_limit' ? 'error' : 'warning',
          message: checkResult.message || rule.message,
          suggestion: checkResult.suggestion || '',
        });
        result.valid = false;
        if (this.onViolation) {
          this.onViolation({
            ruleId: rule.id,
            severity: rule.type === 'hard_limit' ? 'error' : 'warning',
            message: checkResult.message || rule.message,
          });
        }
      } else if (checkResult.type === 'warning') {
        result.warnings.push({
          ruleId: rule.id,
          message: checkResult.message || rule.message,
        });
      } else if (checkResult.type === 'autoFix') {
        result.autoFixes.push({
          ruleId: rule.id,
          dimension: rule.dimension,
          original: checkResult.original,
          fixed: checkResult.fixed,
        });
      }
    }
    return result;
  }

  autoFix(designOutput, violations) {
    if (!designOutput || !Array.isArray(violations)) return designOutput;
    for (const fix of violations) {
      if (fix.dimension === 'font_size_px' && designOutput.css && designOutput.css.fontSizes) {
        designOutput.css.fontSizes = designOutput.css.fontSizes.map(size =>
          size < fix.fixed ? fix.fixed : size
        );
      }
    }
    return designOutput;
  }

  _checkRule(rule, css) {
    switch (rule.dimension) {
      case 'contrast_ratio': return this._checkContrast(css, rule);
      case 'font_size_px': return this._checkFontSize(css, rule);
      case 'color_count': return this._checkColorCount(css, rule);
      case 'color_combo': return this._checkColorCombo(css, rule);
      case 'spacing_scale': return this._checkSpacing(css, rule);
      case 'border_radius': return this._checkBorderRadius(css, rule);
      case 'line_length_ch': return this._checkLineLength(css, rule);
      default: return null;
    }
  }

  _checkContrast(css, rule) {
    const pairs = css.contrastPairs;
    if (!pairs || !Array.isArray(pairs) || pairs.length === 0) return null;
    for (const pair of pairs) {
      const fg = this._parseColor(pair.foreground);
      const bg = this._parseColor(pair.background);
      if (!fg || !bg) continue;
      const ratio = this._contrastRatio(fg, bg);
      if (rule.condition === 'less_than' && ratio < rule.threshold) {
        if (rule.action === 'reject') {
          return {
            type: 'violation',
            message: rule.message + '（实际 ' + ratio.toFixed(2) + ':1，前景 ' + pair.foreground + ' / 背景 ' + pair.background + '）',
            suggestion: '建议调整前景或背景颜色，使对比度达到 ' + rule.threshold + ':1 以上',
          };
        }
      }
    }
    return null;
  }

  _checkFontSize(css, rule) {
    const sizes = css.fontSizes;
    if (!sizes || !Array.isArray(sizes) || sizes.length === 0) return null;
    for (const size of sizes) {
      if (typeof size !== 'number') continue;
      if (rule.condition === 'less_than' && size < rule.threshold) {
        if (rule.action === 'adjust') {
          return { type: 'autoFix', original: size, fixed: rule.adjustTo || rule.threshold, message: rule.message };
        }
        if (rule.action === 'reject' || rule.action === 'warn') {
          return {
            type: rule.action === 'reject' ? 'violation' : 'warning',
            message: rule.message + '（实际 ' + size + 'px）',
            suggestion: '建议将字号调整为 ' + rule.threshold + 'px 或更大',
          };
        }
      }
    }
    return null;
  }

  _checkColorCount(css, rule) {
    const colors = css.colors;
    if (!colors || !Array.isArray(colors) || colors.length === 0) return null;
    const uniqueColors = [...new Set(colors.map(c => c.toUpperCase()))];
    const count = uniqueColors.length;
    if (rule.condition === 'greater_than' && count > rule.threshold) {
      return {
        type: rule.action === 'reject' ? 'violation' : 'warning',
        message: rule.message + '（实际 ' + count + ' 种：' + uniqueColors.slice(0, 10).join(', ') + (count > 10 ? '...' : '') + '）',
        suggestion: '建议精简为 ' + rule.threshold + ' 种以内的主色调',
      };
    }
    return null;
  }

  _checkColorCombo(css, rule) {
    const colors = css.colors;
    if (!colors || !Array.isArray(colors) || colors.length < 2) return null;
    const normalized = colors.map(c => this._normalizeHex(c).toUpperCase());
    const blacklist = rule.blacklist || [];
    for (let i = 0; i < normalized.length; i++) {
      for (let j = i + 1; j < normalized.length; j++) {
        for (const combo of blacklist) {
          const p = this._normalizeHex(combo.primary).toUpperCase();
          const s = this._normalizeHex(combo.secondary).toUpperCase();
          if ((normalized[i] === p && normalized[j] === s) || (normalized[i] === s && normalized[j] === p)) {
            return {
              type: 'violation',
              message: rule.message + '（' + normalized[i] + ' + ' + normalized[j] + '）',
              suggestion: '建议更换其中一个颜色以避免视觉冲突',
            };
          }
        }
      }
    }
    return null;
  }

  _checkSpacing(css, rule) {
    const spacings = css.spacings;
    if (!spacings || !Array.isArray(spacings) || spacings.length === 0) return null;
    const scale = rule.scale || [];
    if (scale.length === 0) return null;
    const offScale = spacings.filter(s => !scale.includes(s));
    if (offScale.length > 0) {
      return {
        type: 'warning',
        message: rule.message + '（不在比例尺中的值：' + [...new Set(offScale)].join(', ') + 'px）',
        suggestion: '建议使用比例尺中的值：' + scale.join(', ') + 'px',
      };
    }
    return null;
  }

  _checkBorderRadius(css, rule) {
    const radii = css.borderRadii;
    if (!radii || !Array.isArray(radii) || radii.length === 0) return null;
    const scale = rule.scale || [];
    if (scale.length === 0) return null;
    const offScale = radii.filter(r => !scale.includes(r));
    if (offScale.length > 0) {
      return {
        type: 'warning',
        message: rule.message + '（不在比例尺中的值：' + [...new Set(offScale)].join(', ') + 'px）',
        suggestion: '建议使用比例尺中的值：' + scale.join(', ') + 'px',
      };
    }
    return null;
  }

  _checkLineLength(css, rule) {
    const lineLength = css.lineLength;
    if (typeof lineLength !== 'number') return null;
    if (rule.condition === 'greater_than' && lineLength > rule.threshold) {
      return {
        type: 'warning',
        message: rule.message + '（实际 ' + lineLength + ' 字符）',
        suggestion: '建议将行宽控制在 ' + rule.threshold + ' 字符以内',
      };
    }
    return null;
  }

  _parseColor(colorStr) {
    if (!colorStr || typeof colorStr !== 'string') return null;
    const str = colorStr.trim();
    const hexMatch = str.match(/^#([0-9a-fA-F]{3,8})$/);
    if (hexMatch) {
      let hex = hexMatch[1];
      if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      if (hex.length >= 6) {
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
        };
      }
      return null;
    }
    const rgbMatch = str.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/);
    if (rgbMatch) {
      return {
        r: Math.min(255, parseInt(rgbMatch[1], 10)),
        g: Math.min(255, parseInt(rgbMatch[2], 10)),
        b: Math.min(255, parseInt(rgbMatch[3], 10)),
      };
    }
    const namedColors = {
      'white': { r: 255, g: 255, b: 255 },
      'black': { r: 0, g: 0, b: 0 },
      'red': { r: 255, g: 0, b: 0 },
      'green': { r: 0, g: 128, b: 0 },
      'blue': { r: 0, g: 0, b: 255 },
      'yellow': { r: 255, g: 255, b: 0 },
      'cyan': { r: 0, g: 255, b: 255 },
      'magenta': { r: 255, g: 0, b: 255 },
      'gray': { r: 128, g: 128, b: 128 },
      'grey': { r: 128, g: 128, b: 128 },
      'transparent': null,
    };
    return namedColors[str.toLowerCase()] || null;
  }

  _normalizeHex(colorStr) {
    const parsed = this._parseColor(colorStr);
    if (!parsed) return colorStr;
    const toHex = (n) => n.toString(16).padStart(2, '0');
    return '#' + toHex(parsed.r) + toHex(parsed.g) + toHex(parsed.b);
  }

  _relativeLuminance(color) {
    const linearize = (channel) => {
      const sRGB = channel / 255;
      return sRGB <= 0.04045
        ? sRGB / 12.92
        : Math.pow((sRGB + 0.055) / 1.055, 2.4);
    };
    const R = linearize(color.r);
    const G = linearize(color.g);
    const B = linearize(color.b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }

  _contrastRatio(color1, color2) {
    const l1 = this._relativeLuminance(color1);
    const l2 = this._relativeLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }
}

module.exports = RuleEngine;
