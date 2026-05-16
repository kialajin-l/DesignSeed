/**
 * DesignSeed — Tree Renderer
 * v0.6.5
 *
 * 将 DesignTree 转为带 data-ds-* 属性的 HTML。
 * 对齐 COVE-CANVAS-PROTOCOL v1.2：
 * - 每个可交互元素带 data-ds-type 和 data-ds-id
 * - HTML 可直接在 iframe 中渲染
 * - 支持全局样式注入
 */

const { findNode } = require('./design-tree');

// ============================================================
// 驼峰 → kebab-case
// ============================================================

function toKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// ============================================================
// DesignNode → HTML 属性字符串
// ============================================================

function stylesToCss(styles) {
  if (!styles || Object.keys(styles).length === 0) return '';
  return Object.entries(styles)
    .map(([k, v]) => `${toKebab(k)}: ${v}`)
    .join('; ');
}

function propsToHtmlAttrs(props) {
  if (!props || Object.keys(props).length === 0) return '';
  return Object.entries(props)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      if (typeof v === 'boolean') return v ? k : '';
      return `${toKebab(k)}="${escapeAttr(String(v))}"`;
    })
    .filter(Boolean)
    .join(' ');
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ============================================================
// 单节点 → HTML（不含子节点递归）
// ============================================================

function detectLayout(node) {
  if (!node.styles) return '';
  const s = node.styles;
  if (s.display === 'grid') {
    const cols = s.gridTemplateColumns || '';
    if (cols.includes('repeat(3')) return 'data-layout="grid-3"';
    if (cols.includes('repeat(4')) return 'data-layout="grid-4"';
    if (node.name && node.name.includes('pricing')) return 'data-layout="pricing-grid"';
    if (node.name && node.name.includes('gallery')) return 'data-layout="gallery-grid"';
  }
  if (s.display === 'flex') {
    if (node.name && node.name.includes('hero')) return 'data-layout="hero-flex"';
    if (node.name && node.name.includes('team')) return 'data-layout="team-flex"';
    if (node.name && node.name.includes('footer')) return 'data-layout="footer-flex"';
    if (node.name && node.name.includes('nav')) return 'data-layout="nav-flex"';
    if (node.name && node.name.includes('stats')) return 'data-layout="stats-flex"';
    if (node.name && node.name.includes('cta')) return 'data-layout="cta-flex"';
    if (s.justifyContent && s.justifyContent.includes('center')) return 'data-layout="flex-center"';
    return 'data-layout="flex-row"';
  }
  return '';
}

function renderNodeOpen(node) {
  const tag = node.tag || 'div';
  const attrs = [];

  // data-ds-* 属性（COVE 画布交互用）
  attrs.push(`data-ds-type="${node.type}"`);
  attrs.push(`data-ds-id="${node.id}"`);
  if (node.semantic) attrs.push(`data-ds-semantic="${node.semantic}"`);

  // CSS 样式
  const cssStr = stylesToCss(node.styles);
  if (cssStr) attrs.push(`style="${cssStr}"`);

  // HTML 属性（src, href, placeholder, alt 等）
  const propStr = propsToHtmlAttrs(node.props);
  if (propStr) attrs.push(propStr);

  // 响应式布局标记
  const layoutMark = detectLayout(node);
  if (layoutMark) attrs.push(layoutMark);

  return `<${tag} ${attrs.join(' ')}>`;
}

function renderNodeClose(node) {
  const tag = node.tag || 'div';
  return `</${tag}>`;
}

// ============================================================
// 递归渲染 DesignNode → HTML
// ============================================================

function renderNode(node) {
  if (!node) return "";
  if (!Array.isArray(node.children)) node.children = [];
  return _renderNode(node);
}

function _renderNode(node) {
  if (!node.visible) return '';

  const tag = node.tag || 'div';

  // 自闭合标签
  if (tag === 'img' || tag === 'br' || tag === 'hr') {
    const attrs = [];
    attrs.push(`data-ds-type="${node.type}"`);
    attrs.push(`data-ds-id="${node.id}"`);
    const cssStr = stylesToCss(node.styles);
    if (cssStr) attrs.push(`style="${cssStr}"`);
    const propStr = propsToHtmlAttrs(node.props);
    if (propStr) attrs.push(propStr);
    return `<${tag} ${attrs.join(' ')} />`;
  }

  // 文本节点
  if (node.type === 'text' && node.text !== undefined) {
    return `${renderNodeOpen(node)}${escapeHtml(node.text)}${renderNodeClose(node)}`;
  }

  // 按钮节点
  if (node.type === 'button' && node.text !== undefined) {
    return `${renderNodeOpen(node)}${escapeHtml(node.text)}${renderNodeClose(node)}`;
  }

  // 容器节点（递归子节点）
  const childrenHtml = node.children
    .map(child => _renderNode(child))
    .filter(Boolean)
    .join('\n');

  return `${renderNodeOpen(node)}\n${childrenHtml}\n${renderNodeClose(node)}`;
}

// ============================================================
// 全局样式 → <style> 标签
// ============================================================

function renderGlobalStyles(globalStyles) {
  if (!globalStyles) return '';

  const lines = [];

  // CSS 变量
  if (globalStyles.variables && Object.keys(globalStyles.variables).length > 0) {
    const vars = Object.entries(globalStyles.variables)
      .map(([k, v]) => `  --${toKebab(k)}: ${v};`)
      .join('\n');
    lines.push(`:root {\n${vars}\n}`);
  }

  // 字体定义
  if (globalStyles.fonts && globalStyles.fonts.length > 0) {
    const fontImports = globalStyles.fonts
      .filter(f => f.url)
      .map(f => `@import url('${f.url}');`)
      .join('\n');
    if (fontImports) lines.push(fontImports);
  }

  // 基础规则
  if (globalStyles.baseRules) {
    for (const [selector, ruleSet] of Object.entries(globalStyles.baseRules)) {
      const rules = Object.entries(ruleSet)
        .map(([k, v]) => `  ${toKebab(k)}: ${v};`)
        .join('\n');
      lines.push(`${selector} {\n${rules}\n}`);
    }
  }

  // 重置样式（始终包含）
  // 响应式基础
  lines.unshift(`
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 16px; }
body { min-height: 100vh; }
`);

  // 响应式媒体查询
  lines.push(`
/* === 响应式断点 === */
@media (max-width: 768px) {
  [data-layout="grid-3"] { grid-template-columns: 1fr !important; }
  [data-layout="grid-4"] { grid-template-columns: repeat(2, 1fr) !important; }
  [data-layout="flex-row"] { flex-direction: column !important; }
  [data-layout="flex-center"] { flex-direction: column !important; }
  [data-layout="hero-flex"] { flex-direction: column !important; text-align: center !important; }
  [data-layout="pricing-grid"] { grid-template-columns: 1fr !important; }
  [data-layout="team-flex"] { flex-wrap: wrap !important; }
  [data-layout="gallery-grid"] { grid-template-columns: repeat(2, 1fr) !important; }
  [data-layout="footer-flex"] { flex-direction: column !important; gap: 16px !important; }
  [data-layout="nav-flex"] { flex-direction: column !important; gap: 8px !important; }
  [data-layout="stats-flex"] { flex-wrap: wrap !important; }
  [data-layout="cta-flex"] { flex-direction: column !important; text-align: center !important; }
}
@media (max-width: 480px) {
  [data-layout="grid-4"] { grid-template-columns: 1fr !important; }
  [data-layout="gallery-grid"] { grid-template-columns: 1fr !important; }
  [data-layout="stats-flex"] { flex-direction: column !important; }
  [data-layout="pricing-grid"] { gap: 16px !important; }
}
`);
  lines.push(`img { max-width: 100%; height: auto; }`);
  lines.push(`a { text-decoration: none; }`);

  return `<style>\n${lines.join('\n\n')}\n</style>`;
}

// ============================================================
// DesignTree → 完整 HTML 页面
// ============================================================

function treeToHtml(tree) {
  if (!tree || !tree.root) throw new Error('Invalid DesignTree: missing root');

  const meta = tree.meta || {};
  const title = escapeHtml(meta.title || 'Untitled');
  const viewport = meta.viewport || 'width=device-width, initial-scale=1.0';

  const globalCss = renderGlobalStyles(tree.globalStyles);
  const bodyHtml = renderNode(tree.root);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="${viewport.includes('width') ? 'viewport' : 'charset'}" content="${viewport}">
  <title>${title}</title>
  ${globalCss}
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

// ============================================================
// DesignTree → 精简 HTML（无全局样式，用于嵌入）
// ============================================================

function treeToFragment(tree) {
  if (!tree || !tree.root) throw new Error('Invalid DesignTree: missing root');
  return renderNode(tree.root);
}

// ============================================================
// 查找节点（代理）
// ============================================================

function getNode(tree, nodeId) {
  return findNode(tree.root, nodeId);
}

module.exports = {
  treeToHtml,
  treeToFragment,
  renderNode,
  renderGlobalStyles,
  getNode,
  stylesToCss,
  escapeHtml,
};
