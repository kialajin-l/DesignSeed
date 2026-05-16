/**
 * DesignSeed — DesignTree 数据结构定义
 * v0.6.1
 *
 * 对齐 COVE-CANVAS-PROTOCOL v1.2
 * DesignTree 是 DesignSeed 与 NightShift Cove 画布之间的核心数据契约。
 */

const crypto = require('crypto');

// ============================================================
// ID 生成
// ============================================================

/**
 * 生成稳定的节点 ID
 * 格式：ds-{type}-{uuid4[:8]}
 * @param {string} nodeType - 节点类型
 * @returns {string} 节点 ID
 */
function generateNodeId(nodeType) {
  const uuid = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
  return `ds-${nodeType}-${uuid}`;
}

// ============================================================
// DesignNode — 设计树节点
// ============================================================

/**
 * @typedef {'page'|'section'|'component'|'text'|'image'|'button'|'container'} DesignNodeType
 *
 * @typedef {Object} DesignNode
 * @property {string} id - 唯一标识符，格式 ds-{type}-{uuid[:8]}
 * @property {DesignNodeType} type - 节点类型
 * @property {string} [tag] - 对应的 HTML 标签名（用于 iframe 渲染）
 * @property {Record<string, string|number>} styles - CSS 样式对象（驼峰命名）
 * @property {Record<string, any>} props - HTML 属性（src, href, placeholder, alt 等）
 * @property {DesignNode[]} children - 子节点数组
 * @property {string} [text] - 文本内容（仅 text 类型节点）
 * @property {boolean} [locked] - 是否锁定不可编辑
 * @property {boolean} [visible] - 是否可见，默认 true
 * @property {string} [name] - 组件显示名称（用于图层面板和选中提示）
 * @property {string} [semantic] - 组件语义标签（hero, pricing-card, footer, nav 等）
 */

/**
 * 创建一个 DesignNode
 */
function createNode(opts) {
  return {
    id: opts.id || generateNodeId(opts.type),
    type: opts.type,
    tag: opts.tag || inferTag(opts.type),
    styles: opts.styles || {},
    props: opts.props || {},
    children: opts.children || [],
    text: opts.text,
    locked: opts.locked ?? false,
    visible: opts.visible ?? true,
    name: opts.name,
    semantic: opts.semantic,
  };
}

function inferTag(type) {
  const tagMap = {
    page: 'div',
    section: 'section',
    component: 'div',
    text: 'p',
    image: 'img',
    button: 'button',
    container: 'div',
  };
  return tagMap[type] || 'div';
}

// ============================================================
// DesignTree — 设计树（单页面）
// ============================================================

/**
 * 创建一个 DesignTree
 */
function createTree(opts = {}) {
  const pageId = opts.pageId || 'home';
  return {
    pageId,
    version: 1,
    root: createNode({
      type: 'page',
      id: `ds-page-${pageId}`,
      name: opts.title || pageId,
      styles: {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      },
    }),
    globalStyles: {
      variables: opts.variables || {},
      fonts: opts.fonts || [],
      baseRules: {},
    },
    meta: {
      title: opts.title || 'Untitled',
      description: opts.description || '',
      viewport: 'width=device-width, initial-scale=1.0',
    },
  };
}

// ============================================================
// DesignProject — 多页面容器
// ============================================================

/**
 * 创建一个 DesignProject
 */
function createProject(opts = {}) {
  return {
    projectId: opts.projectId || `proj-${crypto.randomUUID().replace(/-/g, '').slice(0, 8)}`,
    version: opts.version || '0.1.0',
    pages: opts.pages || [],
    navigation: opts.navigation || { links: [] },
    metadata: opts.metadata || {},
  };
}

// ============================================================
// 辅助函数
// ============================================================

function addChild(tree, parentId, childNode) {
  const parent = findNode(tree.root, parentId);
  if (!parent) return false;
  parent.children.push(childNode);
  tree.version++;
  return true;
}

function findNode(root, nodeId) {
  if (root.id === nodeId) return root;
  for (const child of root.children) {
    const found = findNode(child, nodeId);
    if (found) return found;
  }
  return null;
}

function updateNodeStyles(tree, nodeId, newStyles) {
  const node = findNode(tree.root, nodeId);
  if (!node) return false;
  Object.assign(node.styles, newStyles);
  tree.version++;
  return true;
}

function updateNodeText(tree, nodeId, newText) {
  const node = findNode(tree.root, nodeId);
  if (!node) return false;
  node.text = newText;
  tree.version++;
  return true;
}

function removeNode(tree, nodeId) {
  return removeNodeFrom(tree.root, nodeId);
}

function removeNodeFrom(parent, nodeId) {
  const idx = parent.children.findIndex(c => c.id === nodeId);
  if (idx !== -1) {
    parent.children.splice(idx, 1);
    return true;
  }
  for (const child of parent.children) {
    if (removeNodeFrom(child, nodeId)) return true;
  }
  return false;
}

function countNodes(root) {
  if (!root) return 0;
  let count = 1;
  const children = Array.isArray(root.children) ? root.children : [];
  for (const child of children) {
    count += countNodes(child);
  }
  return count;
}

function cloneTree(tree) {
  return JSON.parse(JSON.stringify(tree));
}


/**
 * 扁平化所有节点
 * @param {DesignNode} root
 * @returns {DesignNode[]}
 */
function flattenNodes(root) {
  const result = [];
  function walk(node) {
    result.push(node);
    for (const child of node.children) walk(child);
  }
  walk(root);
  return result;
}

function pushChild(parent,child){parent.children.push(child);}

module.exports = {
  generateNodeId,
  createNode,
  createTree,
  createProject,
  addChild,
  findNode,
  updateNodeStyles,
  updateNodeText,
  removeNode,
  countNodes,
  cloneTree,
  pushChild,
  flattenNodes,
};
