/**
 * DesignSeed — 通用装饰素材系统
 * 所有装饰元素均为 CSS + 内联 SVG，零外部依赖
 * 每个函数接收 options，返回可 absolute 定位的 HTML 字符串
 */

/* ─── helpers ─── */
function css(obj) {
  var parts = [];
  for (var k in obj) {
    if (obj.hasOwnProperty(k) && obj[k] !== undefined && obj[k] !== null) {
      parts.push(k + ':' + obj[k]);
    }
  }
  return parts.join(';');
}

function px(val) {
  if (val === undefined || val === null || val === '') return '';
  if (typeof val === 'number') return val + 'px';
  var s = String(val);
  if (s.endsWith('px') || s.endsWith('%') || s.endsWith('em') || s.endsWith('rem') || s.endsWith('vh') || s.endsWith('vw')) return s;
  return s + 'px';
}

function rgba(hex, alpha) {
  if (!hex) hex = '#000000';
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}

function basePos(opts) {
  var s = { position: 'absolute', pointerEvents: 'none' };
  if (opts.top !== undefined) s.top = px(opts.top);
  if (opts.left !== undefined) s.left = px(opts.left);
  if (opts.right !== undefined) s.right = px(opts.right);
  if (opts.bottom !== undefined) s.bottom = px(opts.bottom);
  if (opts.zIndex !== undefined) s.zIndex = opts.zIndex;
  if (opts.opacity !== undefined) s.opacity = opts.opacity;
  return s;
}

function wrap(tag, innerStyle, content, extraAttrs) {
  var attrs = extraAttrs || '';
  return '<' + tag + ' style="' + css(innerStyle) + '"' + attrs + '>' + (content || '') + '</' + tag + '>';
}

/* ═══════════════════════════════════════════════════════════════
   a) 几何形状 (shapes)
   ═══════════════════════════════════════════════════════════════ */

var shapes = {
  /**
   * 圆形
   * opts: { color, size, filled (bool), opacity, top, left, right, bottom, strokeWidth }
   */
  circle: function (opts) {
    opts = opts || {};
    var color = opts.color || '#6366F1';
    var size = opts.size || 60;
    var filled = opts.filled !== false;
    var opacity = opts.opacity || 0.15;
    var sw = opts.strokeWidth || 2;
    var s = basePos(opts);
    s.width = px(size);
    s.height = px(size);
    s.borderRadius = '50%';
    if (filled) {
      s.background = rgba(color, opacity);
    } else {
      s.background = 'transparent';
      s.border = sw + 'px solid ' + rgba(color, opacity + 0.2);
    }
    return wrap('div', s);
  },

  /**
   * 菱形
   * opts: { color, size, opacity, top, left, right, bottom }
   */
  diamond: function (opts) {
    opts = opts || {};
    var color = opts.color || '#8B5CF6';
    var size = opts.size || 40;
    var opacity = opts.opacity || 0.2;
    var s = basePos(opts);
    s.width = px(size);
    s.height = px(size);
    s.background = rgba(color, opacity);
    s.transform = 'rotate(45deg)';
    return wrap('div', s);
  },

  /**
   * 三角形 (CSS border trick)
   * opts: { color, size, opacity, direction ('up'|'down'|'left'|'right'), top, left, right, bottom }
   */
  triangle: function (opts) {
    opts = opts || {};
    var color = opts.color || '#EC4899';
    var size = opts.size || 30;
    var opacity = opts.opacity || 0.2;
    var dir = opts.direction || 'up';
    var c = rgba(color, opacity);
    var s = basePos(opts);
    s.width = '0';
    s.height = '0';
    s.borderStyle = 'solid';
    if (dir === 'up') {
      s.borderWidth = '0 ' + px(size / 2) + ' ' + px(size) + ' ' + px(size / 2);
      s.borderColor = 'transparent transparent ' + c + ' transparent';
    } else if (dir === 'down') {
      s.borderWidth = px(size) + ' ' + px(size / 2) + ' 0 ' + px(size / 2);
      s.borderColor = c + ' transparent transparent transparent';
    } else if (dir === 'left') {
      s.borderWidth = px(size / 2) + ' ' + px(size) + ' ' + px(size / 2) + ' 0';
      s.borderColor = 'transparent ' + c + ' transparent transparent';
    } else {
      s.borderWidth = px(size / 2) + ' 0 ' + px(size / 2) + ' ' + px(size);
      s.borderColor = 'transparent transparent transparent ' + c;
    }
    return wrap('div', s);
  },

  /**
   * 圆环 (SVG)
   * opts: { color, size, opacity, strokeWidth, top, left, right, bottom }
   */
  ring: function (opts) {
    opts = opts || {};
    var color = opts.color || '#06B6D4';
    var size = opts.size || 60;
    var opacity = opts.opacity || 0.2;
    var sw = opts.strokeWidth || 3;
    var s = basePos(opts);
    s.width = px(size);
    s.height = px(size);
    var svg = '<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">'
      + '<circle cx="50" cy="50" r="44" fill="none" stroke="' + rgba(color, opacity + 0.2) + '" stroke-width="' + sw + '"/>'
      + '</svg>';
    return wrap('div', s, svg);
  },

  /**
   * 点阵网格
   * opts: { color, size (grid cell), count (dots per row/col), opacity, top, left, right, bottom }
   */
  'dot-grid': function (opts) {
    opts = opts || {};
    var color = opts.color || '#6366F1';
    var cellSize = opts.size || 16;
    var count = opts.count || 6;
    var opacity = opts.opacity || 0.18;
    var dotR = Math.max(1.5, cellSize * 0.12);
    var totalSize = cellSize * count;
    var s = basePos(opts);
    s.width = px(totalSize);
    s.height = px(totalSize);
    var circles = '';
    for (var r = 0; r < count; r++) {
      for (var c = 0; c < count; c++) {
        var cx = cellSize * c + cellSize / 2;
        var cy = cellSize * r + cellSize / 2;
        circles += '<circle cx="' + cx + '" cy="' + cy + '" r="' + dotR + '" fill="' + rgba(color, opacity) + '"/>';
      }
    }
    var svg = '<svg viewBox="0 0 ' + totalSize + ' ' + totalSize + '" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">'
      + circles + '</svg>';
    return wrap('div', s, svg);
  },
};

/* ═══════════════════════════════════════════════════════════════
   b) 线条装饰 (lines)
   ═══════════════════════════════════════════════════════════════ */

var lines = {
  /**
   * 花式分割线（带菱形装饰）
   * opts: { color, width, strokeWidth, opacity, top, left, right, bottom }
   */
  'divider-ornate': function (opts) {
    opts = opts || {};
    var color = opts.color || '#8B5CF6';
    var w = opts.width || 200;
    var sw = opts.strokeWidth || 1.5;
    var opacity = opts.opacity || 0.35;
    var s = basePos(opts);
    s.width = px(w);
    s.height = '20px';
    var mid = w / 2;
    var svg = '<svg viewBox="0 0 ' + w + ' 20" width="100%" height="20" xmlns="http://www.w3.org/2000/svg">'
      + '<line x1="0" y1="10" x2="' + (mid - 16) + '" y2="10" stroke="' + rgba(color, opacity) + '" stroke-width="' + sw + '"/>'
      + '<rect x="' + (mid - 6) + '" y="4" width="12" height="12" rx="1" fill="' + rgba(color, opacity + 0.15) + '" transform="rotate(45 ' + mid + ' 10)"/>'
      + '<line x1="' + (mid + 16) + '" y1="10" x2="' + w + '" y2="10" stroke="' + rgba(color, opacity) + '" stroke-width="' + sw + '"/>'
      + '</svg>';
    return wrap('div', s, svg);
  },

  /**
   * 点状分割线
   * opts: { color, width, dotSize, gap, opacity, top, left, right, bottom }
   */
  'divider-dots': function (opts) {
    opts = opts || {};
    var color = opts.color || '#6366F1';
    var w = opts.width || 200;
    var dotR = opts.dotSize || 2;
    var gap = opts.gap || 8;
    var opacity = opts.opacity || 0.3;
    var s = basePos(opts);
    s.width = px(w);
    s.height = '8px';
    var dots = '';
    var x = dotR + 2;
    while (x < w - dotR) {
      dots += '<circle cx="' + x + '" cy="4" r="' + dotR + '" fill="' + rgba(color, opacity) + '"/>';
      x += dotR * 2 + gap;
    }
    var svg = '<svg viewBox="0 0 ' + w + ' 8" width="100%" height="8" xmlns="http://www.w3.org/2000/svg">'
      + dots + '</svg>';
    return wrap('div', s, svg);
  },

  /**
   * 渐变分割线
   * opts: { color, width, strokeWidth, opacity, top, left, right, bottom }
   */
  'divider-gradient': function (opts) {
    opts = opts || {};
    var color = opts.color || '#6366F1';
    var w = opts.width || 200;
    var sw = opts.strokeWidth || 2;
    var opacity = opts.opacity || 0.4;
    var id = 'dg-' + Math.random().toString(36).substr(2, 6);
    var s = basePos(opts);
    s.width = px(w);
    s.height = '4px';
    var svg = '<svg viewBox="0 0 ' + w + ' 4" width="100%" height="4" xmlns="http://www.w3.org/2000/svg">'
      + '<defs><linearGradient id="' + id + '" x1="0%" y1="0%" x2="100%" y2="0%">'
      + '<stop offset="0%" stop-color="' + rgba(color, 0) + '"/>'
      + '<stop offset="50%" stop-color="' + rgba(color, opacity) + '"/>'
      + '<stop offset="100%" stop-color="' + rgba(color, 0) + '"/>'
      + '</linearGradient></defs>'
      + '<line x1="0" y1="2" x2="' + w + '" y2="2" stroke="url(#' + id + ')" stroke-width="' + sw + '"/>'
      + '</svg>';
    return wrap('div', s, svg);
  },

  /**
   * 角落线条装饰
   * opts: { color, size, strokeWidth, opacity, corner ('tl'|'tr'|'bl'|'br'), top, left, right, bottom }
   */
  'corner-line': function (opts) {
    opts = opts || {};
    var color = opts.color || '#8B5CF6';
    var size = opts.size || 40;
    var sw = opts.strokeWidth || 2;
    var opacity = opts.opacity || 0.3;
    var corner = opts.corner || 'tl';
    var s = basePos(opts);
    s.width = px(size);
    s.height = px(size);
    var path;
    if (corner === 'tl') {
      path = 'M 0 ' + size + ' L 0 0 L ' + size + ' 0';
    } else if (corner === 'tr') {
      path = 'M 0 0 L ' + size + ' 0 L ' + size + ' ' + size;
    } else if (corner === 'bl') {
      path = 'M 0 0 L 0 ' + size + ' L ' + size + ' ' + size;
    } else {
      path = 'M ' + size + ' 0 L ' + size + ' ' + size + ' L 0 ' + size;
    }
    var svg = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">'
      + '<path d="' + path + '" fill="none" stroke="' + rgba(color, opacity + 0.15) + '" stroke-width="' + sw + '" stroke-linecap="round"/>'
      + '</svg>';
    return wrap('div', s, svg);
  },
};

/* ═══════════════════════════════════════════════════════════════
   c) 背景纹理 (textures)
   ═══════════════════════════════════════════════════════════════ */

var textures = {
  /**
   * 微点阵背景
   * opts: { color, size, opacity, top, left, right, bottom, width, height }
   */
  'dots-subtle': function (opts) {
    opts = opts || {};
    var color = opts.color || '#000000';
    var size = opts.size || 20;
    var opacity = opts.opacity || 0.06;
    var s = basePos(opts);
    s.width = opts.width ? px(opts.width) : '100%';
    s.height = opts.height ? px(opts.height) : '100%';
    s.backgroundImage = 'radial-gradient(' + rgba(color, opacity) + ' 1px, transparent 1px)';
    s.backgroundSize = size + 'px ' + size + 'px';
    return wrap('div', s);
  },

  /**
   * 微网格背景
   * opts: { color, size, opacity, strokeWidth, top, left, right, bottom, width, height }
   */
  'grid-subtle': function (opts) {
    opts = opts || {};
    var color = opts.color || '#000000';
    var size = opts.size || 24;
    var opacity = opts.opacity || 0.06;
    var sw = opts.strokeWidth || 0.5;
    var s = basePos(opts);
    s.width = opts.width ? px(opts.width) : '100%';
    s.height = opts.height ? px(opts.height) : '100%';
    s.backgroundImage =
      'linear-gradient(' + rgba(color, opacity) + ' ' + sw + 'px, transparent ' + sw + 'px),'
      + 'linear-gradient(90deg, ' + rgba(color, opacity) + ' ' + sw + 'px, transparent ' + sw + 'px)';
    s.backgroundSize = size + 'px ' + size + 'px';
    return wrap('div', s);
  },

  /**
   * 斜线纹理
   * opts: { color, size, opacity, strokeWidth, angle, top, left, right, bottom, width, height }
   */
  'diagonal-lines': function (opts) {
    opts = opts || {};
    var color = opts.color || '#000000';
    var size = opts.size || 12;
    var opacity = opts.opacity || 0.05;
    var sw = opts.strokeWidth || 1;
    var angle = opts.angle || 45;
    var s = basePos(opts);
    s.width = opts.width ? px(opts.width) : '100%';
    s.height = opts.height ? px(opts.height) : '100%';
    s.backgroundImage = 'repeating-linear-gradient('
      + angle + 'deg,'
      + rgba(color, opacity) + ' 0px,'
      + rgba(color, opacity) + ' ' + sw + 'px,'
      + 'transparent ' + sw + 'px,'
      + 'transparent ' + size + 'px)';
    return wrap('div', s);
  },

  /**
   * 噪点纹理 (CSS SVG filter)
   * opts: { color, opacity, top, left, right, bottom, width, height }
   */
  'noise': function (opts) {
    opts = opts || {};
    var opacity = opts.opacity || 0.04;
    var s = basePos(opts);
    s.width = opts.width ? px(opts.width) : '100%';
    s.height = opts.height ? px(opts.height) : '100%';
    var id = 'noise-' + Math.random().toString(36).substr(2, 6);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">'
      + '<filter id="' + id + '">'
      + '<feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>'
      + '<feColorMatrix type="saturate" values="0"/>'
      + '</filter></svg>';
    s.background = 'transparent';
    s.filter = 'url(#' + id + ')';
    s.opacity = opacity;
    return wrap('div', s, svg);
  },
};

/* ═══════════════════════════════════════════════════════════════
   d) 标签/徽章 (badges)
   ═══════════════════════════════════════════════════════════════ */

var badges = {
  /**
   * 胶囊标签
   * opts: { text, color, bgColor, fontSize, opacity, top, left, right, bottom }
   */
  'tag-pill': function (opts) {
    opts = opts || {};
    var text = opts.text || '标签';
    var color = opts.color || '#FFFFFF';
    var bgColor = opts.bgColor || '#6366F1';
    var fontSize = opts.fontSize || 12;
    var opacity = opts.opacity || 0.9;
    var s = basePos(opts);
    s.display = 'inline-flex';
    s.alignItems = 'center';
    s.padding = '4px 14px';
    s.borderRadius = '999px';
    s.background = rgba(bgColor, opacity);
    s.color = color;
    s.fontSize = px(fontSize);
    s.fontWeight = '600';
    s.fontFamily = '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    s.letterSpacing = '0.04em';
    s.whiteSpace = 'nowrap';
    s.boxShadow = '0 2px 8px ' + rgba(bgColor, 0.25);
    return wrap('span', s, text);
  },

  /**
   * 方角标签
   * opts: { text, color, bgColor, fontSize, opacity, borderWidth, top, left, right, bottom }
   */
  'tag-square': function (opts) {
    opts = opts || {};
    var text = opts.text || '标签';
    var color = opts.color || '#6366F1';
    var bgColor = opts.bgColor || 'transparent';
    var fontSize = opts.fontSize || 12;
    var opacity = opts.opacity || 0.9;
    var bw = opts.borderWidth || 1.5;
    var s = basePos(opts);
    s.display = 'inline-flex';
    s.alignItems = 'center';
    s.padding = '4px 12px';
    s.borderRadius = '2px';
    s.background = bgColor === 'transparent' ? 'transparent' : rgba(bgColor, opacity);
    s.border = bw + 'px solid ' + rgba(color, opacity + 0.1);
    s.color = color;
    s.fontSize = px(fontSize);
    s.fontWeight = '600';
    s.fontFamily = '-apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';
    s.letterSpacing = '0.06em';
    s.textTransform = 'uppercase';
    s.whiteSpace = 'nowrap';
    return wrap('span', s, text);
  },

  /**
   * 圆形徽章 (SVG)
   * opts: { text, color, bgColor, size, fontSize, opacity, top, left, right, bottom }
   */
  'badge-circle': function (opts) {
    opts = opts || {};
    var text = opts.text || '1';
    var color = opts.color || '#FFFFFF';
    var bgColor = opts.bgColor || '#EF4444';
    var size = opts.size || 32;
    var fontSize = opts.fontSize || 14;
    var opacity = opts.opacity || 0.95;
    var s = basePos(opts);
    s.width = px(size);
    s.height = px(size);
    var svg = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">'
      + '<circle cx="' + (size / 2) + '" cy="' + (size / 2) + '" r="' + (size / 2 - 1) + '" fill="' + rgba(bgColor, opacity) + '"/>'
      + '<text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" '
      + 'fill="' + color + '" font-size="' + fontSize + '" font-weight="700" '
      + 'font-family="-apple-system, PingFang SC, Microsoft YaHei, sans-serif">' + text + '</text>'
      + '</svg>';
    return wrap('div', s, svg);
  },
};

/* ═══════════════════════════════════════════════════════════════
   统一导出
   ═══════════════════════════════════════════════════════════════ */

var DECORATIONS = {
  shapes: shapes,
  lines: lines,
  textures: textures,
  badges: badges,

  /** 便捷方法：按名称获取装饰函数 */
  get: function (category, name) {
    // 支持单参数: get("dot-grid") 遍历所有分类查找
    if (!name) {
      var cats = ["shapes", "lines", "textures", "badges"];
      for (var i = 0; i < cats.length; i++) {
        var cat = this[cats[i]];
        if (cat && cat[category]) return cat[category];
      }
      return undefined;
    }
    var cat = this[category];
    return cat ? cat[name] : undefined;
  },

  /** 便捷方法：列出所有可用装饰 */
  list: function () {
    var result = [];
    ['shapes', 'lines', 'textures', 'badges'].forEach(function (cat) {
      Object.keys(DECORATIONS[cat]).forEach(function (name) {
        result.push({ category: cat, name: name });
      });
    });
    return result;
  },
};

module.exports = DECORATIONS;
