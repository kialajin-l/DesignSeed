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

## 版本规划

### v0.6 — AI 原型生成引擎（核心能力）

**目标**：强化 Skill 版的原型设计能力，从"静态 HTML 模板"升级到"AI 理解需求 → 生成可交互原型"。这是引擎层的升级，Skill 版和 NightShift 版共享。

**预计时间**：2026-05 下旬 ~ 2026-06 中旬（3 周）

**借鉴来源**：OpenPencil Agent Team 架构 + Google Stitch 生成逻辑

#### 功能矩阵

| 功能 | 说明 | 优先级 | 预估工时 |
|------|------|--------|---------|
| **需求解析器** | 自然语言 → 结构化设计意图（页面类型/组件/布局/风格） | P0 | 3d |
| **组件库** | 20+ 基础组件（导航/卡片/表单/列表/表格/图表/Hero/CTA...） | P0 | 4d |
| **布局引擎** | 栅格系统 + 响应式断点 + Flexbox 布局模板 | P0 | 3d |
| **AI 生成管道** | 需求 → 组件选择 → 布局组装 → 风格应用 → HTML 输出 | P0 | 4d |
| **Design.md 驱动** | 读取 design.md 文件，约束生成结果的风格一致性 | P0 | 2d |
| **流式输出** | JSONL 流式节点输出，支持实时预览（借鉴 OpenPencil） | P1 | 3d |
| **交互状态** | 页面内 Tab 切换 / 导航跳转 / 展开收起 / 表单交互 | P1 | 3d |
| **多页面项目** | 支持多页面原型（首页 → 详情 → 设置），页面间导航 | P1 | 2d |

**预估总工时**：~24d（约 3.5 周）

**里程碑**：
- M6a（第 1 周）：需求解析器 + 组件库完成，能从文本生成组件级页面
- M6b（第 2 周）：布局引擎 + AI 生成管道完成，端到端生成跑通
- M6c（第 3 周）：交互状态 + 多页面 + 流式输出完成

**验收标准**：
- 输入"生成一个 SaaS 定价页，暗色主题，科技感" → 输出完整可交互 HTML
- 生成结果自动应用 DesignSeed 风格引擎（可选 12 种风格或自定义 design.md）
- 页面内 Tab/导航可点击切换
- 生成时间 < 5 秒

---

### v0.7 — Cove 画布前端（GUI 接入）

**目标**：为 NightShift 版构建前端 GUI 框架，预留 Cove 画布接入接口，实现"AI 生成 + 实时预览 + 点击编辑"的完整体验。Skill 版不包含 GUI，仍通过 Agent 对话交互。

**预计时间**：2026-06 中旬 ~ 2026-07 上旬（3 周）

**核心原则**：前端页面做好布局和接口，Cove 画布的具体实现由 Cove 团队决定接入方式。Skill 版用户通过对话即可使用全部生成能力。

#### 前端架构

```
+-----------------------------------------------------------+
|                    DesignSeed GUI                          |
+----------+-------------------------------+----------------+
|  Sidebar |        Main Canvas            |   Properties   |
|          |                               |                |
| 风格选择  |     +------------------+      |  组件属性       |
| 组件面板  |     |   Cove Canvas    |      |  风格参数       |
| 页面列表  |     |   (预留接口)      |      |  design.md     |
| 历史记录  |     |                  |      |  反馈评分       |
|          |     +------------------+      |                |
+----------+-------------------------------+----------------+
|                    AI Chat Bar                            |
|  "帮我生成一个暗色主题的 Dashboard..."                      |
+-----------------------------------------------------------+
```

#### Cove 画布接入接口（预留）

```typescript
// Cove 画布标准接口 — 由 Cove 团队实现
interface CoveCanvas {
  render(nodes: DesignNode[]): void;
  updateNode(id: string, patch: Partial<DesignNode>): void;
  clear(): void;
  onNodeSelect(callback: (id: string) => void): void;
  onNodeMove(callback: (id: string, pos: Position) => void): void;
  onNodeResize(callback: (id: string, size: Size) => void): void;
  setTheme(theme: ThemeConfig): void;
  setZoom(level: number): void;
  exportPNG(): Promise<Blob>;
  exportSVG(): string;
}

interface DesignNode {
  id: string;
  type: 'frame' | 'text' | 'button' | 'card' | 'image' | 'input' | 'nav';
  name: string;
  x: number;
  y: number;
  width: number | 'fill';
  height: number | 'fit';
  style: NodeStyle;
  children?: DesignNode[];
  interactions?: Interaction[];
}

interface NodeStyle {
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  borderRadius?: number;
  padding?: Spacing;
}

interface Interaction {
  type: 'click' | 'hover' | 'scroll';
  action: 'navigate' | 'toggle' | 'expand' | 'submit';
  target?: string;
}
```

#### 功能矩阵

| 功能 | 说明 | 优先级 | 预估工时 |
|------|------|--------|---------|
| **GUI 框架** | Electron/Tauri 桌面应用壳（或 Web 应用） | P0 | 3d |
| **Cove 画布接口层** | 定义标准接口，预留 Cove 接入点 | P0 | 2d |
| **Sidebar — 风格选择** | 12 种内置风格 + 自定义 design.md 选择器 | P0 | 2d |
| **Sidebar — 组件面板** | 可拖拽组件列表（简化为点击添加） | P0 | 3d |
| **Sidebar — 页面列表** | 多页面管理（添加/删除/排序/嵌套） | P1 | 1d |
| **AI Chat Bar** | 底部对话框，输入需求 → AI 生成/修改设计 | P0 | 3d |
| **Properties Panel** | 右侧属性面板，选中组件后可修改样式/文本/交互 | P1 | 3d |
| **实时预览** | AI 生成结果实时渲染到 Cove 画布 | P0 | 3d |
| **点击编辑** | 鼠标直接点击组件 → 选中 → 拖拽移动/调整大小/修改属性 | P0 | 4d |
| **Undo/Redo** | 操作历史栈，支持撤销/重做 | P1 | 1d |
| **导出** | 导出 HTML / PNG / design.md | P1 | 2d |

**预估总工时**：~27d（约 4 周）

**里程碑**：
- M7a（第 1 周）：GUI 框架 + Cove 接口层 + AI Chat Bar 完成
- M7b（第 2 周）：Sidebar（风格 + 组件）+ 实时预览完成
- M7c（第 3 周）：点击编辑 + Properties Panel 完成
- M7d（第 4 周）：页面管理 + Undo/Redo + 导出 + 集成测试

**验收标准**：
- 启动 GUI → 底部输入"生成一个极简风格的 Landing Page" → Cove 画布实时渲染结果
- 点击画布上的组件 → 右侧显示属性面板 → 修改文字/颜色 → 画布实时更新
- 左侧选择不同风格 → 画布实时切换风格
- 导出为完整 HTML 文件，可独立运行

---

### v0.8 — 风格引擎强化 + 社区生态

**目标**：强化 DesignSeed 的核心差异化能力——风格化。让风格库通过爬虫和社区不断增长。

**预计时间**：2026-07 ~ 2026-08（4 周）

#### 功能矩阵

| 功能 | 说明 | 优先级 | 预估工时 |
|------|------|--------|---------|
| **风格爬虫增强** | 从 awesome-design-md 批量学习，自动提取风格特征 | P0 | 4d |
| **风格预览** | 每个风格生成预览缩略图，可视化选择 | P0 | 2d |
| **风格混合 GUI** | 在 GUI 中拖拽两种风格 → 实时预览混合效果 | P1 | 3d |
| **风格评分** | 用户对生成结果评分 → 好的风格权重上升 | P0 | 2d |
| **社区风格包** | 打包/分享/下载风格（design.md + 预览图 + 评分） | P1 | 4d |
| **风格推荐** | 根据用户历史偏好，自动推荐最适合的风格 | P1 | 3d |
| **品牌适配** | 输入品牌色/Logo → 自动调整风格适配品牌 | P2 | 3d |
| **响应式预览** | 一键切换 Desktop / Tablet / Mobile 预览 | P1 | 2d |

**预估总工时**：~23d（约 3.5 周）

---

### v1.0 — 独立产品 + NightShift 集成

**目标**：从 Skill 演进为独立产品，可被 NightShift 等系统调用。

**预计时间**：2026-08 ~ 2026-09（4 周）

| 功能 | 说明 | 优先级 |
|------|------|--------|
| **独立 CLI** | 脱离 GUI 独立运行，支持脚本化 | P0 |
| **MCP Server** | 标准 MCP 协议，支持 Claude/其他 Agent 调用 | P0 |
| **NightShift 主题 API** | NightShift 调用 DesignSeed 设置主题 | P0 |
| **Nexus 记忆联动** | 读取 Nexus 中的用户行为锚点，驱动设计推荐 | P0 |
| **RuleForge 规则联动** | 读取 RuleForge 中的美学规则，约束生成 | P1 |
| **设计知识包** | 打包 design.md + 风格预设 + 规则为可分享的知识包 | P0 |
| **增量同步** | 本地数据与 Nexus 服务器增量同步 | P1 |

---

### v2.0 — 创作者经济 + 社区生态

**目标**：风格包成为可交易的知识资产，形成创作者经济飞轮。

**预计时间**：2026-10+

#### 核心飞轮

```
设计师做项目 → 自然产出风格包 → 发布到社区 → 其他用户下载使用
     ↑                                              ↓
     +------------- 获得反馈/收入 <------------------+
```

#### 商业模型

| 层级 | 价格 | 包含 |
|------|------|------|
| **免费版** | 0 | 12 种基础风格 + 本地记忆 + 3 个自定义风格 |
| **创作者版** | 29/月 | 无限风格 + 社区发布 + 高级组件 + 风格混合 |
| **专业版** | 99/月 | AI 原型生成 + 跨端同步 + 团队协作 + API |
| **企业版** | 联系销售 | 私有化部署 + 品牌定制 + SLA |

---

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
