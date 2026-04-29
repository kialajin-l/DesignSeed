---
name: DesignSeed
description: "会生长的 AI 设计系统 — Agent-first HTML 设计引擎，12种内置风格 + 设计爬虫 + 嵌入式记忆 + 美学规则引擎"
version: "0.1.0"
author: "kialajin"
tags: ["design", "html", "css", "style", "crawler", "mcp"]
---

# DesignSeed — 会生长的 AI 设计系统

## 核心能力

1. **HTML 设计引擎** — 12 种内置风格，Prompt → HTML
2. **设计爬虫** — 从 GitHub/URL/本地文件学习设计系统
3. **嵌入式记忆** — SQLite 存储生成记录和用户偏好
4. **美学规则引擎** — WCAG 对比度、字号、色彩和谐等 7 条规则
5. **同步层** — 知识包导出/导入，跨设备共享

## 快速使用

### 生成页面

```bash
node engine/cli.js generate --prompt "你的页面描述" --style <风格名> --output page.html
```

可用风格：`minimalism` `neumorphism` `glassmorphism` `memphis` `cyberpunk` `ink_wash` `retro_pixel` `futurism` `organic` `industrial` `hand_drawn` `data_viz`

### 生成全部风格展示

```bash
node engine/cli.js demo --output demo.html
```

### 查看所有风格

```bash
node engine/cli.js list
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

预置源：`google-stitch` `ant-design` `material-design` `carbon` `apple-hig` `tailwind`

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

### 用户：帮我做一个科技感的落地页

1. `node engine/cli.js generate --prompt "AI 产品的落地页，突出技术实力" --style cyberpunk --output landing.html`
2. 浏览器打开 `landing.html` 预览
3. 如果用户说"太暗了，换个明亮的" → `--style glassmorphism` 重新生成

### 用户：学一下 Ant Design 的设计

1. `node crawler/cli.js crawl --source ant-design`
2. 爬虫提取色彩/排版/布局特征，存入 `memory/design-systems.json`
3. 后续生成可参考已学习的设计系统

### 用户：截图发我，我按这个风格来

1. 用户截图 → Agent 视觉分析 → 归纳风格特征
2. 找到最匹配的内置风格，或用爬虫学习该页面
3. 用匹配的风格重新生成
