# DesignSeed — Cove 画布接口协议

> 版本：v1.2 | 日期：2026-05-14
> 用途：定义 DesignSeed 与 NightShift Cove 画布之间的数据契约和接口规范
> 适用方：DesignSeed 开发团队、NightShift 前端团队
> 变更记录：
> - v1.1 修复传输层解耦、ID 稳定性、单一真源、design.md 接入、多页面协议
> - v1.2 合并重复错误处理章节、DesignTree 新增 pageId、DesignProject 版本号语义区分、风格优先级明确化、export-code 接口占位、版本栈内存优化标注

---

## 一、协议概述

### 1.1 什么是 Cove 画布

Cove 是 NightShift 2.0 的前端画布组件，负责将 DesignSeed 生成的设计结果可视化渲染，并支持用户通过鼠标点击/拖拽进行交互式编辑。

### 1.2 传输层解耦

本协议定义的是**逻辑接口**（数据结构 + 语义契约），不限定传输层。DesignSeed 作为 Skill，与 NightShift 的集成方式取决于运行环境：

| 传输层 | 适用场景 | MVP 推荐 |
|--------|---------|---------|
| **stdio / in-process** | NightShift 内嵌 DesignSeed 模块，进程内直接调用 | ✅ MVP 首选 |
| **MCP Server** | DesignSeed 作为独立 MCP 服务，NightShift 通过 MCP 协议调用 | ✅ 可选 |
| **HTTP REST** | DesignSeed 作为独立 HTTP 服务，跨进程通信 | 后续迭代 |

**实现约定**：接口定义中的 `POST /api/design/xxx` 是逻辑路径，不代表必须用 HTTP。MVP 阶段通过 stdio 传输时，逻辑路径映射为 MCP tool name 或函数调用名。

### 1.3 集成架构

```
NightShift 前端 (React)
    │
    │  stdio / MCP / HTTP / 直接 require
    ▼
DesignSeed Service (Skill 模块 / MCP Server)
    │
    │  内部调用
    ▼
DesignSeed Engine + Memory + Rules
    │
    │  返回
    ▼
DesignTree (设计树，单一真源)
    │
    │  通过接口返回给 NightShift
    ▼
Cove Canvas Host (iframe / DOM 渲染)
```

### 1.4 设计原则

1. **DesignTree 是唯一真源**：DesignSeed 维护 DesignTree，HTML 由 Cove 侧根据 tree 生成（或由 DesignSeed 提供渲染后的 HTML 作为便捷字段）
2. **无状态渲染**：Cove 画布只负责渲染，不持有设计逻辑
3. **双向同步**：AI 生成和用户交互都通过同一套接口更新 DesignTree
4. **渐进增强**：MVP 只需核心接口，高级接口后续迭代

---

## 二、核心数据结构

### 2.1 DesignNode

```typescript
interface DesignNode {
  /**
   * 唯一标识符，由 DesignSeed 生成。
   * 格式：ds-{type}-{uuid4[:8]}
   * 示例：ds-section-a3f7b2c1
   * 
   * 重要：使用 UUID 而非 index，确保节点增删/重排后 ID 稳定。
   * Cove 画布的选中状态、undo 栈、缓存都依赖 ID 稳定性。
   */
  id: string;

  /** 节点类型 */
  type: 'page' | 'section' | 'component' | 'text' | 'image' | 'button' | 'container';

  /** 对应的 HTML 标签名（可选，用于 iframe 渲染） */
  tag?: string;

  /** CSS 样式对象，驼峰命名 */
  styles: Record<string, string | number>;

  /** HTML 属性（src, href, placeholder, alt 等） */
  props: Record<string, any>;

  /** 子节点数组 */
  children: DesignNode[];

  /** 文本内容（仅 text 类型节点） */
  text?: string;

  /** 是否锁定不可编辑 */
  locked?: boolean;

  /** 是否可见 */
  visible?: boolean;

  /** 组件显示名称（用于图层面板和选中提示） */
  name?: string;

  /** 组件语义标签（用于 AI 理解组件用途） */
  semantic?: string;  // e.g., 'hero', 'pricing-card', 'footer', 'nav'
}
```

### 2.2 DesignTree

```typescript
interface DesignTree {
  /**
   * 页面唯一 ID，用于导航引用和路由。
   * 示例："home", "pricing", "about"
   * DesignProject.navigation 的 from/to 字段引用此 ID。
   */
  pageId: string;

  /** 设计树版本号，每次修改递增（用于 undo/redo 和乐观锁） */
  version: number;

  /** 根节点（page 类型） */
  root: DesignNode;

  /** 全局样式（CSS 变量、字体定义等） */
  globalStyles: {
    /** CSS 变量 */
    variables: Record<string, string>;
    /** 字体定义 */
    fonts: Array<{
      name: string;
      url?: string;
      weights: number[];
    }>;
    /** 全局 CSS 规则（body, * 等） */
    baseRules: Record<string, Record<string, string>>;
  };

  /** 页面元信息 */
  meta: {
    title: string;
    description?: string;
    viewport?: string;
    favicon?: string;
  };
}
```

### 2.3 DesignProject（多页面容器）

```typescript
interface DesignProject {
  /**
   * 项目版本号（与 DesignTree.version 语义不同）
   * - DesignTree.version：单页面的设计版本，用于 undo/redo
   * - DesignProject.projectVersion：整个项目的版本，用于项目级 undo/redo 和冲突检测
   */
  projectVersion: number;

  /** 多个页面 */
  pages: DesignTree[];

    /** 页面间导航关系 */
  navigation: Array<{
    /** 源页面 ID（引用 DesignTree.pageId） */
    from: string;
    /** 目标页面 ID（引用 DesignTree.pageId） */
    to: string;
    /** 触发方式 */
    trigger: 'click' | 'submit' | 'auto';
    /** 触发节点 ID（在源页面中） */
    sourceNodeId: string;
  }>;

  /** 项目元信息 */
  meta: {
    title: string;
    description?: string;
  };
}
```

> **MVP 说明**：v0.7 只支持单页面（DesignTree），DesignProject 作为预留结构。多页面导航在 v0.9 实现。

### 2.4 StyleDescriptor

```typescript
interface StyleDescriptor {
  /** 风格 ID */
  id: string;

  /** 风格显示名称 */
  name: string;

  /** 风格描述 */
  description: string;

  /** 调性向量 */
  tone: {
    formality: number;   // 0-1, 正式度
    warmth: number;      // 0-1, 温暖度
    complexity: number;  // 0-1, 复杂度
    innovation: number;  // 0-1, 创新度
  };

  /** 风格缩略图 URL（可选） */
  thumbnail?: string;
}
```

### 2.5 UserPreferences

```typescript
interface UserPreferences {
  /** 风格偏好向量（基于历史交互学习） */
  styleVector: {
    formality: number;
    warmth: number;
    complexity: number;
    innovation: number;
  };

  /** 偏好置信度（0-1，越高越确定） */
  confidence: number;

  /** 最近使用的风格 ID 列表 */
  recentStyles: string[];

  /** 用户自定义规则 */
  customRules: Array<{
    id: string;
    type: 'hard_limit' | 'soft_preference';
    dimension: string;
    condition: string;
    threshold: number;
  }>;
}
```

---

## 三、接口定义

### 3.1 生成设计

**逻辑路径**：`design/generate`

根据用户 prompt 生成完整设计树。

**请求：**

```typescript
interface GenerateRequest {
  /** 用户描述 */
  prompt: string;

  /** 指定风格 ID（可选，不传则由 AI 根据偏好自动选择） */
  styleId?: string;

  /** 风格混合比例（可选，仅当 styleId 包含两个风格时使用） */
  styleBlend?: {
    styleA: string;
    styleB: string;
    ratio: number;  // 0 = 纯 A, 1 = 纯 B
  };

  /** 上下文信息（可选，帮助 AI 理解需求） */
  context?: {
    /** 项目类型：landing, dashboard, blog, portfolio... */
    projectType?: string;
    /** 目标受众 */
    audience?: string;
    /** 参考图片 URL */
    referenceImages?: string[];
    /**
     * 品牌设计规范（design.md 驱动）
     * v0.6 核心卖点：品牌一致性
     */
    designSpec?: {
      /** design.md 文件路径（DesignSeed 读取本地文件） */
      path?: string;
      /** 或直接传入 design.md 内容 */
      content?: string;
    };
  };

    /** 用户偏好（NightShift 从 DesignSeed 获取后传入） */
  preferences?: UserPreferences;
}

/**
 * 风格优先级规则：
 * styleId（显式指定） > preferences.styleVector（用户偏好） > 系统默认
 * 当 styleId 存在时，preferences 仅作为微调参考（如色彩饱和度等非风格维度）
 * 当 styleId 不存在时，preferences.styleVector 驱动风格自动选择
 */
```

**响应：**

```typescript
interface GenerateResponse {
  /**
   * 生成的设计树（单一真源）
   * Cove 侧根据此 tree 渲染画布
   */
  tree: DesignTree;

  /** 使用的风格 */
  appliedStyle: StyleDescriptor;

  /** 生成耗时（ms） */
  duration: number;

  /** 设计质量评分（0-100） */
  qualityScore: number;

  /** 规则检查结果 */
  ruleCheck: {
    passed: boolean;
    violations: Array<{
      rule: string;
      severity: 'error' | 'warning';
      message: string;
      nodeId?: string;
      autoFixed?: boolean;
    }>;
  };

  /**
   * 渲染后的完整 HTML（便捷字段，可选）
   * 
   * 设计原则：tree 是真源，html 是 tree 的派生产物。
   * - 如果 Cove 侧有渲染能力（DOM 直渲染），可以忽略此字段
   * - 如果 Cove 侧使用 iframe 渲染，可以直接使用此字段避免重复渲染
   * - DesignSeed 保证 tree 和 html 的一致性
   */
  html?: string;
}
```

### 3.2 更新节点

**逻辑路径**：`design/update-node`

用户通过交互修改单个节点（点击编辑、拖拽移动等）。

**请求：**

```typescript
interface UpdateNodeRequest {
  /** 要更新的节点 ID */
  nodeId: string;

  /** 更新内容（只传需要修改的字段） */
  changes: {
    styles?: Record<string, string | number>;
    props?: Record<string, any>;
    text?: string;
    visible?: boolean;
    locked?: boolean;
  };

  /** 更新来源（用于反馈学习） */
  source: 'user_click' | 'user_drag' | 'user_edit' | 'ai_suggestion';
}
```

**响应：**

```typescript
interface UpdateNodeResponse {
  /** 更新后的设计树 */
  tree: DesignTree;

  /** 更新后的完整 HTML（便捷字段，可选） */
  html?: string;

  /** 更新是否触发了规则违规 */
  ruleCheck?: {
    passed: boolean;
    violations: Array<{
      rule: string;
      severity: 'error' | 'warning';
      message: string;
      autoFixed?: boolean;
    }>;
  };
}
```

### 3.3 批量更新节点

**逻辑路径**：`design/update-nodes`

一次性更新多个节点（用于拖拽布局等场景）。

**请求：**

```typescript
interface BatchUpdateRequest {
  /** 更新列表 */
  updates: Array<{
    nodeId: string;
    changes: {
      styles?: Record<string, string | number>;
      props?: Record<string, any>;
      text?: string;
    };
  }>;

  /** 更新来源 */
  source: 'user_drag' | 'user_reorder' | 'ai_batch';
}
```

**响应：** 同 `UpdateNodeResponse`。

### 3.4 切换风格

**逻辑路径**：`design/switch-style`

切换整体风格，重新渲染整个设计树。

**请求：**

```typescript
interface SwitchStyleRequest {
  /** 目标风格 ID */
  styleId: string;

  /** 是否保留当前布局（只换视觉风格） */
  preserveLayout?: boolean;

  /** 风格混合（可选） */
  blend?: {
    withStyle: string;
    ratio: number;
  };
}
```

**响应：** 同 `GenerateResponse`。

### 3.5 获取设计树

**逻辑路径**：`design/tree`

获取当前设计树（用于状态同步和 undo/redo）。

**请求（可选参数）：**

```typescript
interface GetTreeRequest {
  /** 指定版本号获取历史树（用于 undo/redo），不传则返回当前版本 */
  version?: number;
}
```

**响应：**

```typescript
interface TreeResponse {
  tree: DesignTree;

  /** 当前最新版本号 */
  latestVersion: number;

  /** 可用的历史版本范围（用于 undo/redo 按钮状态） */
  versionRange?: {
    min: number;  // 最早可用版本
    max: number;  // 最新版本
  };
}
```

> **undo/redo 机制**：DesignSeed 内部维护一个版本栈（最近 50 个版本）。Cove 侧通过 `GET /api/design/tree?version=N` 获取指定版本的树来实现 undo/redo。MVP 阶段 Cove 侧只需维护前端 undo 栈（缓存最近几次 tree 快照），不需要调用此接口获取历史版本。

### 3.6 获取可用风格列表

**逻辑路径**：`design/styles`

**响应：**

```typescript
interface StylesResponse {
  styles: StyleDescriptor[];

  /** 用户偏好推荐的风格（排在前面） */
  recommended: string[];
}
```

### 3.7 获取用户偏好

**逻辑路径**：`design/preferences`

**响应：**

```typescript
interface PreferencesResponse {
  preferences: UserPreferences;
}
```

### 3.8 记录反馈

**逻辑路径**：`design/feedback`

记录用户对生成结果的反馈（用于偏好学习）。

**请求：**

```typescript
interface FeedbackRequest {
  /** 反馈类型 */
  type: 'accepted' | 'modified' | 'rejected' | 'explicit_like' | 'explicit_dislike';

  /** 关联的设计版本 */
  designVersion: number;

  /** 用户修改的节点 ID 列表（仅 modified 时） */
  modifiedNodeIds?: string[];

  /** 用户显式评价内容（仅 explicit 时） */
  comment?: string;
}
```

**响应：**

```typescript
interface FeedbackResponse {
  /** 更新后的用户偏好 */
  preferences: UserPreferences;
}
```

---

## 四、iframe 渲染协议

MVP 阶段使用 iframe 渲染 DesignSeed 生成的 HTML。Cove Canvas Host 和 iframe 之间通过 `postMessage` 通信。

### 4.1 Host → iframe 消息

```typescript
// 渲染完整 HTML
interface RenderMessage {
  type: 'render';
  html: string;           // 完整 HTML 字符串
  selectedNodeId?: string; // 当前选中的节点 ID
}

// 高亮指定节点
interface HighlightMessage {
  type: 'highlight';
  nodeId: string;
  color?: string;         // 高亮边框颜色，默认 #3B82F6
}

// 取消高亮
interface ClearHighlightMessage {
  type: 'clear-highlight';
}

// 滚动到指定节点
interface ScrollToMessage {
  type: 'scroll-to';
  nodeId: string;
  behavior?: 'smooth' | 'instant';
}
```

### 4.2 iframe → Host 消息

```typescript
// 节点被点击
interface NodeClickMessage {
  type: 'node-click';
  nodeId: string;
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
  };
}

// 节点被 hover
interface NodeHoverMessage {
  type: 'node-hover';
  nodeId: string | null;  // null 表示鼠标移出
  rect?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// 节点尺寸变化（响应式预览时）
interface NodeResizeMessage {
  type: 'node-resize';
  nodeId: string;
  newSize: {
    width: number;
    height: number;
  };
}

// iframe 加载完成
interface ReadyMessage {
  type: 'ready';
}
```

### 4.3 iframe 内的 data-node-id 注入

DesignSeed 生成 HTML 时，需要在每个可交互元素上注入 `data-node-id` 属性：

```html
<!-- DesignSeed 生成的 HTML 需要包含这个脚本 -->
<script>
  // 点击事件代理
  document.addEventListener('click', (e) => {
    const node = e.target.closest('[data-node-id]');
    if (node) {
      const rect = node.getBoundingClientRect();
      window.parent.postMessage({
        type: 'node-click',
        nodeId: node.getAttribute('data-node-id'),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        modifiers: {
          shift: e.shiftKey,
          ctrl: e.ctrlKey || e.metaKey,
          alt: e.altKey
        }
      }, '*');
    }
  });

  // Hover 事件代理
  document.addEventListener('mouseover', (e) => {
    const node = e.target.closest('[data-node-id]');
    if (node) {
      const rect = node.getBoundingClientRect();
      window.parent.postMessage({
        type: 'node-hover',
        nodeId: node.getAttribute('data-node-id'),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      }, '*');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const node = e.target.closest('[data-node-id]');
    if (node) {
      window.parent.postMessage({
        type: 'node-hover',
        nodeId: null
      }, '*');
    }
  });

  // 通知 Host 已就绪
  window.parent.postMessage({ type: 'ready' }, '*');
</script>
```

### 4.4 DesignSeed HTML 输出规范

DesignSeed 生成的 HTML 需要满足以下规范才能在 Cove iframe 中正确渲染：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{meta.title}</title>

  <!-- 全局样式 -->
  <style>
    /* CSS 变量 */
    :root {
      --ds-primary: #3B82F6;
      --ds-bg: #FFFFFF;
      /* ... */
    }

    /* 基础重置 */
    * { margin: 0; padding: 0; box-sizing: border-box; }

    /* 组件基础样式 */
    [data-ds-type] {
      position: relative;
      transition: outline 0.15s ease;
    }

    /* 选中态高亮（由 Host 控制） */
    [data-ds-type].ds-selected {
      outline: 2px solid #3B82F6;
      outline-offset: 2px;
    }

    /* Hover 态高亮 */
    [data-ds-type]:hover {
      outline: 1px dashed rgba(59, 130, 246, 0.5);
      outline-offset: 2px;
    }
  </style>
</head>
<body>
  <!-- 设计内容，每个组件带 data-ds-type 和 data-node-id -->
  <div data-ds-type="page" data-node-id="ds-page-a3f7b2c1">
    <section data-ds-type="section" data-node-id="ds-section-b8e2d4f0" class="hero">
      <h1 data-ds-type="text" data-node-id="ds-text-c1a9e3d5">标题</h1>
      <p data-ds-type="text" data-node-id="ds-text-d4f0b7a2">副标题</p>
      <button data-ds-type="button" data-node-id="ds-button-e7c3f1a8">开始使用</button>
    </section>
  </div>

  <!-- Cove 桥接脚本 -->
  <script>{/* 4.3 中的桥接脚本 */}</script>
</body>
</html>
```

---

## 五、错误处理

### 5.1 错误响应格式

```typescript
interface ErrorResponse {
  error: {
    code: string;           // 错误码
    message: string;        // 人类可读描述
    details?: any;          // 附加信息
  };
}
```

### 5.2 错误码

| 错误码 | 说明 |
|--------|------|
| `INVALID_PROMPT` | prompt 为空或格式错误 |
| `STYLE_NOT_FOUND` | 指定的 styleId 不存在 |
| `NODE_NOT_FOUND` | 指定的 nodeId 在当前设计树中不存在 |
| `RULE_VIOLATION` | 修改违反了硬限制规则且无法自动修复 |
| `ENGINE_ERROR` | DesignSeed 引擎内部错误 |
| `MEMORY_ERROR` | 记忆模块读写失败 |
| `DESIGN_SPEC_ERROR` | design.md 解析失败或路径无效 |

---

## 六、版本路线

### 6.1 接口版本规划

| 协议版本 | DesignSeed 版本 | NightShift 版本 | 新增接口 |
|---------|----------------|----------------|---------|
| v1.0 | v0.7 | v0.7 | generate, update-node, update-nodes, switch-style, tree, styles, preferences, feedback |
| v1.1 | v0.8 | v0.8 | undo, redo, export-code, batch-generate |
| v1.2 | v0.9 | v0.9 | project（多页面）, navigation, ai-suggest |

### 6.2 v1.1 计划接口（当前标注，后续实现）

**undo / redo**

```typescript
// DesignSeed 维护版本栈，Cove 侧调用获取上/下一个版本
interface UndoResponse {
  tree: DesignTree;
  html?: string;
  version: number;
}

// POST /api/design/undo → 返回上一个 DesignTree
// POST /api/design/redo → 返回下一个 DesignTree
```

> **内存优化提示**：当前设计为全量 DesignTree 快照（最近 50 个版本）。在复杂页面场景下可能占用较大内存。后续可改为 diff 增量存储（只记录变更的节点），MVP 阶段先用全量快照。

**export-code**

```typescript
interface ExportCodeRequest {
  tree: DesignTree;
  format: 'html' | 'react' | 'vue';
}

interface ExportCodeResponse {
  /** 生成的代码字符串 */
  code: string;
  /** 代码语言标识 */
  language: string;
  /** 文件名建议 */
  filename: string;
}

// POST /api/design/export-code → 返回可导出的代码
```

**AI 主动推送（ai-suggest）**

```typescript
// AI 主动建议修改（如"这个配色对比度不够，建议替换"）
// MVP 阶段不实现，在协议里标注为 v1.1 计划
interface AiSuggestMessage {
  type: 'ai-suggest';
  suggestion: {
    /** 建议类型 */
    kind: 'color' | 'layout' | 'typography' | 'spacing' | 'accessibility';
    /** 建议描述 */
    description: string;
    /** 关联的节点 ID */
    nodeId?: string;
    /** 建议的修改（可直接应用） */
    proposedChanges?: Record<string, any>;
    /** 建议置信度 */
    confidence: number;
  };
}
```

---

## 七、开发指南

### 8.1 DesignSeed 侧需要做的

1. **实现 DesignTree 输出**：Engine 生成 HTML 的同时输出结构化的 DesignNode 树（ID 使用 UUID）
2. **注入 data-node-id**：HTML 中每个可交互元素添加 `data-ds-type` 和 `data-node-id` 属性
3. **实现 update-node 接口**：支持根据 nodeId 定位并修改 DesignNode
4. **实现反馈记录接口**：支持用户反馈信号写入 Memory
5. **实现 design.md 解析**：支持从路径或内容解析品牌设计规范
6. **实现版本栈**：维护最近 50 个 DesignTree 版本（为 undo/redo 预留）

### 8.2 NightShift 侧需要做的

1. **实现 Cove Canvas Host**：iframe 容器 + postMessage 桥接
2. **实现交互层**：点击选择 + 高亮 + 属性面板
3. **实现状态管理**：DesignTree 的本地缓存和同步
4. **实现对话联动**：选中组件时自动注入对话上下文
5. **实现前端 undo 栈**：缓存最近几次 tree 快照，Ctrl+Z/Ctrl+Y 响应

### 8.3 联调流程

```
1. DesignSeed 提供 mock HTML（带 data-node-id，UUID 格式）
2. NightShift 实现 iframe 渲染 + 点击事件捕获
3. DesignSeed 实现 update-node 接口
4. NightShift 实现点击 → update-node → 重新渲染闭环
5. 联调对话驱动修改：用户输入 → DesignSeed 生成 → 画布更新
6. 联调 design.md：DesignSeed 提供示例 design.md → NightShift 传入 context.designSpec → 验证品牌一致性
```
