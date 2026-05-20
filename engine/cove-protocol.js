/**
 * DesignSeed — COVE-CANVAS-PROTOCOL v1.2 接口实现
 * v0.6.6
 *
 * 对齐 COVE-CANVAS-PROTOCOL v1.2 规范：
 * - generatePreview: 生成预览 HTML（iframe 可直接渲染）
 * - generateTree: 生成 DesignTree（供画布解析）
 * - getNodeById: 按 ID 查找节点
 * - updateNode: 更新节点属性
 * - insertNode: 插入新节点
 * - deleteNode: 删除节点
 * - listNodes: 列出所有节点（扁平化）
 * - exportTree: 导出 DesignTree 为 JSON
 * - importTree: 从 JSON 导入 DesignTree
 *
 * 所有接口返回统一格式：
 * { success: boolean, data?: any, error?: string }
 */

const { buildFromPrompt } = require('./tree-builder');
const { treeToHtml, treeToFragment, getNode } = require('./tree-renderer');
const { createNode, addChild, pushChild, countNodes, flattenNodes, findNode, cloneTree } = require('./design-tree');

// ============================================================
// 统一响应格式
// ============================================================

function ok(data) {
  return { success: true, data };
}

function fail(error) {
  return { success: false, error };
}

// ============================================================
// 核心接口
// ============================================================

/**
 * generatePreview — 生成预览 HTML
 *
 * 输入：{ prompt: string, style?: string, viewport?: string }
 * 输出：{ html: string, tree: DesignTree, meta: object }
 *
 * 这是 NightShift 画布调用的主要接口。
 * 返回的 HTML 可直接在 iframe 中渲染，每个可交互元素带 data-ds-* 属性。
 */
function generatePreview(params) {
  if (!params || !params.prompt) {
    return fail('Missing required parameter: prompt');
  }

  try {
    // Validate style if provided (check builtin + packs)
    if (params.style) {
      const styles = require('./templates/styles');
      const stylePackLoader = require('./style-pack-loader');
      const { parseMixString } = require('./mixer');
      const mixCheck = parseMixString ? parseMixString(params.style) : null;
      if (mixCheck) {
        const aExists = styles[mixCheck.styleA] || stylePackLoader.getPack(mixCheck.styleA);
        const bExists = styles[mixCheck.styleB] || stylePackLoader.getPack(mixCheck.styleB);
        if (!aExists || !bExists) {
          return fail('STYLE_NOT_FOUND: Mixed style "' + params.style + '" has unknown component');
        }
      } else if (!styles[params.style] && !stylePackLoader.getPack(params.style)) {
        return fail('STYLE_NOT_FOUND: Unknown style "' + params.style + '"');
      }
    }

    const { tree, intent, style } = buildFromPrompt(params.prompt, {
      style: params.style,
    });

    // 更新 viewport
    if (params.viewport) {
      tree.meta.viewport = params.viewport;
    }

    const html = treeToHtml(tree);

    return ok({
      html,
      tree: exportTree({ tree }).data,
      meta: {
        title: tree.meta.title,
        pageType: intent.pageType,
        features: intent.features,
        nodeCount: countNodes(tree.root),
        style: params.style || 'minimalism',
        viewport: tree.meta.viewport,
      },
    });
  } catch (err) {
    return fail(`generatePreview failed: ${err.message}`);
  }
}

/**
 * generateTree — 生成 DesignTree（不含 HTML）
 *
 * 输入：{ prompt: string, style?: string }
 * 输出：{ tree: DesignTree, intent: object }
 *
 * 用于需要直接操作 DesignTree 的场景（如画布编辑器）。
 */
function generateTree(params) {
  if (!params || !params.prompt) {
    return fail('Missing required parameter: prompt');
  }

  try {
    const { tree, intent, style } = buildFromPrompt(params.prompt, {
      style: params.style,
    });

    return ok({
      tree: exportTree({ tree }).data,
      intent,
    });
  } catch (err) {
    return fail(`generateTree failed: ${err.message}`);
  }
}

/**
 * getNodeById — 按 ID 查找节点
 *
 * 输入：{ tree: DesignTree, nodeId: string }
 * 输出：{ node: DesignNode }
 */
function getNodeById(params) {
  if (!params || !params.tree || !params.nodeId) {
    return fail('Missing required parameters: tree, nodeId');
  }

  try {
    const tree = params.tree.root ? params.tree : params.tree;
    const node = findNode(tree.root || tree, params.nodeId);
    if (!node) {
      return fail(`Node not found: ${params.nodeId}`);
    }
    return ok({ node });
  } catch (err) {
    return fail(`getNodeById failed: ${err.message}`);
  }
}

/**
 * updateNode — 更新节点属性
 *
 * 输入：{ tree: DesignTree, nodeId: string, updates: { styles?, props?, text?, visible?, tag? } }
 * 输出：{ node: DesignNode }
 */
function updateNode(params) {
  if (!params || !params.tree || !params.nodeId || !params.updates) {
    return fail('Missing required parameters: tree, nodeId, updates');
  }

  try {
    const root = params.tree.root || params.tree;
    const node = findNode(root, params.nodeId);
    if (!node) {
      return fail(`Node not found: ${params.nodeId}`);
    }

    const { updates } = params;
    if (updates.styles) Object.assign(node.styles, updates.styles);
    if (updates.props) Object.assign(node.props, updates.props);
    if (updates.text !== undefined) node.text = updates.text;
    if (updates.visible !== undefined) node.visible = updates.visible;
    if (updates.tag !== undefined) node.tag = updates.tag;
    if (updates.name !== undefined) node.name = updates.name;
    if (updates.semantic !== undefined) node.semantic = updates.semantic;

    return ok({ node });
  } catch (err) {
    return fail(`updateNode failed: ${err.message}`);
  }
}

/**
 * insertNode — 插入新节点
 *
 * 输入：{ tree: DesignTree, parentId: string, node: DesignNode, index?: number }
 * 输出：{ node: DesignNode }
 */
function insertNode(params) {
  if (!params || !params.tree || !params.parentId || !params.node) {
    return fail('Missing required parameters: tree, parentId, node');
  }

  try {
    const root = params.tree.root || params.tree;
    const parent = findNode(root, params.parentId);
    if (!parent) {
      return fail(`Parent node not found: ${params.parentId}`);
    }

    const newNode = params.node.id ? params.node : createNode(params.node);

    if (params.index !== undefined && params.index >= 0) {
      parent.children.splice(params.index, 0, newNode);
    } else {
      parent.children.push(newNode);
    }

    return ok({ node: newNode });
  } catch (err) {
    return fail(`insertNode failed: ${err.message}`);
  }
}

/**
 * deleteNode — 删除节点
 *
 * 输入：{ tree: DesignTree, nodeId: string }
 * 输出：{ deleted: boolean }
 */
function deleteNode(params) {
  if (!params || !params.tree || !params.nodeId) {
    return fail('Missing required parameters: tree, nodeId');
  }

  try {
    const root = params.tree.root || params.tree;

    // 不允许删除根节点
    if (root.id === params.nodeId) {
      return fail('Cannot delete root node');
    }

    const removed = removeNode(root, params.nodeId);
    if (!removed) {
      return fail(`Node not found: ${params.nodeId}`);
    }

    return ok({ deleted: true });
  } catch (err) {
    return fail(`deleteNode failed: ${err.message}`);
  }
}

/**
 * 递归删除节点（内部辅助）
 */
function removeNode(root, nodeId) {
  for (let i = 0; i < root.children.length; i++) {
    if (root.children[i].id === nodeId) {
      root.children.splice(i, 1);
      return true;
    }
    if (removeNode(root.children[i], nodeId)) {
      return true;
    }
  }
  return false;
}

/**
 * listNodes — 列出所有节点（扁平化）
 *
 * 输入：{ tree: DesignTree, filter?: { type?: string, semantic?: string } }
 * 输出：{ nodes: DesignNode[], count: number }
 */
function listNodes(params) {
  if (!params || !params.tree) {
    return fail('Missing required parameter: tree');
  }

  try {
    const root = params.tree.root || params.tree;
    let nodes = flattenNodes(root);

    // 可选过滤
    if (params.filter) {
      if (params.filter.type) {
        nodes = nodes.filter(n => n.type === params.filter.type);
      }
      if (params.filter.semantic) {
        nodes = nodes.filter(n => n.semantic === params.filter.semantic);
      }
    }

    return ok({ nodes, count: nodes.length });
  } catch (err) {
    return fail(`listNodes failed: ${err.message}`);
  }
}

/**
 * exportTree — 导出 DesignTree 为 JSON
 *
 * 输入：{ tree: DesignTree }
 * 输出：{ json: string, tree: DesignTree }
 */
function exportTree(params) {
  if (!params || !params.tree) {
    return fail('Missing required parameter: tree');
  }

  try {
    const tree = params.tree;
    // 深拷贝避免修改原始数据
    const exported = {
      meta: { ...tree.meta },
      globalStyles: JSON.parse(JSON.stringify(tree.globalStyles)),
      root: JSON.parse(JSON.stringify(tree.root)),
    };

    return ok(exported);
  } catch (err) {
    return fail(`exportTree failed: ${err.message}`);
  }
}

/**
 * importTree — 从 JSON 导入 DesignTree
 *
 * 输入：{ json: string | object }
 * 输出：{ tree: DesignTree }
 */
function importTree(params) {
  if (!params || !params.json) {
    return fail('Missing required parameter: json');
  }

  try {
    const data = typeof params.json === 'string' ? JSON.parse(params.json) : params.json;

    if (!data.root) {
      return fail('Invalid tree data: missing root');
    }

    const tree = {
      meta: data.meta || { title: 'Imported' },
      globalStyles: data.globalStyles || {},
      root: data.root,
    };

    return ok({ tree });
  } catch (err) {
    return fail(`importTree failed: ${err.message}`);
  }
}

/**
 * generateFragment — 生成 HTML 片段（不含全局样式）
 *
 * 输入：{ tree: DesignTree, nodeId?: string }
 * 输出：{ html: string }
 *
 * 用于嵌入已有页面的局部组件。
 */
function generateFragment(params) {
  if (!params || !params.tree) {
    return fail('Missing required parameter: tree');
  }

  try {
    const root = params.tree.root || params.tree;

    if (params.nodeId) {
      const node = findNode(root, params.nodeId);
      if (!node) {
        return fail(`Node not found: ${params.nodeId}`);
      }
      const fragment = treeToFragment({ root: node });
      return ok({ html: fragment });
    }

    const fragment = treeToFragment({ root });
    return ok({ html: fragment });
  } catch (err) {
    return fail(`generateFragment failed: ${err.message}`);
  }
}


/**
 * listStyles — 列出所有可用风格
 *
 * 输入：无
 * 输出：{ styles: Array<{ id, name, nameEn, tone }> }
 */
function listStyles() {
  try {
    const styles = require('./templates/styles');
    const index = styles.STYLE_INDEX || [];
    return ok({ styles: index });
  } catch (err) {
    return fail('listStyles failed: ' + err.message);
  }
}

// ============================================================
// 协议元数据
// ============================================================

const PROTOCOL_VERSION = '1.2';
const ENGINE_VERSION = '0.6.6';

function getProtocolInfo() {
  return {
    protocol: 'COVE-CANVAS-PROTOCOL',
    protocolVersion: PROTOCOL_VERSION,
    engine: 'DesignSeed',
    engineVersion: ENGINE_VERSION,
    capabilities: [
      'generatePreview',
      'generateTree',
      'getNodeById',
      'updateNode',
      'insertNode',
      'deleteNode',
      'listNodes',
      'exportTree',
      'importTree',
      'generateFragment',
      'listStyles',
    ],
  };
}

module.exports = {
  generatePreview,
  generateTree,
  getNodeById,
  updateNode,
  insertNode,
  deleteNode,
  listNodes,
  exportTree,
  importTree,
  generateFragment,
  listStyles,
  getProtocolInfo,
  PROTOCOL_VERSION,
  ENGINE_VERSION,
};
