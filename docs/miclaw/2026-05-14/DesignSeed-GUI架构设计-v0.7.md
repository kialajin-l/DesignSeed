# DesignSeed GUI 架构设计 — v0.7 详细设计

> 版本：v1.0 | 日期：2026-05-14
> 定位：DesignSeed 从 Skill 升级为 GUI 工具的架构设计
> 前置文档：[COVE-CANVAS-PROTOCOL.md](./COVE-CANVAS-PROTOCOL.md)

---

## 一、v0.7 目标

### 1.1 一句话目标

**DesignSeed 从"通过对话使用的 Skill"升级为"带 GUI 的 AI 原型设计工具"**，整合 Cove 画布，实现对话生成 + 点击微调的混合交互。

### 1.2 核心能力

| 能力 | 说明 | 来源 |
|------|------|------|
| AI 对话生成 | 自然语言描述 → 实时生成 UI 原型 | DesignSeed Engine（已有） |
| 画布实时渲染 | 生成结果在画布中可视化展示 | Cove Canvas Host（新增） |
| 点击选择 | 鼠标点击画布组件 → 高亮 + 显示信息 | Interaction Layer（新增） |
| 对话驱动修改 | 在对话流中输入修改指令 → 画布更新 | DesignSeed + Cove 联动（新增） |
| 风格切换 | 一键切换 12 种风格 + 混合 | DesignSeed Engine（已有） |
| 偏好记忆 | 越用越懂你的审美偏好 | DesignSeed Memory（已有） |

### 1.3 不做什么（v0.7 明确排除）

| 功能 | 推迟到 | 原因 |
|------|--------|------|
| 拖拽移动组件 | v0.8 | iframe 内拖拽桥接复杂 |
| 属性面板 | v0.8 | 先通过对话修改 |
| DOM 直渲染 | v0.8 | iframe 够用 |
| 图层面板 | v0.8 | MVP 阶段组件层级简单 |
| 多页面管理 | v0.9 | 先做单页面 |
| 代码导出 | v0.8 | 先做视觉预览 |

---

## 二、系统架构

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    DesignSeed GUI                        │
│                                                         │
│  ┌──────────────────┐  ┌──────────────────────────────┐ │
│  │                  │  │                              │ │
│  │   对话面板        │  │      Cove Canvas Host        │ │
│  │   (Chat Panel)   │  │      (画布宿主)              │ │
│  │                  │  │                              │ │
│  │  ┌────────────┐  │  │  ┌────────────────────────┐  │ │
│  │  │ 消息流      │  │  │  │  iframe 渲染容器       │  │ │
│  │  │            │  │  │  │  (DesignSeed HTML)     │  │ │
│  │  │ 用户输入 ──┼──┼──┼──┼─→ 实时渲染             │  │ │
│  │  │            │  │  │  │                        │  │ │
│  │  │ AI 回复    │←─┼──┼──┼── 交互事件             │  │ │
│  │  │            │  │  │  └────────────────────────┘  │ │
│  │  └────────────┘  │  │                              │ │
│  │                  │  │  ┌────────────────────────┐  │ │
│  │  ┌────────────┐  │  │  │  工具栏               │  │ │
│  │  │ 输入框      │  │  │  │  风格选择 | 缩放 | 导出│  │ │
│  │  └────────────┘  │  │  └────────────────────────┘  │ │
│  │                  │  │                              │ │
│  └──────────────────┘  └──────────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────────┐│
│  │                   后端服务                            ││
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐            ││
│  │  │ Engine   │ │ Memory   │ │ Rules    │            ││
│  │  │ (生成)   │ │ (记忆)   │ │ (规则)   │            ││
│  │  └──────────┘ └──────────┘ └──────────┘            ││
│  └──────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

### 2.2 技术栈

| 层 | 技术 | 理由 |
|---|------|------|
| 桌面壳 | Tauri 2.0 | 轻量、安全、原生性能（与 OpenPencil 一致） |
| 前端框架 | React 18 + TypeScript | 生态成熟，组件化开发 |
| 状态管理 | Zustand | 轻量，适合画布状态 |
| 样式方案 | Tailwind CSS | 路线图已规划，快速开发 |
| 画布渲染（MVP） | iframe srcdoc | DesignSeed 已有 HTML 生成能力 |
| 后端运行时 | Node.js（Tauri sidecar） | 复用现有 DesignSeed 代码 |
| 存储 | SQLite（better-sqlite3） | 本地零依赖 |

### 2.3 目录结构

```
DesignSeed/
├── gui/                          # GUI 应用（v0.7 新增）
│   ├── src/
│   │   ├── main.tsx              # React 入口
│   │   ├── App.tsx               # 主布局（对话 + 画布）
│   │   ├── components/
│   │   │   ├── ChatPanel/        # 对话面板
│   │   │   │   ├── ChatPanel.tsx
│   │   │   │   ├── MessageList.tsx
│   │   │   │   ├── MessageBubble.tsx
│   │   │   │   └── InputBox.tsx
│   │   │   ├── CanvasHost/       # Cove 画布宿主
│   │   │   │   ├── CanvasHost.tsx
│   │   │   │   ├── iframeBridge.ts
│   │   │   │   └── CanvasToolbar.tsx
│   │   │   └── shared/           # 共享组件
│   │   │       ├── StylePicker.tsx
│   │   │       └── LoadingSpinner.tsx
│   │   ├── stores/               # Zustand 状态
│   │   │   ├── chatStore.ts      # 对话状态
│   │   │   ├── canvasStore.ts    # 画布状态
│   │   │   └── designStore.ts    # 设计树状态
│   │   ├── services/             # 后端通信
│   │   │   ├── designService.ts  # DesignSeed API 调用
│   │   │   └── llmService.ts     # LLM API 调用
│   │   ├── types/                # TypeScript 类型
│   │   │   └── index.ts          # DesignNode, DesignTree 等
│   │   └── styles/
│   │       └── globals.css       # Tailwind 入口
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── engine/                       # HTML 设计引擎（已有）
├── crawler/                      # 设计爬虫（已有）
├── memory/                       # 嵌入式记忆（已有）
├── rules/                        # 美学规则引擎（已有）
├── sync/                         # 同步层（已有）
├── docs/                         # 文档
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   └── COVE-CANVAS-PROTOCOL.md   # Cove 接口协议
└── package.json
```

---

## 三、核心模块设计

### 3.1 对话面板（Chat Panel）

**职责**：接收用户输入，展示 AI 回复，管理对话历史。

**交互流程：**

```
用户输入文字
    │
    ▼
Chat Panel 发送消息到 designService
    │
    ▼
designService 调用 LLM（携带 DesignNode 上下文）
    │
    ▼
LLM 返回两种可能：
    ├─ 纯文字回复 → 直接显示在对话流
    └─ 设计指令 → designService 调用 Engine 生成/修改 DesignNode
                    │
                    ▼
              返回新的 DesignTree + HTML
                    │
                    ▼
              Chat Panel 显示"已生成/修改 X 个组件"
              Canvas Host 更新画布
```

**消息类型：**

```typescript
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;

  // AI 回复可能附带设计操作
  designAction?: {
    type: 'generate' | 'update' | 'switch-style';
    summary: string;           // "生成了一个 SaaS 定价页，使用 cyberpunk 风格"
    designVersion: number;     // 关联的设计版本
  };

  // 用户消息可能附带选中上下文
  selectedContext?: {
    nodeId: string;
    nodeName: string;
    nodeType: string;
  };
}
```

### 3.2 画布宿主（Canvas Host）

**职责**：渲染 DesignSeed 生成的 HTML，处理用户交互事件。

**MVP 实现（iframe 模式）：**

```typescript
// CanvasHost.tsx 核心逻辑
function CanvasHost() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { designTree, html, selectedNodeId } = useDesignStore();

  // 监听 iframe 消息
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      switch (e.data.type) {
        case 'node-click':
          // 选中组件 → 高亮 + 更新状态
          selectNode(e.data.nodeId);
          break;
        case 'node-hover':
          // Hover 预览
          hoverNode(e.data.nodeId);
          break;
        case 'ready':
          // iframe 加载完成，发送当前设计
          sendToIframe({ type: 'render', html });
          break;
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  // 设计树变化时重新渲染
  useEffect(() => {
    if (iframeRef.current) {
      sendToIframe({ type: 'render', html, selectedNodeId });
    }
  }, [html, selectedNodeId]);

  return (
    <div className="canvas-host">
      <CanvasToolbar />
      <iframe
        ref={iframeRef}
        srcDoc={html}
        sandbox="allow-scripts"
        className="canvas-iframe"
      />
    </div>
  );
}
```

### 3.3 iframe 桥接层（iframeBridge）

**职责**：封装 Host ↔ iframe 的 postMessage 通信。

```typescript
// iframeBridge.ts
export class IframeBridge {
  private iframe: HTMLIFrameElement;
  private listeners: Map<string, Set<Function>> = new Map();

  constructor(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  // 发送消息到 iframe
  send(msg: CoveToIframe) {
    this.iframe.contentWindow?.postMessage(msg, '*');
  }

  // 监听 iframe 消息
  on(type: string, callback: Function) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  private handleMessage(e: MessageEvent) {
    const msg = e.data as IframeToCove;
    this.listeners.get(msg.type)?.forEach(cb => cb(msg));
  }
}
```

### 3.4 设计服务（DesignService）

**职责**：封装所有与 DesignSeed Engine 的通信。

```typescript
// designService.ts
export class DesignService {
  // 生成设计
  async generate(prompt: string, options?: {
    styleId?: string;
    styleBlend?: { styleA: string; styleB: string; ratio: number };
  }): Promise<GenerateResponse> {
    // MVP 阶段：直接 require DesignSeed engine
    // 后续：通过 HTTP/stdio 调用 DesignSeed MCP Server
    const engine = require('../../engine');
    return engine.generate(prompt, options);
  }

  // 更新节点
  async updateNode(nodeId: string, changes: Partial<DesignNode>, source: string): Promise<UpdateNodeResponse> {
    // ...
  }

  // 切换风格
  async switchStyle(styleId: string, preserveLayout?: boolean): Promise<GenerateResponse> {
    // ...
  }

  // 获取风格列表
  async getStyles(): Promise<StyleDescriptor[]> {
    // ...
  }

  // 记录反馈
  async recordFeedback(type: string, designVersion: number): Promise<void> {
    // ...
  }
}
```

---

## 四、状态管理

### 4.1 设计状态（designStore）

```typescript
// designStore.ts
interface DesignState {
  // 当前设计树
  tree: DesignTree | null;
  // 当前 HTML
  html: string;
  // 当前选中的节点 ID
  selectedNodeId: string | null;
  // 当前风格
  currentStyle: StyleDescriptor | null;
  // 可用风格列表
  availableStyles: StyleDescriptor[];
  // 设计版本（用于撤销/重做）
  version: number;
  // 历史记录
  history: DesignTree[];
  historyIndex: number;

  // Actions
  setDesign: (tree: DesignTree, html: string) => void;
  selectNode: (nodeId: string | null) => void;
  switchStyle: (style: StyleDescriptor) => void;
  undo: () => void;
  redo: () => void;
}
```

### 4.2 对话状态（chatStore）

```typescript
// chatStore.ts
interface ChatState {
  // 消息列表
  messages: ChatMessage[];
  // 是否正在生成
  isGenerating: boolean;

  // Actions
  addUserMessage: (content: string, selectedContext?: any) => void;
  addAssistantMessage: (content: string, designAction?: any) => void;
  setGenerating: (v: boolean) => void;
}
```

---

## 五、用户交互流程

### 5.1 首次使用

```
1. 用户打开 DesignSeed GUI
2. 看到空白画布 + 对话面板
3. 对话面板显示欢迎消息："描述你想要的页面，我来生成"
4. 用户输入："生成一个 SaaS 产品的定价页，暗色主题，科技感"
5. AI 分析 prompt → 选择 cyberpunk 风格 → 调用 Engine 生成
6. 画布实时渲染生成结果
7. 对话面板显示："已生成定价页，包含 3 个价格卡片 + 对比表 + FAQ"
8. 用户看到画布中的页面，觉得不错
```

### 5.2 对话驱动修改

```
1. 用户在对话流输入："把标题字体再大一点"
2. AI 理解为：修改 hero 区块的标题字号
3. DesignSeed updateNode(ds-text-0, { styles: { fontSize: '48px' } })
4. 画布更新，标题变大
5. 对话面板显示："已将标题字号从 32px 调整为 48px"
```

### 5.3 点击选中 + 对话修改（混合交互）

```
1. 用户在画布点击某个价格卡片
2. 画布高亮该卡片，显示蓝色边框
3. 对话面板自动追加上下文："当前选中：价格卡片（Pro 方案，$29/月）"
4. 用户在对话流输入："把这个卡片的背景色换成蓝色"
5. AI 知道"这个卡片"指的是选中的 Pro 价格卡片
6. DesignSeed updateNode(ds-container-2, { styles: { backgroundColor: '#3B82F6' } })
7. 画布更新，该卡片背景变蓝
```

### 5.4 风格切换

```
1. 用户点击工具栏的风格选择器
2. 弹出 12 种风格列表（带缩略图预览）
3. 用户选择"水墨"风格
4. DesignSeed switchStyle('ink-wash', preserveLayout: true)
5. 画布重新渲染，布局不变但视觉风格变为水墨风
6. 对话面板显示："已切换为水墨风格，布局保持不变"
```

---

## 六、与 NightShift 的集成

### 6.1 两种使用模式

**模式 A：独立 GUI 应用**

DesignSeed 作为独立的 Tauri 桌面应用运行，不依赖 NightShift。

```
用户 → DesignSeed GUI (Tauri) → DesignSeed Engine → 生成设计
```

**模式 B：NightShift 内嵌模块**

DesignSeed 作为 NightShift 的子模块，通过 MCP 或 stdio 被调用。

```
用户 → NightShift → DesignSeed MCP Server → 生成设计 → NightShift Cove 画布渲染
```

### 6.2 模式切换

v0.7 先实现模式 A（独立 GUI），模式 B 在 NightShift 2.0 Phase 3 集成时实现。

模式 B 的关键差异：
- DesignSeed 不自己渲染画布，只返回 DesignNode[] + HTML
- NightShift 的 Cove Canvas Host 负责渲染
- 对话面板由 NightShift 提供，DesignSeed 只提供后端服务

---

## 七、开发计划

### 7.1 Sprint 1（第 1 周）：基础框架

- [ ] 初始化 Tauri + React + Tailwind 项目
- [ ] 实现主布局（左对话 + 右画布）
- [ ] 实现对话面板基础 UI（消息流 + 输入框）
- [ ] 实现 iframe 画布容器
- [ ] 对接 DesignSeed Engine（generate 接口）

### 7.2 Sprint 2（第 2 周）：核心交互

- [ ] 实现 iframe 桥接层（postMessage 通信）
- [ ] 实现点击选择（高亮 + 状态更新）
- [ ] 实现对话驱动修改（选中上下文 + updateNode）
- [ ] 实现风格选择器 UI
- [ ] 实现风格切换功能

### 7.3 Sprint 3（第 3 周）：打磨体验

- [ ] 实现撤销/重做
- [ ] 实现画布缩放/平移
- [ ] 实现加载状态和错误处理
- [ ] 实现偏好记忆集成
- [ ] UI 细节打磨（动画、过渡、响应式）

### 7.4 Sprint 4（第 4 周）：测试发布

- [ ] 端到端测试
- [ ] 性能优化（生成速度、渲染速度）
- [ ] 打包发布（Windows/macOS 安装包）
- [ ] 文档更新

---

## 八、DesignNode 生成规范

DesignSeed Engine 在 v0.7 需要新增的能力：**在生成 HTML 的同时输出结构化的 DesignNode 树**。

### 8.1 当前状态

Engine 已经能生成完整的 HTML/CSS，但没有结构化的节点树。

### 8.2 需要新增

```javascript
// engine/renderer.js 新增方法
function renderWithNodes(prompt, options) {
  // 1. 生成 HTML（已有能力）
  const html = render(prompt, options);

  // 2. 解析 HTML 生成 DesignNode 树（新增）
  const tree = parseHtmlToDesignTree(html);

  // 3. 在 HTML 中注入 data-ds-id 属性（新增）
  const enhancedHtml = injectNodeIds(html, tree);

  return {
    tree,           // DesignNode 树
    html: enhancedHtml,  // 带 data-ds-id 的 HTML
    meta: { /* 页面元信息 */ }
  };
}
```

### 8.3 HTML 注入规范

每个可交互元素需要添加：
- `data-ds-type`：节点类型（section, component, text, button, image）
- `data-ds-id`：节点唯一 ID（ds-section-0, ds-text-1, ds-button-0）

```html
<!-- 注入前 -->
<section class="hero">
  <h1>标题</h1>
  <p>副标题</p>
  <button>开始使用</button>
</section>

<!-- 注入后 -->
<section class="hero" data-ds-type="section" data-ds-id="ds-section-0">
  <h1 data-ds-type="text" data-ds-id="ds-text-0">标题</h1>
  <p data-ds-type="text" data-ds-id="ds-text-1">副标题</p>
  <button data-ds-type="button" data-ds-id="ds-button-0">开始使用</button>
</section>
```

---

## 九、风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| iframe 沙箱限制 | 某些交互事件可能被阻止 | 使用 `allow-scripts` + postMessage 桥接 |
| DesignNode 解析不准确 | HTML → DesignNode 映射出错 | 生成时直接输出 DesignNode，不依赖反向解析 |
| Tauri 打包体积 | 安装包可能较大 | 使用 sidecar 按需加载 Node.js 运行时 |
| 生成速度慢 | 用户等待时间长 | 流式生成 + 乐观更新（先显示骨架屏） |
| iframe 性能 | 大页面渲染卡顿 | 限制页面复杂度，必要时分块渲染 |
