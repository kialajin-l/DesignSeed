# DesignSeed — 宿主接入指南

> 版本：v0.6.6 | 日期：2026-05-16
> 用途：为宿主（如 NightShift 2.0）提供 DesignSeed 的正式接入说明
> 状态：本文档是 DesignSeed 侧对宿主的唯一接入参考

---

## 一、正式推荐入口

> **⚠️ 以下为 DesignSeed 侧的唯一正式接入口径，宿主方必须以此为准。**

**当前正式推荐：本地 Node 进程内调用 `engine/cove-protocol.js`。**

具体方式：
- **首选**：`require('./engine/cove-protocol')` 直接调用函数
- **可选**：子进程中 `node -e` 加载 `cove-protocol.js` 后调用函数（适合进程隔离场景）

**以下方式不属于宿主正式 API：**
- `engine/cli.js` — 这是人用和调试用入口，不是宿主首选正式 API
- `engine/templates/styles.js` — 属于内部实现，不建议宿主直接依赖
- MCP Server — SKILL.md 中提到但实际 `mcp-server.js` 未实现
- HTTP REST — 未实现，无 HTTP 服务

---

## 二、可用接口

所有接口均在 `engine/cove-protocol.js` 中导出，返回统一格式：

```javascript
{ success: boolean, data?: any, error?: string }
```

### 2.1 核心生成

| 接口 | 输入 | 输出 | 说明 |
|------|------|------|------|
| `generatePreview(params)` | `{ prompt, style?, viewport? }` | `{ html, tree, meta }` | **主入口**。prompt → HTML + DesignTree |
| `generateTree(params)` | `{ prompt, style? }` | `{ tree, intent }` | 只生成 DesignTree，不含 HTML |

**`generatePreview` 返回结构：**

```javascript
{
  success: true,
  data: {
    html: string,           // 完整 HTML，可直接在 iframe 中渲染
    tree: {                 // DesignTree（导出格式）
      meta: { title, ... },
      globalStyles: { ... },
      root: DesignNode      // 根节点
    },
    meta: {
      title: string,        // 页面标题
      pageType: string,     // 页面类型（landing/dashboard/...）
      features: string[],   // 检测到的功能特性
      nodeCount: number,    // 节点总数
      style: string,        // 实际使用的风格 ID
      viewport: string      // 视口设置
    }
  }
}
```

### 2.2 样式

| 接口 | 输入 | 输出 | 说明 |
|------|------|------|------|
| `listStyles()` | 无 | `{ styles: [{ id, name, nameEn, tone }] }` | 获取所有可用风格列表 |

**宿主不应直接 `require('engine/templates/styles.js')`**，应通过 `listStyles()` 获取。

### 2.3 节点操作

| 接口 | 输入 | 输出 |
|------|------|------|
| `getNodeById(params)` | `{ tree, nodeId }` | `{ node }` |
| `updateNode(params)` | `{ tree, nodeId, updates }` | `{ node }` |
| `insertNode(params)` | `{ tree, parentId, node, index? }` | `{ node }` |
| `deleteNode(params)` | `{ tree, nodeId }` | `{ deleted: true }` |
| `listNodes(params)` | `{ tree, filter? }` | `{ nodes, count }` |

### 2.4 Tree 操作

| 接口 | 输入 | 输出 |
|------|------|------|
| `exportTree(params)` | `{ tree }` | `{ meta, globalStyles, root }` |
| `importTree(params)` | `{ json }` | `{ tree }` |
| `generateFragment(params)` | `{ tree, nodeId? }` | `{ html }` |

### 2.5 协议信息

| 接口 | 输入 | 输出 |
|------|------|------|
| `getProtocolInfo()` | 无 | `{ protocol, protocolVersion, engine, engineVersion, capabilities }` |

---

## 三、错误处理

所有接口在失败时返回：

```javascript
{ success: false, error: string }
```

错误码前缀约定：

| 前缀 | 含义 |
|------|------|
| `STYLE_NOT_FOUND:` | 指定的风格不存在 |
| `Missing required parameter:` | 缺少必填参数 |
| `Node not found:` | 节点 ID 不存在 |
| `Cannot delete root node` | 不允许删除根节点 |

宿主应检查 `success` 字段，失败时读取 `error` 字段展示给用户或记录日志。

---

## 四、版本信息

| 字段 | 值 |
|------|-----|
| 协议名称 | COVE-CANVAS-PROTOCOL |
| 协议版本 | 1.2 |
| 引擎版本 | 0.6.6 |

宿主可通过 `getProtocolInfo()` 动态获取版本，用于兼容性检查。

---

## 五、注意事项

1. **DesignTree 是单向生成的**：MVP 阶段 DesignSeed 生成 tree，宿主消费 tree。宿主不直接修改 tree 后回传给 DesignSeed（双向编辑在 v0.7+ 实现）。

2. **HTML 是 tree 的派生产物**：`generatePreview` 同时返回 `html` 和 `tree`，两者一致。宿主可以选择用 `html` 直接渲染（iframe），也可以用 `tree` 做 DOM 直渲染。

3. **style 参数可选**：不传 style 时使用默认风格 `minimalism`。传入不存在的 style 会返回错误。

4. **混合风格语法**：style 参数支持 `"styleA:styleB:ratio"` 格式（如 `"minimalism:cyberpunk:0.3"`），由 mixer 模块解析。

5. **不要依赖内部文件路径**：宿主应只依赖 `cove-protocol.js` 导出的接口，不要直接读取 `engine/templates/styles.js`、`engine/renderer.js` 等内部模块。CLI（`engine/cli.js`）是人用调试入口，不是宿主正式 API。

---

## 六、最小接入示例

### Node.js 直接 require

```javascript
const cove = require('/path/to/DesignSeed/engine/cove-protocol');

// 1. 生成预览
const result = cove.generatePreview({
  prompt: '做一个任务管理 App 的首页',
  style: 'cyberpunk',
});

if (result.success) {
  // result.data.html → iframe 渲染
  // result.data.tree → 画布解析
  // result.data.meta → 页面元信息
} else {
  console.error(result.error);
}

// 2. 获取样式列表
const styles = cove.listStyles();
// styles.data.styles → [{ id: 'minimalism', name: '极简主义', ... }]
```

### 子进程调用（NightShift 适配器模式）

```javascript
const { execFile } = require('child_process');
const path = require('path');

const covePath = path.join(designSeedDir, 'engine', 'cove-protocol.js');

const script = `
const protocol = require(process.argv[1]);
const params = JSON.parse(process.argv[2]);
const result = protocol.generatePreview(params);
process.stdout.write(JSON.stringify(result));
`;

execFile('node', ['-e', script, covePath, JSON.stringify({ prompt: '...', style: '...' })],
  (err, stdout) => {
    const result = JSON.parse(stdout.trim());
    // result.success, result.data.html, etc.
  }
);
```
