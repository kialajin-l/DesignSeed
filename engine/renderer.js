/**
 * DesignSeed — 核心渲染器
 * 接收自然语言 prompt + 可选 style 参数，生成完整 HTML/CSS 页面
 */

const styles = require('./templates/styles');
const ui = require('./components/ui-components');

const DEFAULT_STYLE = 'minimalism';

function getStyle(styleId) {
  return styles[styleId] || styles[DEFAULT_STYLE];
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function parsePrompt(prompt) {
  const words = prompt.split(/[\s,，、。！？]+/).filter(w => w.length > 1);
  const keywords = words.slice(0, 8);
  return { original: prompt, keywords, sections: keywords.length > 4 ? 3 : 2 };
}

function buildHead(title, style) {
  const c = style.colors || {};
  const t = style.typography || {};
  const bg = (c.background || '#FFFFFF');
  const isGradient = bg.includes('gradient');
  const bgColor = isGradient ? '#0B0E17' : bg;
  return `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: ${t.fontFamily || 'sans-serif'}; background: ${bgColor}; color: ${c.text || '#1A1A1A'}; line-height: ${t.lineHeight || 1.6}; -webkit-font-smoothing: antialiased; }
    img { max-width: 100%; height: auto; }
    a { text-decoration: none; }
  </style>
</head>`;
}

function buildContent(prompt, style) {
  const parsed = parsePrompt(prompt);
  const c = style.colors || {};
  const l = style.layout || {};
  const t = style.typography || {};

  const links = [
    { text: '首页', href: '#' },
    { text: '功能', href: '#features' },
    { text: '关于', href: '#about' },
    { text: '联系', href: '#contact' },
  ];

  const navHtml = ui.nav(links, style);

  const heroHtml = ui.hero(
    escapeHtml(prompt),
    `基于「${escapeHtml(parsed.keywords.slice(0, 3).join('、'))}」等关键词自动生成的页面设计`,
    '了解更多',
    style
  );

  const featureCards = parsed.keywords.slice(0, 6).map((kw, i) => {
    const variants = ['primary', 'secondary', 'accent'];
    const descriptions = [
      '精心设计的核心功能模块，提供卓越的用户体验和高效的交互流程。',
      '智能化的数据处理引擎，实时分析并呈现关键业务指标。',
      '灵活的配置系统，支持个性化定制和多场景适配。',
      '安全可靠的底层架构，保障数据隐私和系统稳定性。',
      '简洁直观的操作界面，降低学习成本，提升使用效率。',
      '开放的 API 接口，支持第三方集成和生态扩展。',
    ];
    return ui.card(
      escapeHtml(kw),
      `<p>${descriptions[i % descriptions.length]}</p>`,
      style
    );
  });

  const featuresGrid = ui.grid(featureCards, parsed.sections >= 3 ? 3 : 2, style);

  const statsData = [
    { label: '用户数', value: '10,000+' },
    { label: '满意度', value: '98.5%' },
    { label: '响应时间', value: '<50ms' },
    { label: '可用性', value: '99.99%' },
  ];
  const statsHtml = ui.stats(statsData, style);

  const aboutCards = parsed.keywords.slice(0, 3).map(kw =>
    ui.card(
      `关于 ${escapeHtml(kw)}`,
      `<p>我们致力于打造行业领先的解决方案，通过持续创新和技术突破，为用户创造更大价值。每一个细节都经过精心打磨，确保最佳体验。</p>`,
      style
    )
  );
  const aboutGrid = ui.grid(aboutCards, 3, style);

  const footerHtml = ui.footer(
    `© 2026 DesignSeed. 使用 ${style.name || '默认'} 风格生成 · Powered by DesignSeed Engine`,
    style
  );

  return `${navHtml}
${heroHtml}

<section id="features" style="padding: ${l.sectionSpacing || '80px'} ${l.spacing || '20px'};">
  <div style="max-width: ${l.maxWidth || '1200px'}; margin: 0 auto;">
    <h2 style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[4] + 'px' : '28px'}; font-weight: ${t.fontWeight ? t.fontWeight.bold : 700}; color: ${c.primary || '#000'}; text-align: center; margin-bottom: 48px;">核心功能</h2>
    ${featuresGrid}
  </div>
</section>

${statsHtml}

<section id="about" style="padding: ${l.sectionSpacing || '80px'} ${l.spacing || '20px'};">
  <div style="max-width: ${l.maxWidth || '1200px'}; margin: 0 auto;">
    <h2 style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[4] + 'px' : '28px'}; font-weight: ${t.fontWeight ? t.fontWeight.bold : 700}; color: ${c.primary || '#000'}; text-align: center; margin-bottom: 48px;">关于我们</h2>
    ${aboutGrid}
  </div>
</section>

${footerHtml}`;
}

function render(prompt, options) {
  const opts = options || {};
  const styleId = opts.style || DEFAULT_STYLE;
  const style = getStyle(styleId);
  const title = opts.title || prompt || 'DesignSeed Page';
  const head = buildHead(title, style);
  const body = buildContent(prompt, style);
  return `<!DOCTYPE html>
<html lang="zh-CN">
${head}
<body>
${body}
</body>
</html>`;
}

function generateDemo() {
  const allStyles = Object.keys(styles).filter(k => !k.startsWith('_') && k !== 'STYLE_INDEX');
  let sections = '';
  for (const id of allStyles) {
    const s = styles[id];
    const c = s.colors || {};
    const t = s.typography || {};
    const l = s.layout || {};
    const sh = s.shadows || {};
    const bg = (c.background || '#FFFFFF');
    const isGradient = bg.includes('gradient');
    const sectionBg = isGradient ? bg : bg;
    sections += `
    <section style="background: ${sectionBg}; padding: 48px 24px; margin: 24px 0; border-radius: ${l.borderRadius || '8px'}; box-shadow: ${sh.medium || 'none'};">
      <div style="max-width: ${l.maxWidth || '1200px'}; margin: 0 auto;">
        <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 24px;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${c.primary || '#000'};"></span>
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${c.secondary || '#666'};"></span>
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: ${c.accent || '#0066CC'};"></span>
          <h2 style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[3] + 'px' : '22px'}; font-weight: ${t.fontWeight ? t.fontWeight.bold : 700}; color: ${c.text || '#1A1A1A'}; margin: 0;">${s.name} (${s.nameEn})</h2>
        </div>
        <p style="font-family: ${t.fontFamily || 'sans-serif'}; font-size: ${t.scale ? t.scale[1] + 'px' : '14px'}; color: ${c.textSecondary || '#888'}; margin-bottom: 16px;">
          正式度: ${s.tone.formality} · 温暖度: ${s.tone.warmth} · 复杂度: ${s.tone.complexity} · 创新度: ${s.tone.innovation}
        </p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          ${ui.button('主要按钮', 'primary', s)}
          ${ui.button('次要按钮', 'secondary', s)}
          ${ui.button('强调按钮', 'accent', s)}
        </div>
      </div>
    </section>`;
  }
  const demoHead = buildHead('DesignSeed 风格展示', styles.minimalism);
  return `<!DOCTYPE html>
<html lang="zh-CN">
${demoHead}
<body style="background: #F5F5F5;">
  <header style="padding: 32px 24px; text-align: center; background: #000; color: #FFF;">
    <h1 style="font-size: 36px; font-weight: 700; margin: 0 0 8px;">DesignSeed 风格展示</h1>
    <p style="font-size: 16px; opacity: 0.7; margin: 0;">12 种内置风格流派一览</p>
  </header>
  <main style="max-width: 900px; margin: 0 auto; padding: 24px;">
    ${sections}
  </main>
  <footer style="padding: 24px; text-align: center; color: #888; font-size: 12px;">
    © 2026 DesignSeed Engine · Style Demo
  </footer>
</body>
</html>`;
}

function listStyles() {
  const idx = styles.STYLE_INDEX || Object.entries(styles)
    .filter(([k]) => !k.startsWith('_'))
    .map(([id, s]) => ({ id, name: s.name, nameEn: s.nameEn, tone: s.tone }));
  return idx;
}

module.exports = { render, generateDemo, listStyles, getStyle };
