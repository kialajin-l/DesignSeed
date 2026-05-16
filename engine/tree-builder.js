/**
 * DesignSeed — Tree Builder
 * v0.6.2
 *
 * 将自然语言 prompt 解析为结构化 DesignTree。
 * AI 生成管道核心：prompt → 意图解析 → DesignTree 构建
 *
 * 纯规则引擎，不依赖外部 LLM（LLM 集成在 NightShift 侧）
 * 输出 DesignTree，可直接被 tree-renderer 转为 HTML
 */

const { createTree, createNode, addChild, pushChild } = require('./design-tree');
const styles = require('./templates/styles');
const mixer = require('./mixer');

const DEFAULT_STYLE = 'minimalism';

function parseIntent(prompt) {
  const lower = prompt.toLowerCase();
  const words = prompt.split(/[\s,，、。！？：:]+/).filter(w => w.length > 1);
  const keywords = words.slice(0, 8);

  let pageType = 'landing';
  if (/仪表盘|dashboard|管理|控制台|后台/.test(lower)) pageType = 'dashboard';
  else if (/博客|blog|文章|日志/.test(lower)) pageType = 'blog';
  else if (/电商|商城|商店|shop|store|商品|购买/.test(lower)) pageType = 'ecommerce';
  else if (/登录|注册|login|signup|auth/.test(lower)) pageType = 'auth';
  else if (/文档|doc|帮助|help|wiki/.test(lower)) pageType = 'docs';
  else if (/作品集|portfolio|展示|gallery/.test(lower)) pageType = 'portfolio';

  const features = [];
  if (/导航|nav|菜单|menu|header|顶栏/.test(lower)) features.push('nav');
  if (/hero|首屏|横幅|banner|大图|品牌|故事|story/.test(lower)) features.push('hero');
  if (/功能|feature|特性|亮点|产品展示|展示|产品|product/.test(lower)) features.push('features');
  if (/价格|price|定价|套餐|plan/.test(lower)) features.push('pricing');
  if (/评价|review|testimonial|用户说/.test(lower)) features.push('testimonials');
  if (/统计|stat|数据|指标/.test(lower)) features.push('stats');
  if (/关于|about|团队|team|故事|story|品牌故事/.test(lower)) features.push('about');
  if (/联系|contact|表单|form|邮箱|email|订阅|newsletter/.test(lower)) features.push('contact');
  if (/画廊|gallery|相册|作品展示/.test(lower)) features.push('gallery');
  if (/团队|team|成员/.test(lower)) features.push('team');
  if (/常见问题|faq|问答|Q&A/.test(lower)) features.push('faq');
  if (/订阅|newsletter/.test(lower)) features.push('newsletter');
  if (/行动号召|cta|立即|免费试用/.test(lower)) features.push('cta');
  if (/横幅|banner|公告|优惠/.test(lower)) features.push('banner');
  if (/时间线|timeline|历程|发展/.test(lower)) features.push('timeline');
  if (/页脚|footer|版权/.test(lower)) features.push('footer');
  if (/卡片|card/.test(lower)) features.push('cards');
  if (/列表|list/.test(lower)) features.push('list');
  if (/表格|table/.test(lower)) features.push('table');
  if (/搜索|search/.test(lower)) features.push('search');

  // 所有页面类型都确保有合理的默认 features
  if (!features.includes('nav')) features.unshift('nav');
  if (features.length === 0) {
    features.push('hero', 'features', 'footer');
  } else {
    if (!features.includes('hero')) features.push('hero');
    if (!features.includes('footer')) features.push('footer');
  }

  return { prompt, keywords, pageType, features };
}

function resolveStyle(styleId) {
  if (!styleId) return styles[DEFAULT_STYLE];
  const mix = mixer.parseMixString(styleId);
  if (mix) {
    const a = styles[mix.styleA];
    const b = styles[mix.styleB];
    if (a && b) return mixer.blend(a, b, { ratio: mix.ratio });
  }
  return styles[styleId] || styles[DEFAULT_STYLE];
}

function buildTree(intent, style) {
  const c = style.colors || {};
  const t = style.typography || {};
  const l = style.layout || {};

  const tree = createTree({
    pageId: 'home',
    title: intent.keywords.slice(0, 3).join(' | ') || 'DesignSeed Page',
    variables: {
      colorPrimary: c.primary || '#000',
      colorSecondary: c.secondary || '#666',
      colorAccent: c.accent || '#0066CC',
      colorBackground: c.background || '#FFF',
      colorText: c.text || '#1A1A1A',
      colorTextSecondary: c.textSecondary || '#888',
      colorSurface: c.surface || '#F5F5F5',
      colorBorder: c.border || '#E0E0E0',
      fontFamily: t.fontFamily || 'sans-serif',
      spacing: l.spacing || '20px',
      maxWidth: l.maxWidth || '1200px',
      borderRadius: l.borderRadius || '8px',
    },
    fonts: t.fontFamily ? [{ name: t.fontFamily, weights: [400, 500, 700] }] : [],
  });

  const rootId = tree.root.id;
  for (const feature of intent.features) {
    const node = buildFeatureNode(feature, intent, style);
    if (node) addChild(tree, rootId, node);
  }
  return tree;
}

function buildFeatureNode(feature, intent, style) {
  switch (feature) {
    case 'nav': return buildNav(intent, style);
    case 'hero': return buildHero(intent, style);
    case 'features': return buildFeatures(intent, style);
    case 'pricing': return buildPricing(intent, style);
    case 'testimonials': return buildTestimonials(intent, style);
    case 'stats': return buildStats(intent, style);
    case 'about': return buildAbout(intent, style);
    case 'contact': return buildContact(intent, style);
    case 'footer': return buildFooter(intent, style);
    case 'cards': return buildCards(intent, style);
    case 'list': return buildList(intent, style);
    case 'table': return buildTable(intent, style);
    case 'search': return buildSearch(intent, style);
    case 'dashboard': return buildDashboard(intent, style);
    case 'gallery': return buildGallery(intent, style);
    case 'team': return buildTeam(intent, style);
    case 'faq': return buildFaq(intent, style);
    case 'newsletter': return buildNewsletter(intent, style);
    case 'cta': return buildCta(intent, style);
    case 'banner': return buildBanner(intent, style);
    case 'timeline': return buildTimeline(intent, style);
    default: return null;
  }
}

// ---- Helper: resolve common style values ----
function S(style) {
  return {
    c: style.colors || {},
    t: style.typography || {},
    l: style.layout || {},
    sh: style.shadows || {},
  };
}

function buildNav(intent, style) {
  const { c, t, l } = S(style);
  const compNav = (style.components && style.components.nav) || {};

  const nav = createNode({
    type: 'container', tag: 'nav', name: '\u5bfc\u822a\u680f', semantic: 'nav',
    styles: {
      display: 'flex', alignItems: 'center', height: compNav.height || '64px',
      padding: `0 ${l.spacing || '20px'}`, maxWidth: l.maxWidth || '1200px',
      margin: '0 auto', borderBottom: compNav.borderBottom || `1px solid ${c.border || '#E0E0E0'}`,
      background: compNav.background || 'transparent',
    },
  });

  pushChild(nav, createNode({
    type: 'text', tag: 'span', text: intent.keywords[0] || 'Brand', name: 'Logo',
    styles: {
      fontFamily: t.fontFamily || 'sans-serif', fontSize: `${t.scale ? t.scale[2] : 18}px`,
      fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, color: c.primary || '#000', marginRight: 'auto',
    },
  }));

  for (const link of [{ text: '\u9996\u9875', href: '#' }, { text: '\u529f\u80fd', href: '#features' }, { text: '\u5173\u4e8e', href: '#about' }, { text: '\u8054\u7cfb', href: '#contact' }]) {
    pushChild(nav, createNode({
      type: 'text', tag: 'a', text: link.text, name: `\u5bfc\u822a-${link.text}`, props: { href: link.href },
      styles: {
        color: c.primary || '#000', textDecoration: 'none', fontFamily: t.fontFamily || 'sans-serif',
        fontSize: `${t.scale ? t.scale[1] : 14}px`, fontWeight: `${t.fontWeight ? t.fontWeight.medium : 500}`, marginRight: '24px',
      },
    }));
  }
  return nav;
}

function buildHero(intent, style) {
  const { c, t, l } = S(style);
  const compHero = (style.components && style.components.hero) || {};

  const isGradient = (c.background || '').includes('gradient');
  const heroBg = style.heroBg || (isGradient ? c.background : (c.primary || '#000'));
  const darkBgs = ['#0A0A0F', '#0B0E17', '#1C1917', '#1A1C2C', '#2C2C2C'];
  const textColor = (isGradient || darkBgs.includes(heroBg) || style.heroBg) ? (c.text || '#FFFFFF') : '#FFFFFF';

  const hero = createNode({
    type: 'section', name: 'Hero \u533a\u57df', semantic: 'hero',
    styles: { padding: compHero.padding || '120px 0', textAlign: compHero.textAlign || 'center', background: heroBg },
  });

  const container = createNode({
    type: 'container', name: 'Hero \u5185\u5bb9\u5bb9\u5668',
    styles: { maxWidth: l.maxWidth || '1200px', margin: '0 auto', padding: `0 ${l.spacing || '20px'}` },
  });

  pushChild(container, createNode({
    type: 'text', tag: 'h1', text: intent.prompt || intent.keywords.join(' '), name: 'Hero \u6807\u9898',
    styles: {
      fontFamily: t.fontFamily || 'sans-serif', fontSize: `${t.scale ? t.scale[5] : 48}px`,
      fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, color: textColor, marginBottom: '16px', lineHeight: '1.2',
    },
  }));

  pushChild(container, createNode({
    type: 'text', tag: 'p',
    text: `\u57fa\u4e8e\u300c${intent.keywords.slice(0, 3).join('\u3001')}\u300d\u7b49\u5173\u952e\u8bcd\u81ea\u52a8\u751f\u6210\u7684\u9875\u9762\u8bbe\u8ba1`, name: 'Hero \u526f\u6807\u9898',
    styles: {
      fontFamily: t.fontFamily || 'sans-serif', fontSize: `${t.scale ? t.scale[2] : 18}px`,
      color: textColor, opacity: '0.85', marginBottom: '32px', maxWidth: '640px',
      marginLeft: 'auto', marginRight: 'auto', lineHeight: `${t.lineHeight || 1.6}`,
    },
  }));

  pushChild(container, createNode({
    type: 'button', text: '\u4e86\u89e3\u66f4\u591a', name: 'CTA \u6309\u94ae',
    styles: {
      padding: '12px 24px', borderRadius: l.borderRadius || '8px',
      fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, background: c.accent || '#0066CC',
      color: '#FFFFFF', border: 'none', fontFamily: t.fontFamily || 'sans-serif',
      fontSize: `${t.scale ? t.scale[1] : 14}px`, cursor: 'pointer', display: 'inline-block',
    },
  }));

  pushChild(hero, container);
  return hero;
}

function buildFeatures(intent, style) {
  const { c, t, l } = S(style);

  const section = createNode({
    type: 'section', name: '\u529f\u80fd\u533a\u57df', semantic: 'features',
    styles: { padding: `${l.sectionSpacing || '80px'} ${l.spacing || '20px'}` },
  });

  const container = createNode({
    type: 'container', name: '\u529f\u80fd\u5bb9\u5668',
    styles: { maxWidth: l.maxWidth || '1200px', margin: '0 auto' },
  });

  pushChild(container, createNode({
    type: 'text', tag: 'h2', text: '\u6838\u5fc3\u529f\u80fd', name: '\u529f\u80fd\u6807\u9898',
    styles: {
      fontFamily: t.fontFamily || 'sans-serif', fontSize: `${t.scale ? t.scale[4] : 28}px`,
      fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, color: c.primary || '#000',
      textAlign: 'center', marginBottom: '48px',
    },
  }));

  const grid = createNode({
    type: 'container', name: '\u529f\u80fd\u7f51\u683c',
    styles: { display: 'grid', gridTemplateColumns: `repeat(${Math.min(intent.keywords.length, 3)}, 1fr)`, gap: l.spacing || '20px' },
  });

  const descs = [
    '\u7cbe\u5fc3\u8bbe\u8ba1\u7684\u6838\u5fc3\u529f\u80fd\u6a21\u5757\uff0c\u63d0\u4f9b\u5353\u8d8a\u7684\u7528\u6237\u4f53\u9a8c\u548c\u9ad8\u6548\u7684\u4ea4\u4e92\u6d41\u7a0b\u3002',
    '\u667a\u80fd\u5316\u7684\u6570\u636e\u5904\u7406\u5f15\u64ce\uff0c\u5b9e\u65f6\u5206\u6790\u5e76\u5448\u73b0\u5173\u952e\u4e1a\u52a1\u6307\u6807\u3002',
    '\u7075\u6d3b\u7684\u914d\u7f6e\u7cfb\u7edf\uff0c\u652f\u6301\u4e2a\u6027\u5316\u5b9a\u5236\u548c\u591a\u573a\u666f\u9002\u914d\u3002',
    '\u5b89\u5168\u53ef\u9760\u7684\u5e95\u5c42\u67b6\u6784\uff0c\u4fdd\u969c\u6570\u636e\u9690\u79c1\u548c\u7cfb\u7edf\u7a33\u5b9a\u6027\u3002',
    '\u7b80\u6d01\u76f4\u89c2\u7684\u64cd\u4f5c\u754c\u9762\uff0c\u964d\u4f4e\u5b66\u4e60\u6210\u672c\uff0c\u63d0\u5347\u4f7f\u7528\u6548\u7387\u3002',
    '\u5f00\u653e\u7684 API \u63a5\u53e3\uff0c\u652f\u6301\u7b2c\u4e09\u65b9\u96c6\u6210\u548c\u751f\u6001\u6269\u5c55\u3002',
  ];

  for (let i = 0; i < intent.keywords.slice(0, 6).length; i++) {
    const kw = intent.keywords[i];
    const card = createNode({
      type: 'component', name: `\u529f\u80fd\u5361\u7247-${kw}`, semantic: 'feature-card',
      styles: { padding: '24px', border: `1px solid ${c.border || '#E0E0E0'}`, borderRadius: l.borderRadius || '8px', background: c.surface || '#FFFFFF' },
    });
    pushChild(card, createNode({
      type: 'text', tag: 'h3', text: kw, name: '\u5361\u7247\u6807\u9898',
      styles: { fontSize: `${t.scale ? t.scale[3] : 22}px`, fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, marginBottom: '12px', color: c.primary || '#000' },
    }));
    pushChild(card, createNode({
      type: 'text', tag: 'p', text: descs[i % descs.length], name: '\u5361\u7247\u63cf\u8ff0',
      styles: { fontSize: `${t.scale ? t.scale[1] : 14}px`, lineHeight: `${t.lineHeight || 1.6}`, color: c.textSecondary || '#666' },
    }));
    pushChild(grid, card);
  }

  pushChild(section, container);
  pushChild(container, grid);
  return section;
}

function buildPricing(intent, style) {
  const { c, t, l } = S(style);

  const section = createNode({
    type: 'section', name: '\u4ef7\u683c\u533a\u57df', semantic: 'pricing',
    styles: { padding: `${l.sectionSpacing || '80px'} ${l.spacing || '20px'}`, background: c.surface || '#F5F5F5' },
  });

  const container = createNode({
    type: 'container', name: '\u4ef7\u683c\u5bb9\u5668',
    styles: { maxWidth: l.maxWidth || '1200px', margin: '0 auto' },
  });

  pushChild(container, createNode({
    type: 'text', tag: 'h2', text: '\u9009\u62e9\u9002\u5408\u4f60\u7684\u65b9\u6848', name: '\u4ef7\u683c\u6807\u9898',
    styles: { fontFamily: t.fontFamily || 'sans-serif', fontSize: `${t.scale ? t.scale[4] : 28}px`, fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, color: c.primary || '#000', textAlign: 'center', marginBottom: '48px' },
  }));

  const grid = createNode({
    type: 'container', name: '\u4ef7\u683c\u7f51\u683c',
    styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: l.spacing || '20px' },
  });

  const plans = [
    { name: '\u57fa\u7840\u7248', price: '\u514d\u8d39', features: ['5 \u4e2a\u9879\u76ee', '\u57fa\u7840\u5206\u6790', '\u793e\u533a\u652f\u6301'] },
    { name: '\u4e13\u4e1a\u7248', price: '\u00a599/\u6708', features: ['\u65e0\u9650\u9879\u76ee', '\u9ad8\u7ea7\u5206\u6790', '\u4f18\u5148\u652f\u6301', 'API \u8bbf\u95ee'], featured: true },
    { name: '\u4f01\u4e1a\u7248', price: '\u5b9a\u5236', features: ['\u6240\u6709\u4e13\u4e1a\u7248\u529f\u80fd', '\u79c1\u6709\u90e8\u7f72', '\u4e13\u5c5e\u5ba2\u670d', 'SLA \u4fdd\u969c'] },
  ];

  for (const plan of plans) {
    const card = createNode({
      type: 'component', name: `\u4ef7\u683c\u5361\u7247-${plan.name}`, semantic: 'pricing-card',
      styles: {
        padding: '32px', borderRadius: l.borderRadius || '8px', textAlign: 'center',
        background: plan.featured ? (c.primary || '#000') : (c.surface || '#FFFFFF'),
        color: plan.featured ? '#FFFFFF' : (c.text || '#1A1A1A'),
        border: plan.featured ? 'none' : `1px solid ${c.border || '#E0E0E0'}`,
      },
    });
    pushChild(card, createNode({
      type: 'text', tag: 'h3', text: plan.name, name: '\u65b9\u6848\u540d',
      styles: { fontSize: `${t.scale ? t.scale[3] : 22}px`, fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, marginBottom: '8px' },
    }));
    pushChild(card, createNode({
      type: 'text', tag: 'div', text: plan.price, name: '\u4ef7\u683c',
      styles: { fontSize: `${t.scale ? t.scale[5] : 48}px`, fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, marginBottom: '24px' },
    }));
    for (const feat of plan.features) {
      pushChild(card, createNode({
        type: 'text', tag: 'div', text: `\u2713 ${feat}`, name: `\u529f\u80fd-${feat}`,
        styles: { fontSize: `${t.scale ? t.scale[1] : 14}px`, marginBottom: '8px', opacity: '0.9' },
      }));
    }
    pushChild(grid, card);
  }

  pushChild(section, container);
  pushChild(container, grid);
  return section;
}

function buildTestimonials(intent, style) {
  const { c, t, l } = S(style);

  const section = createNode({
    type: 'section', name: '\u7528\u6237\u8bc4\u4ef7', semantic: 'testimonials',
    styles: { padding: `${l.sectionSpacing || '80px'} ${l.spacing || '20px'}` },
  });

  const container = createNode({
    type: 'container', name: '\u8bc4\u4ef7\u5bb9\u5668',
    styles: { maxWidth: l.maxWidth || '1200px', margin: '0 auto' },
  });

  pushChild(container, createNode({
    type: 'text', tag: 'h2', text: '\u7528\u6237\u8bc4\u4ef7', name: '\u8bc4\u4ef7\u6807\u9898',
    styles: { fontFamily: t.fontFamily || 'sans-serif', fontSize: `${t.scale ? t.scale[4] : 28}px`, fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, color: c.primary || '#000', textAlign: 'center', marginBottom: '48px' },
  }));

  const grid = createNode({
    type: 'container', name: '\u8bc4\u4ef7\u7f51\u683c',
    styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: l.spacing || '20px' },
  });

  const tdata = [
    { name: '\u5f20\u4e09', role: '\u4ea7\u54c1\u7ecf\u7406', text: '\u8fd9\u4e2a\u5de5\u5177\u5f7b\u5e95\u6539\u53d8\u4e86\u6211\u4eec\u7684\u8bbe\u8ba1\u6d41\u7a0b\uff0c\u6548\u7387\u63d0\u5347\u4e86 3 \u500d\u3002' },
    { name: '\u674e\u56db', role: '\u524d\u7aef\u5de5\u7a0b\u5e08', text: '\u751f\u6210\u7684\u4ee3\u7801\u8d28\u91cf\u5f88\u9ad8\uff0c\u76f4\u63a5\u5c31\u80fd\u7528\uff0c\u7701\u4e86\u5f88\u591a\u65f6\u95f4\u3002' },
    { name: '\u738b\u4e94', role: '\u8bbe\u8ba1\u5e08', text: '\u98ce\u683c\u591a\u6837\u6027\u4ee4\u4eba\u60ca\u559c\uff0c\u6bcf\u6b21\u90fd\u80fd\u751f\u6210\u4e0d\u540c\u7684\u8bbe\u8ba1\u65b9\u6848\u3002' },
  ];

  for (const td of tdata) {
    const card = createNode({
      type: 'component', name: `\u8bc4\u4ef7-${td.name}`, semantic: 'testimonial-card',
      styles: { padding: '24px', border: `1px solid ${c.border || '#E0E0E0'}`, borderRadius: l.borderRadius || '8px', background: c.surface || '#FFFFFF' },
    });
    pushChild(card, createNode({
      type: 'text', tag: 'p', text: `\u201c${td.text}\u201d`, name: '\u8bc4\u4ef7\u5185\u5bb9',
      styles: { fontSize: `${t.scale ? t.scale[1] : 14}px`, lineHeight: `${t.lineHeight || 1.6}`, color: c.textSecondary || '#666', marginBottom: '16px', fontStyle: 'italic' },
    }));
    pushChild(card, createNode({
      type: 'text', tag: 'div', text: `${td.name} \u00b7 ${td.role}`, name: '\u8bc4\u4ef7\u8005',
      styles: { fontSize: `${t.scale ? t.scale[0] : 12}px`, color: c.textSecondary || '#888', fontWeight: `${t.fontWeight ? t.fontWeight.medium : 500}` },
    }));
    pushChild(grid, card);
  }

  pushChild(section, container);
  pushChild(container, grid);
  return section;
}

function buildStats(intent, style) {
  const { c, t, l } = S(style);

  const section = createNode({
    type: 'section', name: '\u6570\u636e\u7edf\u8ba1', semantic: 'stats',
    styles: {
      display: 'flex', justifyContent: 'space-around', maxWidth: l.maxWidth || '1200px', margin: '0 auto',
      padding: `${l.sectionSpacing || '80px'} ${l.spacing || '20px'}`, background: c.surface || '#F5F5F5', borderRadius: l.borderRadius || '8px',
    },
  });

  for (const s of [{ label: '\u7528\u6237\u6570', value: '10,000+' }, { label: '\u6ee1\u610f\u5ea6', value: '98.5%' }, { label: '\u54cd\u5e94\u65f6\u95f4', value: '<50ms' }, { label: '\u53ef\u7528\u6027', value: '99.99%' }]) {
    const item = createNode({
      type: 'component', name: `\u7edf\u8ba1-${s.label}`, semantic: 'stat-item',
      styles: { textAlign: 'center', padding: l.spacing || '20px' },
    });
    pushChild(item, createNode({
      type: 'text', tag: 'div', text: s.value, name: '\u7edf\u8ba1\u503c',
      styles: { fontSize: `${t.scale ? t.scale[4] : 28}px`, fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, color: c.primary || '#000', marginBottom: '8px' },
    }));
    pushChild(item, createNode({
      type: 'text', tag: 'div', text: s.label, name: '\u7edf\u8ba1\u6807\u7b7e',
      styles: { fontSize: `${t.scale ? t.scale[1] : 14}px`, color: c.textSecondary || '#888' },
    }));
    pushChild(section, item);
  }
  return section;
}

function buildAbout(intent, style) {
  const { c, t, l } = S(style);

  const section = createNode({
    type: 'section', name: '\u5173\u4e8e\u6211\u4eec', semantic: 'about',
    styles: { padding: `${l.sectionSpacing || '80px'} ${l.spacing || '20px'}` },
  });

  const container = createNode({
    type: 'container', name: '\u5173\u4e8e\u5bb9\u5668',
    styles: { maxWidth: l.maxWidth || '1200px', margin: '0 auto' },
  });

  pushChild(container, createNode({
    type: 'text', tag: 'h2', text: '\u5173\u4e8e\u6211\u4eec', name: '\u5173\u4e8e\u6807\u9898',
    styles: { fontFamily: t.fontFamily || 'sans-serif', fontSize: `${t.scale ? t.scale[4] : 28}px`, fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, color: c.primary || '#000', textAlign: 'center', marginBottom: '48px' },
  }));

  pushChild(container, createNode({
    type: 'text', tag: 'p', text: '\u6211\u4eec\u81f4\u529b\u4e8e\u6253\u9020\u884c\u4e1a\u9886\u5148\u7684\u89e3\u51b3\u65b9\u6848\uff0c\u901a\u8fc7\u6301\u7eed\u521b\u65b0\u548c\u6280\u672f\u7a81\u7834\uff0c\u4e3a\u7528\u6237\u521b\u9020\u66f4\u5927\u4ef7\u503c\u3002', name: '\u5173\u4e8e\u63cf\u8ff0',
    styles: { fontSize: `${t.scale ? t.scale[2] : 18}px`, lineHeight: `${t.lineHeight || 1.6}`, color: c.textSecondary || '#666', textAlign: 'center', maxWidth: '640px', margin: '0 auto' },
  }));

  pushChild(section, container);
  return section;
}

function buildContact(intent, style) {
  const { c, t, l } = S(style);

  const section = createNode({
    type: 'section', name: '\u8054\u7cfb\u6211\u4eec', semantic: 'contact',
    styles: { padding: `${l.sectionSpacing || '80px'} ${l.spacing || '20px'}`, background: c.surface || '#F5F5F5' },
  });

  const container = createNode({
    type: 'container', name: '\u8054\u7cfb\u5bb9\u5668',
    styles: { maxWidth: l.maxWidth || '1200px', margin: '0 auto', textAlign: 'center' },
  });

  pushChild(container, createNode({
    type: 'text', tag: 'h2', text: '\u8054\u7cfb\u6211\u4eec', name: '\u8054\u7cfb\u6807\u9898',
    styles: { fontFamily: t.fontFamily || 'sans-serif', fontSize: `${t.scale ? t.scale[4] : 28}px`, fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, color: c.primary || '#000', marginBottom: '16px' },
  }));

  pushChild(container, createNode({
    type: 'text', tag: 'p', text: '\u6709\u4efb\u4f55\u95ee\u9898\uff1f\u6211\u4eec\u5f88\u4e50\u610f\u542c\u5230\u4f60\u7684\u58f0\u97f3\u3002', name: '\u8054\u7cfb\u63cf\u8ff0',
    styles: { fontSize: `${t.scale ? t.scale[2] : 18}px`, color: c.textSecondary || '#666', marginBottom: '32px' },
  }));

  const form = createNode({ type: 'container', name: '\u8054\u7cfb\u8868\u5355', styles: { maxWidth: '480px', margin: '0 auto' } });
  pushChild(form, createNode({
    type: 'text', tag: 'input', name: '\u90ae\u7bb1\u8f93\u5165', props: { type: 'email', placeholder: 'your@email.com' },
    styles: { width: '100%', padding: '12px 16px', borderRadius: l.borderRadius || '8px', border: `1px solid ${c.border || '#E0E0E0'}`, fontSize: `${t.scale ? t.scale[1] : 14}px`, marginBottom: '12px', fontFamily: t.fontFamily || 'sans-serif' },
  }));
  pushChild(form, createNode({
    type: 'button', text: '\u53d1\u9001\u6d88\u606f', name: '\u63d0\u4ea4\u6309\u94ae',
    styles: { width: '100%', padding: '12px 24px', borderRadius: l.borderRadius || '8px', background: c.primary || '#000', color: '#FFFFFF', border: 'none', fontSize: `${t.scale ? t.scale[1] : 14}px`, fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, cursor: 'pointer', fontFamily: t.fontFamily || 'sans-serif' },
  }));

  pushChild(container, form);
  pushChild(section, container);
  return section;
}

function buildFooter(intent, style) {
  const { c, t, l } = S(style);

  return createNode({
    type: 'container', tag: 'footer', name: '\u9875\u811a', semantic: 'footer',
    styles: { padding: l.spacing || '20px', maxWidth: l.maxWidth || '1200px', margin: `${l.sectionSpacing || '80px'} auto 0`, borderTop: `1px solid ${c.border || '#E0E0E0'}`, textAlign: 'center' },
    children: [createNode({
      type: 'text', tag: 'p', text: `\u00a9 2026 ${intent.keywords[0] || 'DesignSeed'}. Powered by DesignSeed Engine`, name: '\u7248\u6743\u4fe1\u606f',
      styles: { fontSize: `${t.scale ? t.scale[0] : 12}px`, color: c.textSecondary || '#888' },
    })],
  });
}

function buildCards(intent, style) {
  const { c, t, l } = S(style);

  const section = createNode({
    type: 'section', name: '\u5361\u7247\u533a\u57df', semantic: 'cards',
    styles: { padding: `${l.sectionSpacing || '80px'} ${l.spacing || '20px'}` },
  });

  const grid = createNode({
    type: 'container', name: '\u5361\u7247\u7f51\u683c',
    styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: l.spacing || '20px', maxWidth: l.maxWidth || '1200px', margin: '0 auto' },
  });

  for (const kw of intent.keywords.slice(0, 6)) {
    const card = createNode({
      type: 'component', name: `\u5361\u7247-${kw}`, semantic: 'card',
      styles: { padding: '24px', border: `1px solid ${c.border || '#E0E0E0'}`, borderRadius: l.borderRadius || '8px', background: c.surface || '#FFFFFF' },
    });
    pushChild(card, createNode({
      type: 'text', tag: 'h3', text: kw, name: '\u5361\u7247\u6807\u9898',
      styles: { fontSize: `${t.scale ? t.scale[3] : 22}px`, fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, color: c.primary || '#000', marginBottom: '12px' },
    }));
    pushChild(card, createNode({
      type: 'text', tag: 'p', text: '\u8fd9\u91cc\u662f\u5361\u7247\u7684\u63cf\u8ff0\u5185\u5bb9\uff0c\u53ef\u4ee5\u6839\u636e\u9700\u8981\u8fdb\u884c\u4fee\u6539\u3002', name: '\u5361\u7247\u63cf\u8ff0',
      styles: { fontSize: `${t.scale ? t.scale[1] : 14}px`, color: c.textSecondary || '#666', lineHeight: `${t.lineHeight || 1.6}` },
    }));
    pushChild(grid, card);
  }

  pushChild(section, grid);
  return section;
}

function buildList(intent, style) {
  const { c, t, l } = S(style);

  const section = createNode({
    type: 'section', name: '\u5217\u8868\u533a\u57df', semantic: 'list',
    styles: { padding: `${l.sectionSpacing || '80px'} ${l.spacing || '20px'}`, maxWidth: l.maxWidth || '1200px', margin: '0 auto' },
  });

  for (const kw of intent.keywords.slice(0, 5)) {
    const item = createNode({
      type: 'container', name: `\u5217\u8868\u9879-${kw}`,
      styles: { display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: `1px solid ${c.border || '#E0E0E0'}` },
    });
    pushChild(item, createNode({
      type: 'text', tag: 'span', text: kw, name: '\u5217\u8868\u9879\u6587\u672c',
      styles: { fontSize: `${t.scale ? t.scale[2] : 18}px`, color: c.text || '#1A1A1A', flex: '1' },
    }));
    pushChild(item, createNode({
      type: 'text', tag: 'span', text: '\u2192', name: '\u7bad\u5934',
      styles: { fontSize: `${t.scale ? t.scale[2] : 18}px`, color: c.primary || '#000' },
    }));
    pushChild(section, item);
  }
  return section;
}

function buildTable(intent, style) {
  const { c, t, l } = S(style);

  const section = createNode({
    type: 'section', name: '\u8868\u683c\u533a\u57df', semantic: 'table',
    styles: { padding: `${l.sectionSpacing || '80px'} ${l.spacing || '20px'}`, maxWidth: l.maxWidth || '1200px', margin: '0 auto' },
  });

  const table = createNode({
    type: 'container', tag: 'table', name: '\u6570\u636e\u8868\u683c',
    styles: { width: '100%', borderCollapse: 'collapse', fontFamily: t.fontFamily || 'sans-serif' },
  });

  const thead = createNode({ type: 'container', tag: 'thead', name: '\u8868\u5934' });
  const headerRow = createNode({ type: 'container', tag: 'tr', name: '\u8868\u5934\u884c' });
  for (const kw of intent.keywords.slice(0, 4)) {
    pushChild(headerRow, createNode({
      type: 'text', tag: 'th', text: kw, name: `\u8868\u5934-${kw}`,
      styles: { padding: '12px 16px', textAlign: 'left', borderBottom: `2px solid ${c.border || '#E0E0E0'}`, color: c.primary || '#000', fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}` },
    }));
  }
  pushChild(thead, headerRow);
  pushChild(table, thead);

  const tbody = createNode({ type: 'container', tag: 'tbody', name: '\u8868\u4f53' });
  for (let r = 0; r < 3; r++) {
    const row = createNode({ type: 'container', tag: 'tr', name: `\u884c-${r}` });
    for (let c2 = 0; c2 < Math.min(intent.keywords.length, 4); c2++) {
      pushChild(row, createNode({
        type: 'text', tag: 'td', text: `\u6570\u636e ${r + 1}-${c2 + 1}`, name: `\u5355\u5143\u683c-${r}-${c2}`,
        styles: { padding: '12px 16px', borderBottom: `1px solid ${c.border || '#E0E0E0'}`, color: c.text || '#1A1A1A' },
      }));
    }
    pushChild(tbody, row);
  }
  pushChild(table, tbody);
  pushChild(section, table);
  return section;
}

function buildSearch(intent, style) {
  const { c, t, l } = S(style);

  const section = createNode({
    type: 'section', name: '\u641c\u7d22\u533a\u57df', semantic: 'search',
    styles: { padding: `${l.spacing || '20px'}`, maxWidth: l.maxWidth || '1200px', margin: '0 auto' },
  });

  const searchBox = createNode({
    type: 'container', name: '\u641c\u7d22\u6846\u5bb9\u5668',
    styles: { display: 'flex', gap: '8px', maxWidth: '480px', margin: '0 auto' },
  });

  pushChild(searchBox, createNode({
    type: 'text', tag: 'input', name: '\u641c\u7d22\u8f93\u5165', props: { type: 'text', placeholder: '\u641c\u7d22...' },
    styles: { flex: '1', padding: '12px 16px', borderRadius: l.borderRadius || '8px', border: `1px solid ${c.border || '#E0E0E0'}`, fontSize: `${t.scale ? t.scale[1] : 14}px`, fontFamily: t.fontFamily || 'sans-serif' },
  }));

  pushChild(searchBox, createNode({
    type: 'button', text: '\u641c\u7d22', name: '\u641c\u7d22\u6309\u94ae',
    styles: { padding: '12px 24px', borderRadius: l.borderRadius || '8px', background: c.primary || '#000', color: '#FFFFFF', border: 'none', fontSize: `${t.scale ? t.scale[1] : 14}px`, fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, cursor: 'pointer', fontFamily: t.fontFamily || 'sans-serif' },
  }));

  pushChild(section, searchBox);
  return section;
}

function buildDashboard(intent, style) {
  const { c, t, l } = S(style);

  const section = createNode({
    type: 'section', name: '\u4eea\u8868\u76d8', semantic: 'dashboard',
    styles: { padding: `${l.sectionSpacing || '80px'} ${l.spacing || '20px'}` },
  });

  const container = createNode({
    type: 'container', name: '\u4eea\u8868\u76d8\u5bb9\u5668',
    styles: { maxWidth: l.maxWidth || '1200px', margin: '0 auto' },
  });

  const statsGrid = createNode({
    type: 'container', name: '\u7edf\u8ba1\u5361\u7247\u7f51\u683c',
    styles: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: l.spacing || '20px', marginBottom: '32px' },
  });

  for (const s of [{ label: '\u603b\u7528\u6237', value: '12,345' }, { label: '\u6d3b\u8dc3\u7528\u6237', value: '8,901' }, { label: '\u8f6c\u5316\u7387', value: '3.2%' }, { label: '\u6536\u5165', value: '\u00a5456K' }]) {
    const card = createNode({
      type: 'component', name: `\u7edf\u8ba1-${s.label}`, semantic: 'stat-card',
      styles: { padding: '24px', border: `1px solid ${c.border || '#E0E0E0'}`, borderRadius: l.borderRadius || '8px', background: c.surface || '#FFFFFF' },
    });
    pushChild(card, createNode({
      type: 'text', tag: 'div', text: s.value, name: '\u7edf\u8ba1\u503c',
      styles: { fontSize: `${t.scale ? t.scale[4] : 28}px`, fontWeight: `${t.fontWeight ? t.fontWeight.bold : 700}`, color: c.primary || '#000', marginBottom: '4px' },
    }));
    pushChild(card, createNode({
      type: 'text', tag: 'div', text: s.label, name: '\u7edf\u8ba1\u6807\u7b7e',
      styles: { fontSize: `${t.scale ? t.scale[0] : 12}px`, color: c.textSecondary || '#888' },
    }));
    pushChild(statsGrid, card);
  }

  pushChild(container, statsGrid);
  pushChild(container, createNode({
    type: 'component', name: '\u56fe\u8868\u533a\u57df', semantic: 'chart',
    styles: { height: '300px', border: `1px solid ${c.border || '#E0E0E0'}`, borderRadius: l.borderRadius || '8px', background: c.surface || '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.textSecondary || '#888', fontSize: `${t.scale ? t.scale[2] : 18}px` },
    text: '\ud83d\udcca \u56fe\u8868\u533a\u57df\uff08\u9884\u7559\uff09',
  }));

  pushChild(section, container);
  return section;
}

// ============================================================
// 主入口
// ============================================================


// ============================================================
// 扩展组件 (v0.6.3 — 20+ components)
// ============================================================

function buildGallery(intent, style) {
  const c = style.colors || {};
  const items = [];
  for (let i = 0; i < 6; i++) {
    items.push({
      type: 'container', tag: 'div', name: 'gallery-item',
      styles: { background: c.surface || '#F5F5F5', borderRadius: style.layout?.borderRadius || '8px', overflow: 'hidden', aspectRatio: '4/3' },
      children: [
        { type: 'text', tag: 'div', text: '📷', styles: { fontSize: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' } },
      ],
    });
  }
  return {
    type: 'container', tag: 'section', name: 'gallery', styles: { padding: '80px 20px', maxWidth: style.layout?.maxWidth || '1200px', margin: '0 auto' },
    children: [
      { type: 'text', tag: 'h2', text: '作品展示', styles: { fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '48px', color: c.text || '#1A1A1A' } },
      { type: 'container', tag: 'div', name: 'gallery-grid', styles: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }, children: items },
    ],
  };
}

function buildTeam(intent, style) {
  const c = style.colors || {};
  const members = ['张三 · CEO', '李四 · CTO', '王五 · 设计总监'];
  return {
    type: 'container', tag: 'section', name: 'team', styles: { padding: '80px 20px', background: c.surface || '#F5F5F5', textAlign: 'center' },
    children: [
      { type: 'text', tag: 'h2', text: '核心团队', styles: { fontSize: '32px', fontWeight: '700', marginBottom: '48px', color: c.text || '#1A1A1A' } },
      { type: 'container', tag: 'div', name: 'team-grid', styles: { display: 'flex', justifyContent: 'center', gap: '40px', maxWidth: style.layout?.maxWidth || '1200px', margin: '0 auto' },
        children: members.map(m => ({
          type: 'container', tag: 'div', name: 'team-member', styles: { textAlign: 'center' },
          children: [
            { type: 'container', tag: 'div', name: 'avatar', styles: { width: '120px', height: '120px', borderRadius: '50%', background: c.primary || '#000', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '32px' }, children: [{ type: 'text', tag: 'span', text: m.charAt(0) }] },
            { type: 'text', tag: 'h3', text: m.split(' · ')[0], styles: { fontSize: '18px', fontWeight: '600', marginBottom: '4px', color: c.text || '#1A1A1A' } },
            { type: 'text', tag: 'p', text: m.split(' · ')[1], styles: { fontSize: '14px', color: c.textSecondary || '#888' } },
          ],
        })),
      },
    ],
  };
}

function buildFaq(intent, style) {
  const c = style.colors || {};
  const items = [
    { q: '如何开始使用？', a: '注册账号后即可开始使用所有功能。' },
    { q: '支持哪些平台？', a: '支持 Web、iOS、Android 全平台。' },
    { q: '数据安全如何保障？', a: '采用银行级加密技术，确保数据安全。' },
  ];
  return {
    type: 'container', tag: 'section', name: 'faq', styles: { padding: '80px 20px', maxWidth: '800px', margin: '0 auto' },
    children: [
      { type: 'text', tag: 'h2', text: '常见问题', styles: { fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '48px', color: c.text || '#1A1A1A' } },
      ...items.map(item => ({
        type: 'container', tag: 'details', name: 'faq-item', styles: { padding: '20px 0', borderBottom: '1px solid ' + (c.border || '#E0E0E0') },
        children: [
          { type: 'text', tag: 'summary', text: item.q, styles: { fontSize: '18px', fontWeight: '600', cursor: 'pointer', color: c.text || '#1A1A1A' } },
          { type: 'text', tag: 'p', text: item.a, styles: { fontSize: '16px', color: c.textSecondary || '#666', marginTop: '12px', lineHeight: '1.6' } },
        ],
      })),
    ],
  };
}

function buildNewsletter(intent, style) {
  const c = style.colors || {};
  return {
    type: 'container', tag: 'section', name: 'newsletter', styles: { padding: '60px 20px', background: c.primary || '#000', textAlign: 'center' },
    children: [
      { type: 'text', tag: 'h2', text: '订阅我们的动态', styles: { fontSize: '28px', fontWeight: '700', color: '#FFF', marginBottom: '12px' } },
      { type: 'text', tag: 'p', text: '获取最新产品更新和行业资讯', styles: { fontSize: '16px', color: 'rgba(255,255,255,0.7)', marginBottom: '24px' } },
      { type: 'container', tag: 'div', name: 'newsletter-form', styles: { display: 'flex', justifyContent: 'center', gap: '12px', maxWidth: '480px', margin: '0 auto' },
        children: [
          { type: 'button', tag: 'input', text: 'your@email.com', styles: { flex: '1', padding: '14px 20px', border: 'none', borderRadius: style.layout?.borderRadius || '8px', fontSize: '16px' } },
          { type: 'button', tag: 'button', text: '订阅', styles: { padding: '14px 32px', background: c.accent || '#0066CC', color: '#FFF', border: 'none', borderRadius: style.layout?.borderRadius || '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer' } },
        ],
      },
    ],
  };
}

function buildCta(intent, style) {
  const c = style.colors || {};
  return {
    type: 'container', tag: 'section', name: 'cta', styles: { padding: '80px 20px', textAlign: 'center', background: c.surface || '#F5F5F5' },
    children: [
      { type: 'text', tag: 'h2', text: '准备好开始了吗？', styles: { fontSize: '36px', fontWeight: '700', marginBottom: '16px', color: c.text || '#1A1A1A' } },
      { type: 'text', tag: 'p', text: '立即注册，体验全部功能', styles: { fontSize: '18px', color: c.textSecondary || '#666', marginBottom: '32px' } },
      { type: 'button', tag: 'button', text: '免费试用', styles: { padding: '16px 48px', background: c.primary || '#000', color: '#FFF', border: 'none', borderRadius: style.layout?.borderRadius || '8px', fontSize: '18px', fontWeight: '600', cursor: 'pointer' } },
    ],
  };
}

function buildBanner(intent, style) {
  const c = style.colors || {};
  return {
    type: 'container', tag: 'section', name: 'banner', styles: { padding: '40px 20px', background: c.accent || '#0066CC', textAlign: 'center' },
    children: [
      { type: 'text', tag: 'p', text: '🎉 限时优惠：所有套餐 8 折，立即抢购！', styles: { fontSize: '18px', fontWeight: '600', color: '#FFF' } },
    ],
  };
}

function buildTimeline(intent, style) {
  const c = style.colors || {};
  const events = [
    { year: '2024', title: '项目启动', desc: '完成核心团队组建' },
    { year: '2025', title: '产品发布', desc: '正式上线 1.0 版本' },
    { year: '2026', title: '规模扩展', desc: '用户突破 100 万' },
  ];
  return {
    type: 'container', tag: 'section', name: 'timeline', styles: { padding: '80px 20px', maxWidth: '800px', margin: '0 auto' },
    children: [
      { type: 'text', tag: 'h2', text: '发展历程', styles: { fontSize: '32px', fontWeight: '700', textAlign: 'center', marginBottom: '48px', color: c.text || '#1A1A1A' } },
      ...events.map(e => ({
        type: 'container', tag: 'div', name: 'timeline-item', styles: { display: 'flex', gap: '24px', marginBottom: '32px', alignItems: 'flex-start' },
        children: [
          { type: 'text', tag: 'span', text: e.year, styles: { fontSize: '14px', fontWeight: '700', color: c.primary || '#000', minWidth: '60px', paddingTop: '2px' } },
          { type: 'container', tag: 'div', name: 'timeline-content', styles: { flex: '1' },
            children: [
              { type: 'text', tag: 'h3', text: e.title, styles: { fontSize: '18px', fontWeight: '600', marginBottom: '4px', color: c.text || '#1A1A1A' } },
              { type: 'text', tag: 'p', text: e.desc, styles: { fontSize: '14px', color: c.textSecondary || '#888' } },
            ],
          },
        ],
      })),
    ],
  };
}

function buildFromPrompt(prompt, options = {}) {
  const intent = parseIntent(prompt);
  const style = resolveStyle(options.style);
  const tree = buildTree(intent, style);
  return { tree, intent, style };
}

module.exports = { parseIntent, resolveStyle, buildTree, buildFromPrompt, buildFeatureNode };
