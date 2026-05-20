let _renderer = null;
function getRenderer() {
  if (!_renderer) _renderer = require("./renderer");
  return _renderer;
}

/**
 * DesignSeed — 风格混合引擎
 * 在向量空间中对两种风格进行插值，生成全新的混合风格
 */

const styles = require('./templates/styles');

// ─── 颜色工具 ────────────────────────────────────────────────

function parseColor(str) {
  if (!str || typeof str !== 'string') return null;
  const hex = str.match(/^#([0-9a-f]{3,8})$/i);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (h.length === 6) return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16), a: 1 };
    if (h.length === 8) return { r: parseInt(h.slice(0,2),16), g: parseInt(h.slice(2,4),16), b: parseInt(h.slice(4,6),16), a: parseInt(h.slice(6,8),16)/255 };
  }
  const rgb = str.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)/);
  if (rgb) return { r: +rgb[1], g: +rgb[2], b: +rgb[3], a: rgb[4] !== undefined ? +rgb[4] : 1 };
  return null;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

function rgbToHex(r, g, b) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function blendColors(colorA, colorB, t) {
  const a = parseColor(colorA);
  const b = parseColor(colorB);
  if (!a && !b) return t < 0.5 ? colorA : colorB;
  if (!a) return colorB;
  if (!b) return colorA;
  const hslA = rgbToHsl(a.r, a.g, a.b);
  const hslB = rgbToHsl(b.r, b.g, b.b);
  let dh = hslB.h - hslA.h;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  const h = (hslA.h + dh * t + 360) % 360;
  const s = hslA.s + (hslB.s - hslA.s) * t;
  const l = hslA.l + (hslB.l - hslA.l) * t;
  const alpha = a.a + (b.a - a.a) * t;
  const rgb = hslToRgb(h, s, l);
  if (alpha < 1) return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + alpha.toFixed(2) + ')';
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

// ─── 数值工具 ────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t; }
function lerpRound(a, b, t) { return Math.round(lerp(a, b, t)); }

function parsePx(val) {
  if (typeof val === 'number') return val;
  if (typeof val !== 'string') return 0;
  const m = val.match(/^([\d.]+)(px|rem)?$/);
  if (!m) return 0;
  return m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
}

function toPx(val) { return Math.round(val) + 'px'; }

// ─── 维度混合 ────────────────────────────────────────────────

function blendColorsMap(colorsA, colorsB, t) {
  const result = {};
  const allKeys = new Set([...Object.keys(colorsA || {}), ...Object.keys(colorsB || {})]);
  for (const key of allKeys) {
    const a = colorsA && colorsA[key];
    const b = colorsB && colorsB[key];
    if (a && b) result[key] = blendColors(a, b, t);
    else result[key] = t < 0.5 ? (a || b) : (b || a);
  }
  return result;
}

function blendTypography(typoA, typoB, t) {
  const a = typoA || {};
  const b = typoB || {};
  const fontFamily = t < 0.5
    ? (a.fontFamily || 'sans-serif') + ', ' + (b.fontFamily || 'sans-serif')
    : (b.fontFamily || 'sans-serif') + ', ' + (a.fontFamily || 'sans-serif');
  const maxLen = Math.max((a.scale || []).length, (b.scale || []).length);
  const scale = [];
  for (let i = 0; i < maxLen; i++) {
    scale.push(lerpRound((a.scale || [])[i] || 14, (b.scale || [])[i] || 14, t));
  }
  const lineHeight = parseFloat(lerp(a.lineHeight || 1.6, b.lineHeight || 1.6, t).toFixed(2));
  const fontWeight = {};
  for (const k of ['normal', 'medium', 'bold']) {
    fontWeight[k] = lerpRound((a.fontWeight || {})[k] || 400, (b.fontWeight || {})[k] || 400, t);
  }
  const letterSpacing = t < 0.5 ? (a.letterSpacing || '0.01em') : (b.letterSpacing || '0.01em');
  return { fontFamily, scale, lineHeight, fontWeight, letterSpacing };
}

function blendLayout(layoutA, layoutB, t) {
  const a = layoutA || {};
  const b = layoutB || {};
  return {
    maxWidth: t < 0.5 ? (a.maxWidth || '1200px') : (b.maxWidth || '1200px'),
    spacing: toPx(lerp(parsePx(a.spacing || '20px'), parsePx(b.spacing || '20px'), t)),
    sectionSpacing: toPx(lerp(parsePx(a.sectionSpacing || '80px'), parsePx(b.sectionSpacing || '80px'), t)),
    borderRadius: toPx(lerp(parsePx(a.borderRadius || '8px'), parsePx(b.borderRadius || '8px'), t)),
    grid: lerpRound(a.grid || 12, b.grid || 12, t),
  };
}

function blendShadows(shadowsA, shadowsB, t) {
  const a = shadowsA || {};
  const b = shadowsB || {};
  const result = {};
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of allKeys) {
    result[key] = t < 0.5 ? (a[key] || b[key] || 'none') : (b[key] || a[key] || 'none');
  }
  return result;
}

function blendComponents(compA, compB, t) {
  const a = compA || {};
  const b = compB || {};
  const result = {};
  const allKeys = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const key of allKeys) {
    const ca = a[key] || {};
    const cb = b[key] || {};
    const merged = {};
    const fieldKeys = new Set([...Object.keys(ca), ...Object.keys(cb)]);
    for (const fk of fieldKeys) {
      const va = ca[fk];
      const vb = cb[fk];
      if (va === undefined) { merged[fk] = vb; continue; }
      if (vb === undefined) { merged[fk] = va; continue; }
      if (va === vb) { merged[fk] = va; continue; }
      if (typeof va === 'string' && typeof vb === 'string') {
        const na = parsePx(va);
        const nb = parsePx(vb);
        if (na > 0 || nb > 0) { merged[fk] = toPx(lerp(na || nb, nb || na, t)); continue; }
        if (va.startsWith('#') || va.startsWith('rgb')) { merged[fk] = blendColors(va, vb, t); continue; }
        merged[fk] = t < 0.5 ? va : vb;
      } else if (typeof va === 'number' && typeof vb === 'number') {
        merged[fk] = parseFloat(lerp(va, vb, t).toFixed(2));
      } else {
        merged[fk] = t < 0.5 ? va : vb;
      }
    }
    result[key] = merged;
  }
  return result;
}

function blendTone(toneA, toneB, t) {
  const dims = ['formality', 'warmth', 'complexity', 'innovation'];
  const result = {};
  for (const d of dims) {
    result[d] = parseFloat(lerp((toneA || {})[d] || 0.5, (toneB || {})[d] || 0.5, t).toFixed(2));
  }
  return result;
}

// ─── 主入口 ──────────────────────────────────────────────────

function blend(styleA, styleB, options) {
  const opts = options || {};
  const t = Math.max(0, Math.min(1, opts.ratio !== undefined ? opts.ratio : 0.5));
  const a = typeof styleA === 'string' ? getRenderer().getStyle(styleA) : styleA;
  const b = typeof styleB === 'string' ? getRenderer().getStyle(styleB) : styleB;
  if (!a || !b) {
    const missing = !a ? (typeof styleA === 'string' ? styleA : '(object)') : (typeof styleB === 'string' ? styleB : '(object)');
    throw new Error('风格不存在: ' + missing);
  }
  const idA = typeof styleA === 'string' ? styleA : '?';
  const idB = typeof styleB === 'string' ? styleB : '?';
  const mixed = {
    name: opts.name || a.name + ' \u00d7 ' + b.name,
    nameEn: (a.nameEn || idA) + ' \u00d7 ' + (b.nameEn || idB),
    colors: blendColorsMap(a.colors, b.colors, t),
    typography: blendTypography(a.typography, b.typography, t),
    layout: blendLayout(a.layout, b.layout, t),
    shadows: blendShadows(a.shadows, b.shadows, t),
    components: blendComponents(a.components, b.components, t),
    tone: blendTone(a.tone, b.tone, t),
    _mixed: { from: [idA, idB], ratio: t },
  };
  if (a.heroBg || b.heroBg) {
    mixed.heroBg = blendColors(a.heroBg || b.heroBg, b.heroBg || a.heroBg, t);
  }
  return mixed;
}

function parseMixString(str) {
  if (!str || typeof str !== 'string') return null;
  const parts = str.split(':');
  if (parts.length === 3) {
    const ratio = parseFloat(parts[2]);
    if (!isNaN(ratio) && ratio >= 0 && ratio <= 1) {
      return { styleA: parts[0], styleB: parts[1], ratio };
    }
  }
  return null;
}

function cosineSimilarity(toneA, toneB) {
  const dims = ['formality', 'warmth', 'complexity', 'innovation'];
  let dot = 0, magA = 0, magB = 0;
  for (const d of dims) {
    const a = (toneA || {})[d] || 0;
    const b = (toneB || {})[d] || 0;
    dot += a * b; magA += a * a; magB += b * b;
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

function findSimilar(targetStyleId, topN) {
  const n = topN || 3;
  const R = getRenderer();
  const target = typeof targetStyleId === 'string' ? R.getStyle(targetStyleId) : targetStyleId;
  if (!target || !target.tone) return [];
  const results = [];
  const allStyles = R.listStyles();
  for (const entry of allStyles) {
    if (entry.id === targetStyleId) continue;
    const s = R.getStyle(entry.id);
    if (!s || !s.tone) continue;
    const sim = cosineSimilarity(target.tone, s.tone);
    results.push({ id: entry.id, name: s.name || entry.id, nameEn: s.nameEn || '', similarity: parseFloat(sim.toFixed(4)), tone: s.tone });
  }
  return results.sort((a, b) => b.similarity - a.similarity).slice(0, n);
}



// ─── 跨系统风格混合（v0.5）──────────────────────────────────

/**
 * 从记忆库中的设计系统特征构建可混合的风格对象
 * @param {object} designSystem - memory 中的 design_system 记录
 * @returns {object} 兼容 blend() 的风格对象
 */
function fromDesignSystem(designSystem) {
  const ds = designSystem;
  return {
    name: ds.company,
    nameEn: ds.company,
    colors: ds.colors || {},
    typography: ds.typography || { fontFamily: 'sans-serif', scale: [14, 16, 20, 24, 32], lineHeight: 1.6, fontWeight: { normal: 400, medium: 500, bold: 700 } },
    layout: ds.layout || { maxWidth: '1200px', spacing: '20px', sectionSpacing: '80px', borderRadius: '8px', grid: 12 },
    shadows: ds.shadows || {},
    components: ds.components || {},
    tone: ds.tone || { formality: 0.5, warmth: 0.5, complexity: 0.5, innovation: 0.5 },
    _source: 'design_system',
    _sourceId: ds.id,
  };
}

/**
 * 将内置风格与学习到的设计系统混合
 * @param {string} builtinStyle - 内置风格 ID（如 'minimal', 'glassmorphism'）
 * @param {object} designSystem - memory 中的设计系统记录
 * @param {object} options - { ratio: 0.5 }
 * @returns {object} 混合后的风格对象
 */
function blendWithDesignSystem(builtinStyle, designSystem, options) {
  const learned = fromDesignSystem(designSystem);
  return blend(builtinStyle, learned, options);
}

/**
 * 在两个学习到的设计系统之间混合
 * @param {object} dsA - 设计系统 A
 * @param {object} dsB - 设计系统 B
 * @param {object} options - { ratio: 0.5, name?: string }
 * @returns {object} 混合后的风格对象
 */
function blendDesignSystems(dsA, dsB, options) {
  const a = fromDesignSystem(dsA);
  const b = fromDesignSystem(dsB);
  return blend(a, b, options);
}

/**
 * 基于用户偏好自动选择最佳混合比例
 * @param {object} dsA - 设计系统 A
 * @param {object} dsB - 设计系统 B
 * @param {object} preferences - user_preferences 数据 { dimension: { value, confidence } }
 * @returns {object} { styleA, styleB, ratio, reason }
 */
function autoMixRatio(dsA, dsB, preferences) {
  const toneA = dsA.tone || { formality: 0.5, warmth: 0.5, complexity: 0.5, innovation: 0.5 };
  const toneB = dsB.tone || { formality: 0.5, warmth: 0.5, complexity: 0.5, innovation: 0.5 };

  // 计算每个设计系统与用户偏好的匹配度
  let scoreA = 0, scoreB = 0, dims = 0;

  for (const [dim, pref] of Object.entries(preferences || {})) {
    if (!pref || pref.value === undefined) continue;
    const valA = toneA[dim] || 0.5;
    const valB = toneB[dim] || 0.5;
    const userVal = pref.value;
    const conf = pref.confidence || 0.5;

    // 距离越小越好
    scoreA += (1 - Math.abs(valA - userVal)) * conf;
    scoreB += (1 - Math.abs(valB - userVal)) * conf;
    dims++;
  }

  if (dims === 0) return { styleA: dsA.company, styleB: dsB.company, ratio: 0.5, reason: '无偏好数据，使用默认比例' };

  const total = scoreA + scoreB;
  const ratio = total > 0 ? Math.round((scoreA / total) * 100) / 100 : 0.5;
  const reason = ratio > 0.6 ? dsA.company + ' 更匹配偏好' : ratio < 0.4 ? dsB.company + ' 更匹配偏好' : '两者匹配度接近';

  return { styleA: dsA.company, styleB: dsB.company, ratio, reason };
}

module.exports.blendWithDesignSystem = blendWithDesignSystem;
module.exports.blendDesignSystems = blendDesignSystems;
module.exports.fromDesignSystem = fromDesignSystem;
module.exports.autoMixRatio = autoMixRatio;

module.exports = { blend, parseMixString, blendColors, cosineSimilarity, findSimilar, blendWithDesignSystem, blendDesignSystems, fromDesignSystem, autoMixRatio, _tools: { parseColor, rgbToHsl, hslToRgb, rgbToHex } };
