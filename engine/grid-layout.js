/**
 * DesignSeed - Grid Layout Engine
 * 网格区域布局引擎：6 种策略 + 策略映射 + 主渲染函数
 */

// ─── 6 种布局策略 ───────────────────────────────────────────────

/**
 * 1. guochao_focus - 国潮：竖排标题(左侧) + 大色块(中央) + 留白(右侧) + 底部文字
 *    Grid: 6 rows × 6 cols
 */
function guochao_focus(content) {
  const cells = [];
  cells.push({
    type: 'text',
    gridArea: '1/1/5/2',
    style: { writingMode: 'vertical-rl', fontSize: '2.4rem', fontWeight: '900', letterSpacing: '0.3em', lineHeight: '1.8', textAlign: 'center', justifySelf: 'center', alignSelf: 'center' },
    content: content.title || '',
  });
  cells.push({
    type: 'block',
    gridArea: '1/2/5/6',
    style: { borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' },
    content: content.body || '',
  });
  cells.push({ type: 'blank', gridArea: '1/6/5/7', style: {}, content: '' });
  cells.push({
    type: 'text',
    gridArea: '5/1/6/5',
    style: { fontSize: '0.85rem', letterSpacing: '0.15em', textAlign: 'left', alignSelf: 'end', paddingBottom: '8px' },
    content: content.subtitle || '',
  });
  if (content.tags && content.tags.length) {
    cells.push({
      type: 'text',
      gridArea: '5/5/6/7',
      style: { fontSize: '0.7rem', textAlign: 'right', alignSelf: 'end', paddingBottom: '8px', letterSpacing: '0.1em' },
      content: content.tags.join('  \u00b7  '),
    });
  }
  if (content.cards && content.cards.length) {
    cells.push({
      type: 'text',
      gridArea: '6/1/7/7',
      style: { fontSize: '0.75rem', lineHeight: '1.6', textAlign: 'left', borderTop: '1px solid var(--border)', paddingTop: '12px' },
      content: content.cards.map((c) => c.title || c).join('  |  '),
    });
  }
  return cells;
}

/**
 * 2. cyberpunk_grid - 赛博朋克：全宽渐变标题 + 三列卡片 + 全宽底部文字
 *    Grid: 5 rows × 6 cols
 */
function cyberpunk_grid(content) {
  const cells = [];
  cells.push({
    type: 'gradient',
    gridArea: '1/1/2/7',
    style: { fontSize: '2rem', fontWeight: '900', letterSpacing: '0.2em', textAlign: 'center', padding: '24px 16px', textTransform: 'uppercase' },
    content: content.title || '',
  });
  const cards = content.cards || [];
  const colWidth = 2;
  for (let i = 0; i < Math.min(cards.length, 3); i++) {
    const colStart = 1 + i * colWidth;
    const colEnd = colStart + colWidth;
    cells.push({
      type: 'block',
      gridArea: '2/' + colStart + '/4/' + colEnd,
      style: { borderRadius: '2px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid var(--border)' },
      content: cards[i].title || cards[i],
    });
  }
  for (let i = cards.length; i < 3; i++) {
    const colStart = 1 + i * colWidth;
    const colEnd = colStart + colWidth;
    cells.push({ type: 'blank', gridArea: '2/' + colStart + '/4/' + colEnd, style: {}, content: '' });
  }
  cells.push({
    type: 'text',
    gridArea: '4/1/5/7',
    style: { fontSize: '0.85rem', letterSpacing: '0.15em', textAlign: 'center', padding: '12px 0' },
    content: content.subtitle || '',
  });
  cells.push({
    type: 'text',
    gridArea: '5/1/6/7',
    style: { fontSize: '0.8rem', lineHeight: '1.8', textAlign: 'center', padding: '8px 24px 16px' },
    content: content.body || '',
  });
  return cells;
}

/**
 * 3. morandi_asymmetric - 莫兰迪：左上小标题 + 右上留白 + 左中大标题 + 左下正文 + 右下圆形色块
 *    Grid: 5 rows × 6 cols
 */
function morandi_asymmetric(content) {
  const cells = [];
  cells.push({
    type: 'text',
    gridArea: '1/1/2/4',
    style: { fontSize: '0.8rem', letterSpacing: '0.2em', textAlign: 'left', alignSelf: 'start', paddingTop: '8px' },
    content: content.subtitle || '',
  });
  cells.push({ type: 'blank', gridArea: '1/4/2/7', style: {}, content: '' });
  cells.push({
    type: 'text',
    gridArea: '2/1/4/5',
    style: { fontSize: '2.2rem', fontWeight: '700', lineHeight: '1.4', textAlign: 'left', alignSelf: 'center' },
    content: content.title || '',
  });
  cells.push({ type: 'blank', gridArea: '2/5/4/7', style: {}, content: '' });
  cells.push({
    type: 'text',
    gridArea: '4/1/6/5',
    style: { fontSize: '0.85rem', lineHeight: '1.9', textAlign: 'left', alignSelf: 'start' },
    content: content.body || '',
  });
  cells.push({
    type: 'block',
    gridArea: '4/5/6/7',
    style: { borderRadius: '50%', aspectRatio: '1', alignSelf: 'center', justifySelf: 'center', width: '90%' },
    content: '',
  });
  return cells;
}

/**
 * 4. xiaohongshu_centered - 小红书：居中标签行 + 居中大标题 + 居中副标题 + 两列圆角卡片
 *    Grid: 5 rows × 6 cols
 */
function xiaohongshu_centered(content) {
  const cells = [];
  if (content.tags && content.tags.length) {
    cells.push({
      type: 'text',
      gridArea: '1/1/2/7',
      style: { fontSize: '0.7rem', letterSpacing: '0.15em', textAlign: 'center', paddingTop: '16px' },
      content: content.tags.join('   '),
    });
  }
  cells.push({
    type: 'text',
    gridArea: '2/1/3/7',
    style: { fontSize: '2rem', fontWeight: '800', textAlign: 'center', padding: '12px 24px', lineHeight: '1.4' },
    content: content.title || '',
  });
  cells.push({
    type: 'text',
    gridArea: '3/1/4/7',
    style: { fontSize: '0.85rem', textAlign: 'center', paddingBottom: '16px', letterSpacing: '0.05em' },
    content: content.subtitle || '',
  });
  const cards = content.cards || [];
  cells.push({
    type: 'block',
    gridArea: '4/1/6/4',
    style: { borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    content: cards[0] ? (cards[0].title || cards[0]) : '',
  });
  cells.push({
    type: 'block',
    gridArea: '4/4/6/7',
    style: { borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    content: cards[1] ? (cards[1].title || cards[1]) : '',
  });
  return cells;
}

/**
 * 5. wechat_biz - 公众号商务：全宽渐变标题 + 全宽副标题 + 三列文字 + 全宽引用
 *    Grid: 5 rows × 6 cols
 */
function wechat_biz(content) {
  const cells = [];
  cells.push({
    type: 'gradient',
    gridArea: '1/1/2/7',
    style: { fontSize: '1.8rem', fontWeight: '700', textAlign: 'center', padding: '28px 24px', letterSpacing: '0.1em' },
    content: content.title || '',
  });
  cells.push({
    type: 'text',
    gridArea: '2/1/3/7',
    style: { fontSize: '0.85rem', textAlign: 'center', padding: '12px 32px', letterSpacing: '0.08em' },
    content: content.subtitle || '',
  });
  const bodyText = content.body || '';
  const parts = bodyText ? bodyText.match(/.{1,60}/g) || [bodyText] : ['', '', ''];
  for (let i = 0; i < 3; i++) {
    const colStart = 1 + i * 2;
    const colEnd = colStart + 2;
    cells.push({
      type: 'text',
      gridArea: '3/' + colStart + '/4/' + colEnd,
      style: { fontSize: '0.78rem', lineHeight: '1.8', textAlign: 'justify', padding: '8px 12px' },
      content: parts[i] || '',
    });
  }
  if (content.cards && content.cards.length) {
    cells.push({
      type: 'quote',
      gridArea: '4/1/6/7',
      style: { fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center', padding: '20px 40px', lineHeight: '1.7', borderLeft: '3px solid var(--accent)', marginLeft: '40px', marginRight: '40px' },
      content: content.cards[0].title || content.cards[0],
    });
  }
  return cells;
}

/**
 * 6. minimal_center - 极简白：大留白 + 居中超细标题 + 细分割线 + 居中正文
 *    Grid: 5 rows × 6 cols
 */
function minimal_center(content) {
  const cells = [];
  cells.push({ type: 'blank', gridArea: '1/1/2/7', style: { height: '60px' }, content: '' });
  cells.push({
    type: 'text',
    gridArea: '2/2/3/6',
    style: { fontSize: '1.6rem', fontWeight: '200', textAlign: 'center', letterSpacing: '0.25em', lineHeight: '1.6' },
    content: content.title || '',
  });
  cells.push({
    type: 'divider',
    gridArea: '3/3/4/5',
    style: { height: '1px', width: '60px', margin: '0 auto', alignSelf: 'center' },
    content: '',
  });
  cells.push({
    type: 'text',
    gridArea: '4/2/5/6',
    style: { fontSize: '0.8rem', textAlign: 'center', letterSpacing: '0.1em', paddingTop: '8px' },
    content: content.subtitle || '',
  });
  cells.push({
    type: 'text',
    gridArea: '5/2/6/6',
    style: { fontSize: '0.85rem', lineHeight: '2', textAlign: 'center', paddingTop: '24px', maxWidth: '480px', justifySelf: 'center' },
    content: content.body || '',
  });
  return cells;
}

// ─── 策略映射 ───────────────────────────────────────────────────

const STRATEGIES = {
  guochao_focus,
  cyberpunk_grid,
  morandi_asymmetric,
  xiaohongshu_centered,
  wechat_biz,
  minimal_center,
};

const PACK_STRATEGY_MAP = {
  guochao: 'guochao_focus',
  cyberpunk: 'cyberpunk_grid',
  morandi: 'morandi_asymmetric',
  'xiaohongshu-cute': 'xiaohongshu_centered',
  'wechat-biz': 'wechat_biz',
  'minimal-white': 'minimal_center',
};

/**
 * 根据素材包 ID 返回对应的布局策略名
 * @param {string} packId
 * @returns {string}
 */
function getStrategyForPack(packId) {
  return PACK_STRATEGY_MAP[packId] || 'minimal_center';
}

// ─── Grid 工具函数 ──────────────────────────────────────────────

function computeGridDimensions(cells) {
  let maxRow = 1;
  let maxCol = 1;
  for (const cell of cells) {
    const parts = cell.gridArea.split('/').map(Number);
    if (parts[2] > maxRow) maxRow = parts[2];
    if (parts[3] > maxCol) maxCol = parts[3];
  }
  return { rows: maxRow - 1, cols: maxCol - 1 };
}

function cellsToGridTemplate(cells) {
  const { rows, cols } = computeGridDimensions(cells);
  const grid = Array.from({ length: rows }, () => Array(cols).fill('.'));
  for (const cell of cells) {
    const [r1, c1, r2, c2] = cell.gridArea.split('/').map(Number);
    const areaName = 'area_' + cell.type + '_' + r1 + '_' + c1;
    for (let r = r1; r < r2; r++) {
      for (let c = c1; c < c2; c++) {
        grid[r - 1][c - 1] = areaName;
      }
    }
  }
  return {
    templateAreas: grid.map((row) => '"' + row.join(' ') + '"').join('\n    '),
    dimensions: { rows, cols },
  };
}

// ─── HTML 渲染 ──────────────────────────────────────────────────

function renderCell(cell, palette) {
  const parts = cell.gridArea.split('/').map(Number);
  const areaName = 'area_' + cell.type + '_' + parts[0] + '_' + parts[1];
  const styles = ['grid-area: ' + areaName];
  switch (cell.type) {
    case 'block':
      styles.push('background: ' + palette.accent);
      styles.push('color: ' + palette.textOnBg);
      break;
    case 'gradient':
      styles.push('background: ' + (palette.gradients && palette.gradients.accent || 'linear-gradient(135deg, ' + palette.accent + ', ' + palette.primary + ')'));
      styles.push('color: ' + palette.textOnBg);
      break;
    case 'quote':
      styles.push('color: ' + palette.textSecondary);
      styles.push('border-color: ' + palette.accent);
      break;
    case 'divider':
      styles.push('background: ' + palette.border);
      break;
    case 'text':
      styles.push('color: ' + palette.text);
      break;
    case 'blank':
    default:
      break;
  }
  if (cell.style) {
    for (const [key, value] of Object.entries(cell.style)) {
      const cssProp = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      styles.push(cssProp + ': ' + value);
    }
  }
  const styleStr = styles.join('; ');
  const escapedContent = cell.content || '';
  return '  <div class="cell cell-' + cell.type + '" style="' + styleStr + '">' + escapedContent + '</div>';
}

// ─── 主渲染函数 ─────────────────────────────────────────────────

const DEFAULT_PALETTE = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  primary: '#1A1A2E',
  secondary: '#16213E',
  accent: '#E94560',
  border: '#E0E0E0',
  text: '#1A1A2E',
  textSecondary: '#666666',
  textOnBg: '#FFFFFF',
  gradients: { accent: 'linear-gradient(135deg, #E94560, #0F3460)' },
};

/**
 * 主渲染函数：根据策略名、内容、配色方案生成完整 HTML 页面
 * @param {string} strategyName
 * @param {object} content - { title, subtitle, body, cards, tags }
 * @param {object} palette
 * @param {object} options - { width, height, title }
 * @returns {string}
 */
function renderGridPage(strategyName, content, palette, options) {
  options = options || {};
  const strategyFn = STRATEGIES[strategyName];
  if (!strategyFn) {
    throw new Error('Unknown strategy: "' + strategyName + '". Available: ' + Object.keys(STRATEGIES).join(', '));
  }
  const pal = Object.assign({}, DEFAULT_PALETTE, palette);
  if (palette && palette.gradients) {
    pal.gradients = Object.assign({}, DEFAULT_PALETTE.gradients, palette.gradients);
  }
  const cells = strategyFn(content);
  const result = cellsToGridTemplate(cells);
  const templateAreas = result.templateAreas;
  const dimensions = result.dimensions;
  const pageWidth = options.width || '1080px';
  const pageHeight = options.height || '1440px';
  const pageTitle = options.title || content.title || 'DesignSeed';
  const cellHtml = cells.map((cell) => renderCell(cell, pal)).join('\n');

  return '<!DOCTYPE html>\n' +
    '<html lang="zh-CN">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <title>' + pageTitle + '</title>\n' +
    '  <link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
    '  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100;200;300;400;500;700;900&family=Noto+Serif+SC:wght@200;300;400;600;700;900&display=swap" rel="stylesheet">\n' +
    '  <style>\n' +
    '    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }\n' +
    '    body {\n' +
    '      display: flex; justify-content: center; align-items: center;\n' +
    '      min-height: 100vh; background: #F0F0F0;\n' +
    '      font-family: \'Noto Sans SC\', \'PingFang SC\', \'Microsoft YaHei\', sans-serif;\n' +
    '    }\n' +
    '    .page {\n' +
    '      width: ' + pageWidth + '; min-height: ' + pageHeight + '; height: auto; background: ' + pal.background + ';\n' +
    '      display: grid;\n' +
    '      grid-template-columns: repeat(' + dimensions.cols + ', 1fr);\n' +
    '      grid-template-rows: repeat(' + dimensions.rows + ', 1fr);\n' +
    '      grid-template-areas:\n' +
    '    ' + templateAreas + ';\n' +
    '      overflow: hidden; position: relative;\n' +
    '    }\n' +
    '    .cell { display: flex; align-items: center; justify-content: center; overflow: hidden; word-break: break-word; }\n' +
    '    .cell-text { font-family: \'Noto Sans SC\', sans-serif; }\n' +
    '    .cell-block { font-family: \'Noto Sans SC\', sans-serif; }\n' +
    '    .cell-gradient { font-family: \'Noto Serif SC\', serif; }\n' +
    '    .cell-quote { font-family: \'Noto Serif SC\', serif; border-left-style: solid; }\n' +
    '    .cell-divider { min-height: 1px; }\n' +
    '    .cell-blank { background: transparent; }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body>\n' +
    '  <div class="page">\n' +
    cellHtml + '\n' +
    '  </div>\n' +
    '</body>\n' +
    '</html>';
}

// ─── 导出 ───────────────────────────────────────────────────────

const LAYOUT_STRATEGIES = {
  guochao_focus,
  cyberpunk_grid,
  morandi_asymmetric,
  xiaohongshu_centered,
  wechat_biz,
  minimal_center,
};

module.exports = { LAYOUT_STRATEGIES, getStrategyForPack, renderGridPage };