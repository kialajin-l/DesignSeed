/**
 * DesignSeed UI Components
 * Generates HTML component strings with inline CSS.
 * Supports optional AssetResolver via style._resolver for decorative icons.
 */

function css(obj) {
  var parts = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null) {
      parts.push(key + ':' + obj[key]);
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
function pxHalf(val) {
  if (typeof val === 'number') return (val / 2) + 'px';
  var n = parseFloat(String(val));
  if (!isNaN(n)) return (n / 2) + 'px';
  return '0px';
}
function pxHalf(val) {
  if (typeof val === 'number') return (val / 2) + 'px';
  var n = parseFloat(String(val));
  if (!isNaN(n)) return (n / 2) + 'px';
  return '0px';
}

function header(title, subtitle, style) {
  var s = style || {};
  var co = s.colors || {};
  var ty = s.typography || {};
  var la = s.layout || {};
  var sh = s.shadows || {};
  if (!ty.scale) ty.scale = [0,0,0,0,0,0,0];
  if (!ty.fontWeight) ty.fontWeight = {};

  var headerStyle = css({
    'background': co.surface,
    'padding': px(la.spacing) + ' ' + px(la.sectionSpacing),
    'border-bottom': '1px solid ' + co.border,
    'box-shadow': sh.small,
    'text-align': 'center',
    'position': 'relative',
    'overflow': 'hidden',
    'margin-bottom': '0'
  });

  var titleStyle = css({
    'font-family': ty.fontFamily,
    'font-size': px(ty.scale[4]),
    'font-weight': ty.fontWeight.bold,
    'color': co.text,
    'margin': '0 0 8px 0',
    'letter-spacing': ty.letterSpacing
  });

  var subtitleStyle = css({
    'font-family': ty.fontFamily,
    'font-size': px(ty.scale[1]),
    'font-weight': ty.fontWeight.normal,
    'color': co.textSecondary,
    'margin': '0',
    'line-height': ty.lineHeight
  });

  var html = '<header style="' + headerStyle + '">';
  html += '<h1 style="' + titleStyle + '">' + title + '</h1>';
  if (subtitle) {
    html += '<p style="' + subtitleStyle + '">' + subtitle + '</p>';
  }
  html += '</header>';
  return html;
}

function card(title, content, style, variant, opts) {
  var s = style || {};
  var co = s.colors || {};
  var ty = s.typography || {};
  var la = s.layout || {};
  var sh = s.shadows || {};
  if (!ty.scale) ty.scale = [0,0,0,0,0,0,0];
  if (!ty.fontWeight) ty.fontWeight = {};
  var comp = (s.components && s.components.card) || {};
  var o = opts || {};

  // compact 变体：更小的 padding 和字号
  var isCompact = variant === 'compact';
  var padding = isCompact ? '16px' : px(comp.padding || la.spacing);
  var titleSize = isCompact ? (ty.scale ? ty.scale[2] + 'px' : '16px') : px(ty.scale[3]);

  var cardStyle = css({
    'background': comp.background || co.surface,
    'border': 'none',
    'border-radius': px(comp.borderRadius || la.borderRadius),
    'padding': padding,
    'box-shadow': '0 2px 12px rgba(0,0,0,0.06)',
    'margin-bottom': isCompact ? '0' : '20px',
    'position': 'relative',
    'overflow': 'hidden',
    'grid-column': o.span2 ? 'span 2' : undefined
  });

  var titleStyle = css({
    'font-family': ty.fontFamily,
    'font-size': titleSize,
    'font-weight': ty.fontWeight.bold,
    'color': co.text,
    'margin': '0 0 ' + (isCompact ? '4px' : pxHalf(la.spacing)) + ' 0',
    'letter-spacing': ty.letterSpacing
  });

  var contentStyle = css({
    'font-family': ty.fontFamily,
    'font-size': px(ty.scale[1]),
    'font-weight': ty.fontWeight.normal,
    'color': co.textSecondary,
    'line-height': ty.lineHeight,
    'margin': '0'
  });

  var html = `<div style="${cardStyle}">`;

  if (s._resolver) {
    var resolver = s._resolver;
    var decoIcon = resolver.pick('decoration', { size: 48, color: co.primary, opacity: 0.12 });
    if (decoIcon) {
      var decoStyle = css({
        'position': 'absolute',
        'top': '12px',
        'right': '12px',
        'width': '48px',
        'height': '48px',
        'opacity': '0.12',
        'pointer-events': 'none'
      });
      html += `<div style="${decoStyle}">${decoIcon}</div>`;
    }
  }

  html += `<h3 style="${titleStyle}">${title}</h3>`;
  html += `<div style="${contentStyle}">${content}</div>`;
  html += '</div>';
  return html;
}

function button(text, variant, style) {
  var s = style || {};
  var co = s.colors || {};
  var ty = s.typography || {};
  var la = s.layout || {};
  var sh = s.shadows || {};
  if (!ty.scale) ty.scale = [0,0,0,0,0,0,0];
  if (!ty.fontWeight) ty.fontWeight = {};
  var comp = (s.components && s.components.button) || {};

  var bgColor, textColor, borderStyle;

  if (variant === 'primary') {
    bgColor = co.primary;
    textColor = '#ffffff';
    borderStyle = 'none';
  } else if (variant === 'secondary') {
    bgColor = 'transparent';
    textColor = co.primary;
    borderStyle = '2px solid ' + co.primary;
  } else if (variant === 'accent') {
    bgColor = co.accent;
    textColor = '#ffffff';
    borderStyle = 'none';
  } else {
    bgColor = co.primary;
    textColor = '#ffffff';
    borderStyle = 'none';
  }

  var btnStyle = css({
    'font-family': ty.fontFamily,
    'font-size': px(ty.scale[1]),
    'font-weight': ty.fontWeight.medium,
    'color': textColor,
    'background': bgColor,
    'border': borderStyle,
    'border-radius': px(comp.borderRadius || la.borderRadius),
    'padding': px(comp.paddingY || 12) + " " + px(comp.paddingX || 24),
    'cursor': 'pointer',
    'display': 'inline-block',
    'text-align': 'center',
    'letter-spacing': ty.letterSpacing,
    'transition': 'opacity 0.2s ease'
  });

  return '<button style="' + btnStyle + '">' + text + '</button>';
}

function hero(title, description, cta, style) {
  var s = style || {};
  var co = s.colors || {};
  var ty = s.typography || {};
  var la = s.layout || {};
  var sh = s.shadows || {};
  if (!ty.scale) ty.scale = [0,0,0,0,0,0,0];
  if (!ty.fontWeight) ty.fontWeight = {};
  var comp = (s.components && s.components.hero) || {};

  var textColor = comp.textColor || '#ffffff';
  var bgColor = comp.background || co.primary;

  var heroStyle = css({
    'background': bgColor,
    'padding': px(comp.paddingY || 80) + " " + px(la.sectionSpacing),
    'text-align': 'center',
    'position': 'relative',
    'overflow': 'hidden',
    'border-radius': px(la.borderRadius),
    'margin-bottom': '24px'
  });

  var titleStyle = css({
    'font-family': ty.fontFamily,
    'font-size': px(ty.scale[5]),
    'font-weight': ty.fontWeight.bold,
    'color': textColor,
    'margin': '0 0 16px 0',
    'letter-spacing': ty.letterSpacing,
    'position': 'relative',
    'z-index': '2'
  });

  var descStyle = css({
    'font-family': ty.fontFamily,
    'font-size': px(ty.scale[2]),
    'font-weight': ty.fontWeight.normal,
    'color': textColor,
    'opacity': '0.85',
    'margin': '0 auto 32px auto',
    'line-height': ty.lineHeight,
    'max-width': '600px',
    'position': 'relative',
    'z-index': '2'
  });

  var html = '<section style="' + heroStyle + '">';

  if (s._resolver) {
    var resolver = s._resolver;
    var decoTags = ['heart', 'star', 'sparkle', 'love', 'cute'];
    var icons = resolver.pickMany(decoTags, 5, { size: 28, color: textColor, opacity: 0.15 });
    if (icons && icons.length > 0) {
      var positions = [
        { top: '15%', left: '8%' },
        { top: '25%', right: '10%' },
        { bottom: '20%', left: '15%' },
        { top: '60%', right: '20%' },
        { bottom: '10%', left: '45%' }
      ];
      for (var i = 0; i < icons.length && i < 5; i++) {
        var pos = positions[i];
        var decoStyle = css({
          'position': 'absolute',
          'width': '28px',
          'height': '28px',
          'opacity': '0.15',
          'pointer-events': 'none',
          'z-index': '1'
        });
        if (pos.top) decoStyle += ';top:' + pos.top;
        if (pos.bottom) decoStyle += ';bottom:' + pos.bottom;
        if (pos.left) decoStyle += ';left:' + pos.left;
        if (pos.right) decoStyle += ';right:' + pos.right;
        html += '<div style="' + decoStyle + '">' + icons[i] + '</div>';
      }
    }
  }

  html += '<h2 style="' + titleStyle + '">' + title + '</h2>';
  html += '<p style="' + descStyle + '">' + description + '</p>';
  if (cta) {
    html += '<div style="position:relative;z-index:2;">' + cta + '</div>';
  }
  html += '</section>';
  return html;
}

function grid(items, columns, style) {
  var s = style || {};
  var la = s.layout || {};
  var gap = px(la.spacing);

  var gridStyle = css({
    'display': 'grid',
    'grid-template-columns': 'repeat(' + columns + ', 1fr)',
    'gap': gap,
    'max-width': px(la.maxWidth),
    'margin-bottom': '24px'
  });

  var html = '<div style="' + gridStyle + '">';
  for (var i = 0; i < items.length; i++) {
    html += '<div>' + items[i] + '</div>';
  }
  html += '</div>';
  return html;
}

function nav(links, style) {
  var s = style || {};
  var co = s.colors || {};
  var ty = s.typography || {};
  var la = s.layout || {};
  var sh = s.shadows || {};
  if (!ty.scale) ty.scale = [0,0,0,0,0,0,0];
  if (!ty.fontWeight) ty.fontWeight = {};
  var comp = (s.components && s.components.nav) || {};

  var navStyle = css({
    'background': comp.background || co.surface,
    'padding': px(comp.paddingY || 16) + " " + px(la.sectionSpacing),
    'display': 'flex',
    'align-items': 'center',
    'justify-content': 'space-between',
    'box-shadow': sh.small,
    'position': 'relative',
    'z-index': '10'
  });

  var linkContainerStyle = css({
    'display': 'flex',
    'align-items': 'center',
    'gap': px(la.spacing)
  });

  var linkStyle = css({
    'font-family': ty.fontFamily,
    'font-size': px(ty.scale[1]),
    'font-weight': ty.fontWeight.medium,
    'color': co.text,
    'text-decoration': 'none',
    'padding': '8px 12px',
    'border-radius': px(la.borderRadius),
    'transition': 'background 0.2s ease'
  });

  var logoStyle = css({
    'font-family': ty.fontFamily,
    'font-size': px(ty.scale[2]),
    'font-weight': ty.fontWeight.bold,
    'color': co.primary,
    'display': 'flex',
    'align-items': 'center',
    'gap': '8px'
  });

  var html = '<nav style="' + navStyle + '">';

  html += '<div style="' + logoStyle + '">';
  if (s._resolver) {
    var resolver = s._resolver;
    var logoIcon = resolver.pick('cute', { size: 22, color: co.primary, opacity: 0.9 });
    if (logoIcon) {
      html += '<span style="display:inline-flex;align-items:center;">' + logoIcon + '</span>';
    }
  }
  if (links && links.length > 0) {
    html += '<span>' + (links[0].label || links[0].text || '') + '</span>';
  }
  html += '</div>';

  html += '<div style="' + linkContainerStyle + '">';
  var startIndex = links && links.length > 1 ? 1 : 0;
  for (var i = startIndex; i < links.length; i++) {
    var link = links[i];
    var href = link.href || link.url || '#';
    var label = link.label || link.text || '';
    html += '<a href="' + href + '" style="' + linkStyle + '">' + label + '</a>';
  }
  html += '</div>';

  html += '</nav>';
  return html;
}

function footer(text, style) {
  var s = style || {};
  var co = s.colors || {};
  var ty = s.typography || {};
  var la = s.layout || {};
  var sh = s.shadows || {};
  if (!ty.scale) ty.scale = [0,0,0,0,0,0,0];
  if (!ty.fontWeight) ty.fontWeight = {};

  var footerStyle = css({
    'background': co.surface,
    'padding': px(la.sectionSpacing),
    'border-top': '1px solid ' + co.border,
    'text-align': 'center',
    'margin-top': '40px'
  });

  var textStyle = css({
    'font-family': ty.fontFamily,
    'font-size': px(ty.scale[0]),
    'font-weight': ty.fontWeight.normal,
    'color': co.textSecondary,
    'margin': '0',
    'line-height': ty.lineHeight
  });

  var html = '<footer style="' + footerStyle + '">';
  html += '<p style="' + textStyle + '">' + text + '</p>';
  html += '</footer>';
  return html;
}

function stats(data, style) {
  var s = style || {};
  var co = s.colors || {};
  var ty = s.typography || {};
  var la = s.layout || {};
  var sh = s.shadows || {};
  if (!ty.scale) ty.scale = [0,0,0,0,0,0,0];
  if (!ty.fontWeight) ty.fontWeight = {};

  var containerStyle = css({
    'display': 'flex',
    'justify-content': 'space-around',
    'align-items': 'center',
    'padding': px(la.spacing) + ' ' + px(la.sectionSpacing),
    'background': co.surface,
    'border-radius': px(la.borderRadius),
    'box-shadow': '0 2px 12px rgba(0,0,0,0.06)',
    'max-width': px(la.maxWidth),
    'margin-bottom': '24px'
  });

  var itemStyle = css({
    'text-align': 'center',
    'flex': '1',
    'padding': pxHalf(la.spacing)
  });

  var valueStyle = css({
    'font-family': ty.fontFamily,
    'font-size': px(ty.scale[4]),
    'font-weight': ty.fontWeight.bold,
    'color': co.primary,
    'margin': '0 0 4px 0',
    'letter-spacing': ty.letterSpacing
  });

  var labelStyle = css({
    'font-family': ty.fontFamily,
    'font-size': px(ty.scale[0]),
    'font-weight': ty.fontWeight.normal,
    'color': co.textSecondary,
    'margin': '0',
    'text-transform': 'uppercase',
    'letter-spacing': '0.5px'
  });

  var html = '<div style="' + containerStyle + '">';
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    html += '<div style="' + itemStyle + '">';
    html += '<p style="' + valueStyle + '">' + item.value + '</p>';
    html += '<p style="' + labelStyle + '">' + item.label + '</p>';
    html += '</div>';
  }
  html += '</div>';
  return html;
}

module.exports = {
  css: css,
  header: header,
  card: card,
  button: button,
  hero: hero,
  grid: grid,
  nav: nav,
  footer: footer,
  stats: stats
};
