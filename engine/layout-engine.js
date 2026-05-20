/**
 * DesignSeed Layout Engine v0.5
 * 
 * 15 layout patterns, auto-selected by content semantics and card features
 */

const DEFAULT_PATTERNS = {
  autoGrid: {
    rules: [
      { items: 1, layout: 'single-full' },
      { items: 2, layout: 'two-equal' },
      { items: 3, layout: 'three-equal' },
      { items: 4, layout: 'four-equal' },
      { items: 5, layout: 'bento' },
      { items: 6, layout: 'mosaic' },
    ],
    default: 'three-equal',
  },
};

function css(obj) {
  var parts = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] !== undefined && obj[key] !== null) {
      parts.push(key + ':' + obj[key]);
    }
  }
  return parts.join(';');
}

function hasFeature(cards) {
  return cards.some(c => c.feature === true);
}

function hasImages(cards) {
  return cards.some(c => c.image || c.img);
}

function hasSteps(cards) {
  return cards.some(c => {
    const t = (c.title || '').toLowerCase();
    return /step|步骤|流程|phase|阶段/.test(t);
  });
}

function hasComparison(cards) {
  return cards.some(c => {
    const t = (c.title || '').toLowerCase();
    return /vs|对比|比较|compare|versus/.test(t);
  });
}

function hasPricing(cards) {
  return cards.some(c => {
    const body = (c.body || '').toLowerCase();
    return /¥|￥|$|价格|定价|price|\/月|\/年/.test(body);
  });
}

function hasTimeline(cards) {
  return cards.some(c => {
    const t = (c.title || '');
    return /\d{4}[-/年]|第[一二三四五六七八九十]|Q[1-4]/.test(t);
  });
}

function selectLayout(cards) {
  const count = cards.length;
  if (hasSteps(cards) && count >= 3 && count <= 6) return 'steps';
  if (hasPricing(cards) && count >= 3 && count <= 4) return 'pricing';
  if (hasComparison(cards) && count === 2) return 'comparison';
  if (hasTimeline(cards) && count >= 3 && count <= 6) return 'timeline';
  if (hasFeature(cards) && count >= 3) return 'feature-plus-grid';
  if (hasImages(cards) && count >= 3 && count <= 5) return 'magazine';
  if (hasImages(cards) && count === 2) return 'zigzag';
  if (count === 1) return 'single-full';
  if (count === 2) return 'two-equal';
  if (count === 3) return 'three-equal';
  if (count === 4) return 'four-equal';
  if (count === 5) return 'bento';
  if (count >= 6) return 'mosaic';
  return DEFAULT_PATTERNS.autoGrid.default;
}

function groupIntoRows(sections) {
  const rows = [];
  let cardBuffer = [];
  
  function flushCards() {
    if (cardBuffer.length === 0) return;
    const layout = selectLayout(cardBuffer);
    if (layout === 'single-full') {
      rows.push({ pattern: 'single-full', items: cardBuffer });
    } else if (layout === 'zigzag') {
      rows.push({ pattern: 'zigzag', items: cardBuffer });
    } else if (layout === 'timeline') {
      rows.push({ pattern: 'timeline', items: cardBuffer });
    } else if (layout === 'steps') {
      rows.push({ pattern: 'steps', items: cardBuffer });
    } else if (layout === 'testimonial') {
      rows.push({ pattern: 'testimonial', items: cardBuffer });
    } else if (layout === 'pricing') {
      rows.push({ pattern: 'pricing', items: cardBuffer });
    } else if (layout === 'comparison') {
      rows.push({ pattern: 'comparison', items: cardBuffer });
    } else if (layout === 'magazine') {
      rows.push({ pattern: 'magazine', items: cardBuffer });
    } else {
      rows.push({ pattern: 'grid', layout: layout, items: cardBuffer });
    }
    cardBuffer = [];
  }
  
  for (const sec of sections) {
    switch (sec.type) {
      case 'header':
      case 'hero':
      case 'nav':
        flushCards();
        rows.push({ pattern: 'single-full', items: [sec] });
        break;
      case 'card':
        cardBuffer.push(sec);
        break;
      case 'stats':
        flushCards();
        rows.push({ pattern: 'stats-row', items: [sec] });
        break;
      case 'grid':
        flushCards();
        rows.push({ pattern: 'grid-section', items: [sec] });
        break;
      case 'footer':
        flushCards();
        rows.push({ pattern: 'single-full', items: [sec] });
        break;
      case 'button':
        if (rows.length > 0) {
          rows[rows.length - 1].items.push(sec);
        } else {
          rows.push({ pattern: 'single-full', items: [sec] });
        }
        break;
      default:
        cardBuffer.push(sec);
        break;
    }
  }
  flushCards();
  return rows;
}

function renderFeaturePlusGrid(items, gap, renderComponent) {
  if (items.length === 0) return '';
  const first = items[0];
  const rest = items.slice(1);
  const firstHtml = renderComponent(first, { span2: true });
  let restHtml = '';
  if (rest.length > 0) {
    const restCols = rest.length >= 2 ? 'repeat(2,1fr)' : '1fr';
    const restGrid = css({ 'display': 'grid', 'grid-template-columns': restCols, 'gap': gap });
    const restInner = rest.map(item => renderComponent(item)).join('\n');
    restHtml = '<div style="' + restGrid + '">' + restInner + '</div>';
  }
  const outerStyle = css({ 'display': 'grid', 'grid-template-columns': '1fr', 'gap': gap, 'margin-bottom': gap });
  return '<div style="' + outerStyle + '">' + firstHtml + restHtml + '</div>';
}

function renderZigzag(items, gap, renderComponent) {
  return items.map((item, i) => {
    const isLeft = i % 2 === 0;
    const itemStyle = css({
      'display': 'flex', 'flex-direction': isLeft ? 'row' : 'row-reverse',
      'align-items': 'center', 'gap': gap, 'margin-bottom': gap,
    });
    return '<div style="' + itemStyle + '">' + renderComponent(item) + '</div>';
  }).join('\n');
}

function renderMagazine(items, gap, renderComponent) {
  if (items.length === 0) return '';
  const first = items[0];
  const rest = items.slice(1);
  const firstHtml = renderComponent(first, { span2: true });
  let restHtml = '';
  if (rest.length > 0) {
    const restStyle = css({ 'display': 'flex', 'flex-direction': 'column', 'gap': gap, 'flex': '1' });
    const restInner = rest.map(item => renderComponent(item)).join('\n');
    restHtml = '<div style="' + restStyle + '">' + restInner + '</div>';
  }
  const outerStyle = css({ 'display': 'flex', 'gap': gap, 'margin-bottom': gap });
  return '<div style="' + outerStyle + '">' + firstHtml + restHtml + '</div>';
}

function renderTimeline(items, gap, renderComponent) {
  const containerStyle = css({ 'position': 'relative', 'padding-left': '32px', 'margin-bottom': gap });
  const lineStyle = css({
    'position': 'absolute', 'left': '11px', 'top': '0', 'bottom': '0',
    'width': '2px', 'background': 'linear-gradient(180deg, var(--primary, #3B82F6) 0%, var(--secondary, #06B6D4) 100%)', 'opacity': '0.3',
  });
  const itemsHtml = items.map((item, i) => {
    const dotStyle = css({
      'position': 'absolute', 'left': '-25px', 'top': '24px',
      'width': '12px', 'height': '12px', 'border-radius': '50%',
      'background': 'var(--primary, #3B82F6)', 'border': '3px solid var(--background, #0B1120)', 'z-index': '1',
    });
    const itemStyle = css({ 'position': 'relative', 'margin-bottom': gap });
    return '<div style="' + itemStyle + '"><div style="' + dotStyle + '"></div>' + renderComponent(item) + '</div>';
  }).join('\n');
  return '<div style="' + containerStyle + '"><div style="' + lineStyle + '"></div>' + itemsHtml + '</div>';
}

function renderSteps(items, gap, renderComponent) {
  const count = items.length;
  const stepsStyle = css({ 'display': 'flex', 'justify-content': 'center', 'gap': '8px', 'margin-bottom': gap });
  const stepDots = items.map((item, i) => {
    const numStyle = css({
      'width': '32px', 'height': '32px', 'border-radius': '50%',
      'background': 'linear-gradient(135deg, var(--primary, #3B82F6), var(--secondary, #06B6D4))',
      'color': '#ffffff', 'display': 'flex', 'align-items': 'center', 'justify-content': 'center',
      'font-weight': '700', 'font-size': '14px',
    });
    const labelStyle = css({ 'font-size': '13px', 'color': 'var(--textSecondary, #94A3B8)', 'max-width': '80px', 'text-align': 'center' });
    let connector = '';
    if (i < count - 1) {
      connector = '<div style="width:40px;height:2px;background:var(--border,#1E293B);margin:0 4px"></div>';
    }
    return '<div style="display:flex;align-items:center;gap:8px">' +
      '<div style="' + numStyle + '">' + (i + 1) + '</div>' +
      '<div style="' + labelStyle + '">' + (item.title || '') + '</div>' +
      '</div>' + connector;
  }).join('');
  const gridCols = 'repeat(' + Math.min(count, 4) + ',1fr)';
  const gridStyle = css({ 'display': 'grid', 'grid-template-columns': gridCols, 'gap': gap, 'margin-bottom': gap });
  const itemsHtml = items.map(item => renderComponent(item)).join('\n');
  return '<div><div style="' + stepsStyle + '">' + stepDots + '</div><div style="' + gridStyle + '">' + itemsHtml + '</div></div>';
}

function renderPricing(items, gap, renderComponent) {
  const count = items.length;
  if (count === 3) {
    const outerStyle = css({ 'display': 'grid', 'grid-template-columns': '1fr 1.2fr 1fr', 'gap': gap, 'align-items': 'start', 'margin-bottom': gap });
    const itemsHtml = items.map((item, i) => renderComponent(item, i === 1 ? { featured: true } : {})).join('\n');
    return '<div style="' + outerStyle + '">' + itemsHtml + '</div>';
  }
  if (count === 2) {
    const outerStyle = css({ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': gap, 'align-items': 'start', 'margin-bottom': gap });
    const itemsHtml = items.map(item => renderComponent(item)).join('\n');
    return '<div style="' + outerStyle + '">' + itemsHtml + '</div>';
  }
  const cols = 'repeat(' + Math.min(count, 4) + ',1fr)';
  return renderGrid(items, cols, gap, renderComponent);
}

function renderComparison(items, gap, renderComponent) {
  if (items.length < 2) return renderGrid(items, '1fr', gap, renderComponent);
  const vsStyle = css({ 'display': 'flex', 'align-items': 'center', 'gap': gap, 'margin-bottom': gap });
  const vsBadgeStyle = css({
    'width': '48px', 'height': '48px', 'border-radius': '50%',
    'background': 'linear-gradient(135deg, var(--primary, #3B82F6), var(--secondary, #06B6D4))',
    'color': '#ffffff', 'display': 'flex', 'align-items': 'center', 'justify-content': 'center',
    'font-weight': '800', 'font-size': '14px', 'flex-shrink': '0', 'z-index': '1',
  });
  return '<div style="' + vsStyle + '">' +
    '<div style="flex:1">' + renderComponent(items[0]) + '</div>' +
    '<div style="' + vsBadgeStyle + '">VS</div>' +
    '<div style="flex:1">' + renderComponent(items[1]) + '</div>' +
    '</div>';
}

function renderTestimonial(items, gap, renderComponent) {
  return items.map(item => {
    const wrapperStyle = css({ 'text-align': 'center', 'padding': '40px 24px', 'position': 'relative', 'margin-bottom': gap });
    const quoteStyle = css({ 'font-size': '64px', 'line-height': '1', 'opacity': '0.15', 'margin-bottom': '-20px' });
    const bodyStyle = css({ 'font-size': '20px', 'line-height': '1.8', 'font-style': 'italic', 'max-width': '600px', 'margin': '0 auto 16px' });
    const authorStyle = css({ 'font-size': '14px', 'opacity': '0.6' });
    return '<div style="' + wrapperStyle + '">' +
      '<div style="' + quoteStyle + '">&ldquo;</div>' +
      '<div style="' + bodyStyle + '">' + (item.body || '') + '</div>' +
      '<div style="' + authorStyle + '">— ' + (item.title || '匿名') + '</div>' +
      '</div>';
  }).join('\n');
}

function renderBento(items, gap, renderComponent) {
  const count = items.length;
  if (count === 5) {
    const row1Style = css({ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': gap, 'margin-bottom': gap });
    const row2Style = css({ 'display': 'grid', 'grid-template-columns': 'repeat(3,1fr)', 'gap': gap, 'margin-bottom': gap });
    const row1 = items.slice(0, 2).map(item => renderComponent(item, { span2: true })).join('\n');
    const row2 = items.slice(2, 5).map(item => renderComponent(item)).join('\n');
    return '<div><div style="' + row1Style + '">' + row1 + '</div><div style="' + row2Style + '">' + row2 + '</div></div>';
  }
  const cols = count <= 3 ? 'repeat(' + count + ',1fr)' : 'repeat(2,1fr)';
  return renderGrid(items, cols, gap, renderComponent);
}

function renderMosaic(items, gap, renderComponent) {
  const count = items.length;
  if (count >= 6) {
    const row1Style = css({ 'display': 'grid', 'grid-template-columns': '2fr 1fr 1fr', 'gap': gap, 'margin-bottom': gap });
    const row2Style = css({ 'display': 'grid', 'grid-template-columns': 'repeat(3,1fr)', 'gap': gap, 'margin-bottom': gap });
    const row3Style = css({ 'display': 'grid', 'grid-template-columns': '1fr 1fr', 'gap': gap, 'margin-bottom': gap });
    const row1 = items.slice(0, 3).map((item, i) => renderComponent(item, i === 0 ? { span2: true } : {})).join('\n');
    const row2 = items.slice(3, 6).map(item => renderComponent(item)).join('\n');
    const row3Items = items.slice(6, 8);
    let html = '<div><div style="' + row1Style + '">' + row1 + '</div><div style="' + row2Style + '">' + row2 + '</div>';
    if (row3Items.length > 0) {
      html += '<div style="' + row3Style + '">' + row3Items.map(item => renderComponent(item)).join('\n') + '</div>';
    }
    html += '</div>';
    return html;
  }
  if (count === 5) return renderBento(items, gap, renderComponent);
  const cols = count <= 3 ? 'repeat(' + count + ',1fr)' : 'repeat(2,1fr)';
  return renderGrid(items, cols, gap, renderComponent);
}

function renderGridLayout(layout, items, gap, renderComponent) {
  switch (layout) {
    case 'two-equal': return renderGrid(items, '1fr 1fr', gap, renderComponent);
    case 'three-equal': return renderGrid(items, 'repeat(3,1fr)', gap, renderComponent);
    case 'four-equal': return renderGrid(items, 'repeat(4,1fr)', gap, renderComponent);
    case 'feature-plus-grid': return renderFeaturePlusGrid(items, gap, renderComponent);
    case 'bento': return renderBento(items, gap, renderComponent);
    case 'mosaic': return renderMosaic(items, gap, renderComponent);
    default: return renderGrid(items, 'repeat(3,1fr)', gap, renderComponent);
  }
}

function renderGrid(items, columns, gap, renderComponent) {
  const gridStyle = css({ 'display': 'grid', 'grid-template-columns': columns, 'gap': gap, 'margin-bottom': gap });
  const inner = items.map(item => renderComponent(item)).join('\n');
  return '<div style="' + gridStyle + '">' + inner + '</div>';
}

function renderRow(row, style, renderComponent) {
  const l = style.layout || {};
  const gap = (l.cardGap || 20) + 'px';
  if (row.pattern === 'single-full') return row.items.map(item => renderComponent(item)).join('\n');
  if (row.pattern === 'stats-row') return row.items.map(item => renderComponent(item)).join('\n');
  if (row.pattern === 'grid-section') return row.items.map(item => renderComponent(item)).join('\n');
  if (row.pattern === 'zigzag') return renderZigzag(row.items, gap, renderComponent);
  if (row.pattern === 'timeline') return renderTimeline(row.items, gap, renderComponent);
  if (row.pattern === 'steps') return renderSteps(row.items, gap, renderComponent);
  if (row.pattern === 'testimonial') return renderTestimonial(row.items, gap, renderComponent);
  if (row.pattern === 'pricing') return renderPricing(row.items, gap, renderComponent);
  if (row.pattern === 'comparison') return renderComparison(row.items, gap, renderComponent);
  if (row.pattern === 'magazine') return renderMagazine(row.items, gap, renderComponent);
  if (row.pattern === 'grid') return renderGridLayout(row.layout, row.items, gap, renderComponent);
  return row.items.map(item => renderComponent(item)).join('\n');
}

function arrange(sections, style, renderComponent) {
  if (!sections || sections.length === 0) return '';
  const rows = groupIntoRows(sections);
  return rows.map(row => renderRow(row, style, renderComponent)).join('\n');
}

module.exports = { arrange, groupIntoRows, selectLayout, renderFeaturePlusGrid, renderZigzag, renderTimeline, renderSteps, renderPricing, renderComparison, renderMagazine, renderBento, renderMosaic };
