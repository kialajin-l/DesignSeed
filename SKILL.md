---
name: DesignSeed
description: "会生长的 AI 设计系统 — Agent-first HTML 设计引擎，12种内置风格 + 设计爬虫 + 嵌入式记忆 + 美学规则引擎 + DesignTree + COVE 协议"
version: "0.6.6"
author: "kialajin"
tags: ["design", "html", "css", "style", "crawler", "mcp", "cove", "designtree"]
---

# DesignSeed — 会生长的 AI 设计系统

## 核心能力

1. **HTML 设计引擎** — 12 种内置风格 + 6 种风格引擎，Prompt → HTML
2. **DesignTree 引擎** — 结构化设计产出（DesignNode → DesignTree → DesignProject）
3. **COVE 协议** — 11 个标准化接口：generatePreview / generateTree / getNodeById / updateNode / insertNode / deleteNode / listNodes / exportTree / importTree / generateFragment / listStyles
4. **设计爬虫** — 从 GitHub/URL/本地文件学习设计系统
5. **嵌入式记忆** — SQLite 存储生成记录和用户偏好
6. **美学规则引擎** — WCAG 对比度、字号、色彩和谐等 7 条规则
7. **同步层** — 知识包导出/导入，跨设备共享

## 快速使用

### 一句话生成页面

```bash
node engine/cli.js generate --prompt "你的页面描述" --style <风格名> --output page.html
```

可用风格：`minimalism` `neumorphism` `glassmorphism` `memphis` `cyberpunk` `ink_wash` `retro_pixel` `futurism` `organic` `industrial` `hand_drawn` `data_viz`

### 端到端 Demo

```bash
node engine/cli.js demo --output demo.html
```

### 查看所有风格

```bash
node engine/cli.js list
```

### DesignTree 生成（v0.6）

```javascript
const { parseIntent } = require('./engine/intent-parser');
const { generateTree } = require('./engine/component-library');
const { renderWithNodes } = require('./engine/tree-renderer');
const { applyResponsiveLayout } = require('./engine/layout-engine');

// 1. 解析意图
const intent = parseIntent('做一个 SaaS 定价页面，现代风格');

// 2. 生成 DesignTree
const tree = generateTree(intent);

// 3. 渲染 HTML（双输出：DesignNode + HTML）
const result = renderWithNodes(tree, { style: 'minimalism' });

// 4. 应用响应式布局
const html = applyResponsiveLayout(result.html, result.nodes);
```

### COVE 协议接口（v0.6.6）

```javascript
const cove = require('./engine/cove-protocol');

// 查看协议信息
const info = cove.getProtocolInfo();
// → { protocol: 'COVE-CANVAS-PROTOCOL', protocolVersion: '1.2', engineVersion: '0.6.6', capabilities: [...] }

// 生成预览（prompt → HTML + DesignTree）
const result = cove.generatePreview({ prompt: '做一个 Dashboard 页面', style: 'cyberpunk' });
// result: { success: true, data: { html, tree, meta } }

// 生成 DesignTree（不含 HTML）
const treeResult = cove.generateTree({ prompt: '做一个定价页面', style: 'minimalism' });
// treeResult: { success: true, data: { tree, intent } }

// 列出可用风格
const styles = cove.listStyles();
// styles: { success: true, data: { styles: [{ id, name, nameEn, tone }] } }

// 获取/更新/插入/删除节点
const node = cove.getNodeById({ tree: treeResult.data.tree, nodeId: 'ds-xxx' });
cove.updateNode({ tree, nodeId: 'ds-xxx', updates: { text: 'New Title' } });
cove.insertNode({ tree, parentId: 'ds-xxx', node: { type: 'text', text: 'Hello' } });
cove.deleteNode({ tree, nodeId: 'ds-xxx' });

// 列出所有节点
const nodes = cove.listNodes({ tree });

// 导出/导入 DesignTree
const exported = cove.exportTree({ tree });
const imported = cove.importTree({ json: exported.data });

// 生成 HTML 片段（不含全局样式）
const fragment = cove.generateFragment({ tree, nodeId: 'ds-xxx' });
```

## 设计爬虫

```bash
# 从预置源学习
node crawler/cli.js crawl --source google-stitch

# 从 URL 学习
node crawler/cli.js learn --url "https://stripe.com"

# 从本地文件学习
node crawler/cli.js learn --file ./design-spec.md

# 查看已学习的设计系统
node crawler/cli.js list
```

## 美学规则

```bash
# 检查 HTML
node rules/cli.js check --file page.html

# 查看规则
node rules/cli.js list
```

## 记忆

```bash
node memory/cli.js stats
node memory/cli.js prefs
node memory/cli.js designs
```

## 同步

```bash
# 导出知识包
node sync/cli.js export --output pack.json

# 导入知识包
node sync/cli.js import --file pack.json
```

## MCP Server

```json
{
  "mcpServers": {
    "designseed": {
      "command": "node",
      "args": ["<path-to>/DesignSeed/mcp-server.js"]
    }
  }
}
```

## 工作流示例

### 场景 1：快速生成 App 原型

> 用户："帮我做一个任务管理 App 的界面"

1. 解析意图 → Dashboard 布局
2. 生成 DesignTree → 导航栏 + 侧边栏 + 统计卡片 + 任务列表
3. 渲染 HTML → cyberpunk 风格
4. 应用响应式 → 768px/480px 断点
5. 输出完整可交互 HTML

### 场景 2：风格混合

> 用户："用 Stripe 的风格做一个定价页面，但颜色换成绿色系"

1. 加载 Stripe 设计系统种子数据
2. 调整主色调为绿色系
3. 生成 DesignTree → Hero + 定价卡片 + FAQ
4. 渲染 HTML → Stripe 风格 + 绿色

### 场景 3：设计评审

> 用户："帮我检查一下这个页面的设计质量"

1. 解析 HTML → 提取设计特征
2. 专家评审 → 5 维度评分
3. 反 AI Slop 检查 → 10 项规则
4. 输出评分 + 修复清单

### 场景 4：反馈闭环

> 用户修改了生成的页面

1. 记录修改 → 嵌入式记忆
2. 更新偏好档案 → 6 维度画像
3. 规则自适应 → 权重调整
4. 下次生成 → 自动优化

## 文件结构

```
DesignSeed/
├── engine/              # 🎨 HTML 设计引擎
│   ├── cli.js           #   命令行入口
│   ├── renderer.js      #   Prompt → HTML 渲染器
│   ├── tree-renderer.js #   🌳 DesignNode → HTML 渲染器（v0.6）
│   ├── mixer.js         #   风格混合引擎
│   ├── seed-design-systems.js  # 15 个种子设计系统
│   ├── device-frames.js #   📱 设备框架
│   ├── layouts.js       #   🖥️ 复杂 UI 布局
│   ├── interactions.js  #   ⚡ 交互状态
│   ├── image-sourcing.js#   🖼️ 真实图片
│   ├── brand-protocol.js#   🏷️ 品牌资产协议
│   ├── design-philosophy.js # 💡 设计方向顾问
│   ├── expert-review.js #   🔍 专家评审引擎
│   ├── anti-ai-slop.js  #   🚫 反 AI Slop
│   ├── intent-parser.js #   🧠 意图解析器（v0.6）
│   ├── component-library.js # 🧩 组件模板库（v0.6, 20+组件）
│   ├── layout-engine.js #   📐 响应式布局引擎（v0.6）
│   ├── style-engine.js  #   🎨 风格引擎（v0.6, 6种风格）
│   ├── cove-protocol.js #   🔌 COVE 协议（v0.6, 10接口）
│   ├── templates/       #   12 种风格定义
│   └── components/      #   基础 UI 组件库
├── crawler/             # 🕷️ 设计爬虫
├── memory/              # 🧠 嵌入式记忆
├── rules/               # 🛡️ 美学规则引擎
├── sync/                # 🔄 同步层
└── SKILL.md             # 本文件
```
