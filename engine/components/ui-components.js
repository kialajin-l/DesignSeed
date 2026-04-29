/**
 * DesignSeed — UI 组件库
 * 提供可复用的 HTML 组件生成函数，根据风格配置生成内联 CSS
 */

function css(obj) {
  return Object.entries(obj).map(([k, v]) => {
    const prop = k.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `${prop}: ${v}`;
  }).join('; ');
}

function header(title, subtitle, style) {
  const s = style || {};
  const c = s.colors || {};
  const t = s.typography || {};
  const l = s.layout || {};
  return `<header style="padding: ${l.spacing || '20px'}; max-width: ${l.maxWidth || '1200px'}; margin: 0 auto; border-bottom: 1px solid ${c.border || '#E0E0E0'};">
  <h1 style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[4] + 'px' : '28px'}; font-weight: ${t.fontWeight ? t.fontWeight.bold : 700}; color: ${c.text || '#1A1A1A'}; margin: 0; line-height: ${t.lineHeight || 1.6};">${title}</h1>
  ${subtitle ? `<p style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[1] + 'px' : '14px'}; color: ${c.textSecondary || '#888'}; margin: 8px 0 0; letter-spacing: ${t.letterSpacing || '0.01em'};">${subtitle}</p>` : ''}
</header>`;
}

function card(title, content, style) {
  const s = style || {};
  const c = s.colors || {};
  const t = s.typography || {};
  const sh = s.shadows || {};
  const comp = (s.components && s.components.card) || {};
  const cardStyle = css({
    padding: comp.padding || '24px',
    border: comp.border || `1px solid ${c.border || '#E0E0E0'}`,
    borderRadius: comp.borderRadius || (s.layout && s.layout.borderRadius) || '8px',
    background: comp.background || c.surface || '#FFFFFF',
    boxShadow: sh.small || 'none',
    fontFamily: t.fontFamily || 'sans-serif',
    color: c.text || '#1A1A1A',
    ...(comp.backdropFilter ? { backdropFilter: comp.backdropFilter } : {}),
  });
  return `<div style="${cardStyle}">
  <h3 style="font-size: ${t.scale ? t.scale[3] + 'px' : '22px'}; font-weight: ${t.fontWeight ? t.fontWeight.bold : 700}; margin: 0 0 12px; color: ${c.primary || '#000'};">${title}</h3>
  <div style="font-size: ${t.scale ? t.scale[1] + 'px' : '14px'}; line-height: ${t.lineHeight || 1.6}; color: ${c.textSecondary || '#666'};">${content}</div>
</div>`;
}

function button(text, variant, style) {
  const s = style || {};
  const c = s.colors || {};
  const t = s.typography || {};
  const comp = (s.components && s.components.button) || {};
  let bg, fg, border;
  if (variant === 'secondary') {
    bg = 'transparent';
    fg = c.primary || '#000';
    border = comp.border || `2px solid ${c.primary || '#000'}`;
  } else if (variant === 'accent') {
    bg = c.accent || '#0066CC';
    fg = '#FFFFFF';
    border = 'none';
  } else {
    bg = comp.background || c.primary || '#000';
    fg = comp.color || '#FFFFFF';
    border = comp.border || 'none';
  }
  const btnStyle = css({
    padding: comp.padding || '12px 24px',
    borderRadius: comp.borderRadius || (s.layout && s.layout.borderRadius) || '8px',
    fontWeight: comp.fontWeight || (t.fontWeight ? t.fontWeight.bold : 700),
    background: bg,
    color: fg,
    border: border,
    fontFamily: t.fontFamily || 'sans-serif',
    fontSize: t.scale ? t.scale[1] + 'px' : '14px',
    cursor: 'pointer',
    display: 'inline-block',
    textDecoration: 'none',
    textTransform: comp.textTransform || 'none',
    letterSpacing: comp.letterSpacing || t.letterSpacing || '0.01em',
  });
  return `<a href="#" style="${btnStyle}">${text}</a>`;
}

function hero(title, description, cta, style) {
  const s = style || {};
  const c = s.colors || {};
  const t = s.typography || {};
  const l = s.layout || {};
  const sh = s.shadows || {};
  const comp = (s.components && s.components.hero) || {};
  const isGradient = (c.background || '').includes('gradient');
  const heroBg = s.heroBg || (isGradient ? c.background : (c.primary || '#000'));
  const heroStyle = css({
    padding: comp.padding || '120px 0',
    textAlign: comp.textAlign || 'center',
    background: heroBg,
    borderRadius: l.borderRadius || '0px',
    boxShadow: sh.medium || 'none',
  });
  const textColor = (c.background || '').includes('gradient') || ['#0A0A0F', '#0B0E17', '#1C1917', '#1A1C2C', '#2C2C2C'].includes(heroBg) || s.heroBg ? (c.text || '#FFFFFF') : '#FFFFFF';
  return `<section style="${heroStyle}">
  <div style="max-width: ${l.maxWidth || '1200px'}; margin: 0 auto; padding: 0 ${l.spacing || '20px'};">
    <h1 style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[5] + 'px' : '48px'}; font-weight: ${t.fontWeight ? t.fontWeight.bold : 700}; color: ${textColor}; margin: 0 0 16px; line-height: 1.2; letter-spacing: ${t.letterSpacing || '0.01em'};">${title}</h1>
    <p style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[2] + 'px' : '18px'}; color: ${textColor}; opacity: 0.85; margin: 0 0 32px; max-width: 640px; margin-left: auto; margin-right: auto; line-height: ${t.lineHeight || 1.6};">${description}</p>
    ${cta ? '<div style="margin-top: 16px;">' + button(cta, 'primary', style) + '</div>' : ''}
  </div>
</section>`;
}

function grid(items, columns, style) {
  const s = style || {};
  const l = s.layout || {};
  const cols = columns || 3;
  return `<div style="display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: ${l.spacing || '20px'}; max-width: ${l.maxWidth || '1200px'}; margin: 0 auto; padding: 0 ${l.spacing || '20px'};">
${items.map(item => `  <div>${item}</div>`).join('\n')}
</div>`;
}

function nav(links, style) {
  const s = style || {};
  const c = s.colors || {};
  const t = s.typography || {};
  const comp = (s.components && s.components.nav) || {};
  const navStyle = css({
    height: comp.height || '64px',
    borderBottom: comp.borderBottom || `1px solid ${c.border || '#E0E0E0'}`,
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${s.layout ? s.layout.spacing : '20px'}`,
    maxWidth: s.layout ? s.layout.maxWidth : '1200px',
    margin: '0 auto',
    background: comp.background || 'transparent',
    ...(comp.backdropFilter ? { backdropFilter: comp.backdropFilter } : {}),
  });
  const linksHtml = (links || []).map(l =>
    `<a href="${l.href || '#'}" style="color: ${c.primary || '#000'}; text-decoration: none; font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[1] + 'px' : '14px'}; font-weight: ${t.fontWeight ? t.fontWeight.medium : 500}; margin-right: 24px;">${l.text}</a>`
  ).join('\n    ');
  return `<nav style="${navStyle}">
    <span style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[2] + 'px' : '18px'}; font-weight: ${t.fontWeight ? t.fontWeight.bold : 700}; color: ${c.primary || '#000'}; margin-right: auto;">DesignSeed</span>
    ${linksHtml}
</nav>`;
}

function footer(text, style) {
  const s = style || {};
  const c = s.colors || {};
  const t = s.typography || {};
  const l = s.layout || {};
  return `<footer style="padding: ${l.spacing || '20px'}; max-width: ${l.maxWidth || '1200px'}; margin: ${l.sectionSpacing || '80px'} auto 0; border-top: 1px solid ${c.border || '#E0E0E0'}; text-align: center;">
  <p style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[0] + 'px' : '12px'}; color: ${c.textSecondary || '#888'}; margin: 0;">${text}</p>
</footer>`;
}

function stats(data, style) {
  const s = style || {};
  const c = s.colors || {};
  const t = s.typography || {};
  const l = s.layout || {};
  const sh = s.shadows || {};
  const items = (data || []).map(d => `
    <div style="text-align: center; padding: ${l.spacing || '20px'};">
      <div style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[4] + 'px' : '28px'}; font-weight: ${t.fontWeight ? t.fontWeight.bold : 700}; color: ${c.primary || '#000'}; margin-bottom: 8px;">${d.value}</div>
      <div style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[1] + 'px' : '14px'}; color: ${c.textSecondary || '#888'};">${d.label}</div>
    </div>`).join('');
  return `<div style="display: flex; justify-content: space-around; max-width: ${l.maxWidth || '1200px'}; margin: 0 auto; padding: ${l.sectionSpacing || '80px'} ${l.spacing || '20px'}; background: ${c.surface || '#F5F5F5'}; border-radius: ${l.borderRadius || '8px'}; box-shadow: ${sh.small || 'none'};">
${items}
</div>`;
}

module.exports = { header, card, button, hero, grid, nav, footer, stats };
