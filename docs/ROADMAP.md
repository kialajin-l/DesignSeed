# DesignSeed 路线图 v3

> 最后更新：2026-05-14
> 版本：v3.0 重写
> 核心变化：从"Agent 设计引擎"升级为"AI 风格化原型设计工具"

---

## 定位演进

```
v0.1-v0.2  Skill（嵌入 Agent 的设计能力）
    ↓
v0.6-v0.8  GUI 工具（AI 驱动的风格化原型设计 + Cove 画布）
    ↓
v1.0       独立产品（可被 NightShift/其他系统调用的独立服务）
    ↓
v2.0       平台（创作者经济 + 社区风格生态）
```

**核心判断**：OpenPencil 验证了"AI 驱动原型设计"的市场需求（4.6K Star），但他们的护城河是"工具深度"（对标 Figma），我们的护城河是"审美广度"（爬虫 + 多风格 + 社区 + 进化）。

**两种形态**：
- **开源 Skill 版**：通过 Agent 对话使用（截图、描述），能生成原型，但没有 GUI 和直接交互。能力完整，体验朴素。
- **NightShift 版**：DesignSeed 作为核心设计模块，整合 Cove 画布（GUI + 直接交互）和 FrameTale（视频生成），享受最完整的体验。

---

## 竞品定位

| | Figma | OpenPencil | Stitch (Google) | **DesignSeed** |
|---|---|---|---|---|
| **定位** | 专业矢量编辑器 | 开源 AI 设计编辑器 | AI 快速原型 | **AI 风格化原型** |
| **护城河** | 生态 + 协作 | Agent Team + MCP | Google 前端生态 | **风格引擎 + 进化** |
| **交互** | 专业工具逻辑 | 专业 + AI 辅助 | 文本生成 | **点击 + AI 混合** |
| **风格** | 用户自定义 | 用户自定义 | Google Material | **12 种 + 混合 + 社区** |
| **记忆** | 无 | 无 | 无 | **有（越用越懂你）** |
| **进化** | 无 | 无 | 无 | **有（风格库自增长）** |

**一句话**：OpenPencil 是"专业设计师的 AI 工具"，DesignSeed Skill 是"通过对话让任何人都能做出独特设计"，DesignSeed + NightShift 是"最舒服的 AI 设计体验"。

---

## 当前状态

### 已完成（v0.1-v0.5）

| 能力 | 版本 | 状态 |
|------|------|------|
| HTML 设计引擎（12 种风格 + 调性向量） | v0.1 | 完成 |
| 风格混合引擎（向量空间插值） | v0.2 | 完成 |
| 15 个种子设计系统 | v0.2 | 完成 |
| 设计爬虫（URL/文件/预置源） | v0.2 | 完成 |
| 嵌入式记忆（Nexus 最小版） | v0.2 | 完成 |
| 嵌入式规则（RuleForge 最小版） | v0.2 | 完成 |
| 三通道反馈收集 | v0.5 | 完成 |
| 用户偏好档案（6 维度画像） | v0.5 | 完成 |
| 规则自适应调整 | v0.5 | 完成 |
| 跨系统风格混合 | v0.5 | 完成 |
| 批量学习管道 | v0.5 | 完成 |

---

## 版本规划（对齐 NightShift 2.0）

> DesignSeed 是独立项目，NightShift 通过 adapter 接入。版本节奏各自独立，接口交付对齐。

### 版本对照总览

```
时间线
──────────────────────────────────────────────────────────────→

DesignSeed v0.6        v0.7              v0.7.1           v0.8
  引擎层              独立GUI+adapter     引擎增强          风格深化
  ┌──────────┐    ┌──────────────┐    ┌──────────┐    ┌──────────┐
  │DesignTree│    │Tauri GUI     │    │多页面     │    │风格混合GUI│
  │组件库    │    │Chat Panel    │    │流式输出   │    │Nexus联动  │
  │布局引擎  │    │Cove Canvas   │    │Design.md  │    │RuleForge  │
  │AI管道    │    │点击选择      │    │API冻结    │    │拖拽编辑   │
  │协议v1.2  │    │NightShift    │    │           │    │代码导出   │
  │          │    │adapter       │    │           │    │           │
  └──────────┘    └──────────────┘    └──────────┘    └──────────┘
       │               │                   │               │
       ▼               ▼                   ▼               ▼
  NightShift:      NightShift:         NightShift:      NightShift:
  Phase A-B        Phase C-D           MVP后迭代        v0.5+
  (无依赖)         (adapter接入)       (深度集成)       (完整体验)
```

### v0.6 — 引擎层（现在 → NightShift Phase C 开始前）

**目标**：AI 原型生成引擎稳定可用，输出格式符合 COVE-CANVAS-PROTOCOL

NightShift 在 Phase C 开始做外部系统接入，DesignSeed 必须在此之前提供稳定的引擎接口。

| 交付物 | 说明 | NightShift 用途 |
|--------|------|----------------|
| DesignTree 数据结构 | 结构化设计树，UUID 节点 ID | Cove 画布渲染目标 |
| 需求解析器 | 自然语言 → 结构化设计意图 | 调度 Agent 调用 |
| 组件库（20+） | 基础 UI 组件定义 | 画布渲染 |
| 布局引擎 | 栅格 + 响应式 | 画布渲染 |
| AI 生成管道 | 需求 → DesignTree → HTML | 前端 Agent 调用 |
| COVE-CANVAS-PROTOCOL v1.2 | 接口契约（已完成） | 双方联调基线 |
| `renderWithNodes()` | HTML + DesignNode 双输出 | NightShift adapter 对接 |

**关键约束**：
- 引擎层不依赖 GUI，Skill 版独立可用
- 输出格式必须同时支持 DesignTree（结构化）和 HTML（渲染）
- 接口遵循 COVE-CANVAS-PROTOCOL v1.2
- 生成时间 < 5 秒

**不做什么**：不做 GUI 框架、不做多页面、不做流式输出

---

### v0.7 — 独立 GUI + NightShift adapter（NightShift Phase C-D 期间）

**目标**：DesignSeed 作为独立 GUI 应用可用，同时提供 NightShift adapter

与 NightShift Phase C-D 并行开发。DesignSeed 做自己的 GUI，NightShift 做自己的 adapter 接入。

**DesignSeed 侧交付（独立 GUI）**：

| 交付物 | 说明 |
|--------|------|
| Tauri 桌面壳 | 独立应用，不依赖 NightShift |
| 对话面板 | AI Chat Bar，底部输入 |
| Cove Canvas Host | iframe 渲染 + postMessage 桥接 |
| 点击选择 | 鼠标选中组件 → 高亮 |
| 风格选择器 | 12 种风格切换 |
| 实时预览 | AI 生成 → 画布渲染 |
| 对话驱动修改 | 选中 + 输入 → 更新节点 |

**NightShift 侧交付（adapter）**：

| 交付物 | 说明 |
|--------|------|
| `packages/integrations/designseed` | adapter 定义 |
| `generatePreview` 请求结构 | 对应 COVE-CANVAS-PROTOCOL |
| `prototype-preview` workspace object | 工作区预览对象 |
| Feature flag | `designseed.enabled = false`（默认关闭） |

**联调节点**：NightShift Phase D 第一步，验证"用户触发 → DesignSeed 生成 → Cove 画布预览"

**不做什么**：不做拖拽移动（v0.8）、不做属性面板（v0.8）、不做多页面（v0.7.1）、不做代码导出（v0.8）

---

### v0.7.1 — 引擎增强（NightShift MVP 结项后）

**目标**：引擎层增强，为深度集成做准备

| 交付物 | 说明 | 对应 NightShift |
|--------|------|-----------------|
| 多页面项目支持 | 首页→详情→设置，页面间导航 | 多页面 workspace object |
| 流式输出 | JSONL 节点流，实时预览 | 响应式交互体验 |
| Design.md 驱动 | 品牌一致性约束 | 规则注入位 |
| 交互状态 | Tab 切换/导航跳转/表单交互 | 组件交互增强 |
| 引擎 API 冻结 | 接口不再 breaking change | adapter 稳定 |

**关键约束**：v0.7.1 是引擎层更新，GUI 不变。从此时起 COVE-CANVAS-PROTOCOL 不再有 breaking change。

---

### v0.8 — 风格引擎深化 + 完整集成（NightShift v0.5 后）

**目标**：风格引擎强化 + NightShift 深度集成

| 交付物 | 说明 |
|--------|------|
| 风格爬虫增强 | awesome-design-md 批量学习 |
| 风格评分 | 用户反馈 → 风格权重调整 |
| 风格混合 GUI | 拖拽两种风格 → 实时预览 |
| Nexus 记忆联动 | 读取用户行为锚点 → 风格推荐 |
| RuleForge 规则联动 | 读取美学规则 → 约束生成 |
| 响应式预览 | Desktop/Tablet/Mobile 一键切换 |
| 拖拽编辑 | 组件拖拽移动 + 调整大小 |
| 属性面板 | 右侧属性编辑 |
| 代码导出 | DesignTree → HTML/React/Vue |

---

### 接口冻结时间线

```
v0.6 完成时        COVE-CANVAS-PROTOCOL v1.2 定稿
                   ↓
v0.7 开始时        adapter schema 定稿（generatePreview / updateNode / switchStyle）
                   ↓
v0.7.1 完成时      所有接口冻结，不再 breaking change
                   ↓
v0.8+              只增不改，新字段一律可选
```

---

### 与 NightShift 各系统的接口边界

| NightShift 系统 | DesignSeed 交互方式 | 边界 |
|----------------|-------------------|------|
| **System 5 Provider** | DesignSeed 引擎内部调用 LLM | NightShift 不管，DesignSeed 自己处理 |
| **System 6 Synapse** | Synapse 可调度 DesignSeed 生成任务 | DesignSeed 是被调用方，不参与编排 |
| **System 7 Nexus** | DesignSeed 读取用户偏好锚点 | 单向读取，DesignSeed 不写入 Nexus |
| **System 8 DesignSeed** | adapter 调用 + 预览展示 | NightShift 只做"调用 + 预览 + 挂接" |
| **System 9 RuleForge** | DesignSeed 读取美学规则 | 单向读取，feature flag 控制 |

---

### NightShift MVP 验收时 DesignSeed 需满足

1. ✅ Engine 可通过 adapter 被调用（stdio / MCP）
2. ✅ 返回 DesignTree + HTML 符合 COVE-CANVAS-PROTOCOL v1.2
3. ✅ NightShift 可展示 `prototype-preview` 工作区对象
4. ✅ 失败时不影响 NightShift 主链路
5. ✅ 独立 GUI 应用可独立运行（不依赖 NightShift）

---

### 商业化路径

| 阶段 | 时间 | 目标 |
|------|------|------|
| **开源** | 现在 | Skill 版 + 引擎开源，建立社区 |
| **专业版** | 99/月 | AI 原型生成 + 风格同步 + 团队协作 + API |
| **企业版** | 按需定制 | 私有化部署 + 品牌定制 + SLA |

## 里程碑总览

| 里程碑 | 版本 | 目标 | 预计时间 | 状态 |
|--------|------|------|---------|------|
| M1 | v0.1 | MVP 可用，12 种风格生成 | 2026-04 | 完成 |
| M2 | v0.2 | 风格混合 + 15 个种子设计系统 | 2026-05 | 完成 |
| M5 | v0.5 | 反馈闭环 + 规则自适应 | 2026-05 | 完成 |
| M6 | v0.6 | AI 原型生成引擎 | 2026-05~06 | 规划中 |
| M7 | v0.7 | Cove 画布前端 + GUI | 2026-06~07 | 规划中 |
| M8 | v0.8 | 风格引擎强化 + 社区 | 2026-07~08 | 规划中 |
| M9 | v1.0 | 独立产品 + NightShift 集成 | 2026-08~09 | 规划中 |
| M10 | v2.0 | 创作者经济 + 社区生态 | 2026-10+ | 远期 |

---

## 文件结构规划（v0.6-v0.7 新增）

```
DesignSeed/
+-- engine/              # 设计生成引擎（已有）
+-- crawler/             # 设计爬虫（已有）
+-- memory/              # 嵌入式记忆（已有）
+-- rules/               # 美学规则引擎（已有）
+-- sync/                # 同步层（已有）
+-- designmd/            # Design.md 格式处理（已有）
|
+-- prototype/           # [新] AI 原型生成引擎（v0.6）
|   +-- index.js         #   原型生成入口
|   +-- parser.js        #   需求解析器（自然语言 → 设计意图）
|   +-- components.js    #   组件库（20+ 基础组件）
|   +-- layouts.js       #   布局引擎（栅格 + 响应式）
|   +-- assembler.js     #   组件组装器（组件 → 页面）
|   +-- stream.js        #   流式输出（JSONL 节点流）
|
+-- gui/                 # [新] 前端 GUI（v0.7）
|   +-- index.html       #   主页面
|   +-- app.js           #   应用入口
|   +-- canvas/          #   Cove 画布接口层
|   |   +-- cove-adapter.js      # Cove 标准适配器
|   |   +-- fallback-renderer.js # 降级渲染器（Cove 未接入时）
|   |   +-- node-mapper.js       # DesignNode <-> Cove 节点映射
|   +-- sidebar/         #   左侧面板
|   |   +-- style-picker.js      # 风格选择器
|   |   +-- component-panel.js   # 组件面板
|   |   +-- page-list.js         # 页面列表
|   |   +-- history.js           # 历史记录
|   +-- properties/      #   右侧属性面板
|   |   +-- property-panel.js    # 属性面板主入口
|   |   +-- style-editor.js      # 样式编辑器
|   |   +-- interaction-editor.js # 交互编辑器
|   +-- chat/            #   AI 对话栏
|   |   +-- chat-bar.js          # 对话框 UI
|   |   +-- chat-handler.js      # 对话逻辑处理
|   +-- shared/          #   共享工具
|       +-- history-stack.js     # Undo/Redo
|       +-- export.js            # 导出（HTML/PNG/design.md）
|       +-- theme.js             # GUI 自身主题
|
+-- community/           # [新] 社区功能（v0.8）
|   +-- pack.js          #   风格包打包
|   +-- registry.js      #   风格包注册表
|   +-- recommend.js     #   风格推荐引擎
|
+-- SKILL.md             # Agent 技能说明
+-- package.json
```

---

## 与其他系统的协同

### DesignSeed x Cove 画布

```
DesignSeed GUI
    | 用户输入需求
AI 原型引擎生成 DesignNode[]
    | 通过标准接口
Cove Canvas 渲染
    | 用户点击编辑
Cove 回调 -> DesignSeed 更新节点 -> Cove 重新渲染
```

### DesignSeed x NightShift

```
NightShift 调用 -> DesignSeed MCP Server -> 生成设计 -> 返回 HTML
        |
    用户行为数据 -> DesignSeed 记忆 -> 自动优化下次生成
```

### DesignSeed x Nexus

```
Nexus 用户行为锚点 -> DesignSeed 读取 -> 驱动风格推荐
        |
    DesignSeed 设计偏好 -> 上传到 Nexus -> 跨设备同步
```

### DesignSeed x RuleForge

```
RuleForge 美学规则 -> DesignSeed 读取 -> 约束原型生成
        |
    DesignSeed 生成反馈 -> RuleForge 记录 -> 规则权重调整
```

---

## 设计原则（持续遵循）

1. **风格化优先**：我们不做"最专业"的编辑器，做"最好看"的生成器
2. **点击优先**：交互门槛要低，鼠标点击为主，复杂操作由 AI 完成
3. **接口预留**：Cove 画布接入点标准化，Cove 团队可独立实现
4. **本地优先**：所有数据默认存储在本地，零外部依赖
5. **进化驱动**：爬虫 + 社区 + 反馈 = 风格库自增长
6. **渐进增强**：MVP 只做核心功能，架构上为未来扩展留好接口
