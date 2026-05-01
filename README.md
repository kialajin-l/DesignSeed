# DesignSeed 🌱

> 🌱 This is a **Vibe Coding** project: Built with AI, for AI-augmented development.

![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version](https://img.shields.io/badge/Version-v0.2-blue.svg)
![Node](https://img.shields.io/badge/Node-%3E%3D18-green.svg)

**DesignSeed** 是一个会生长的 AI 设计系统——Agent-first 的 HTML 设计引擎，让 AI 助手拥有"审美"能力。

本项目灵感来源于 **Claude Design** 的极简美学和 **Huashu Design** 的结构化设计思路，将其扩展为完整的风格引擎、设计爬虫、嵌入式记忆和美学规则系统。它的核心价值是：**让 AI 生成的页面不再是千篇一律的白底黑字，而是有风格、有调性、有记忆的设计作品。**

---

## ✨ 核心功能

| 功能 | 说明 |
|------|------|
| 🎨 **12 种内置风格 + 混合引擎** | 极简、新拟态、玻璃拟态等 12 种风格，支持任意两种风格按比例混合生成全新风格 |
| 🏢 **15 个种子设计系统** | Stripe、Vercel、Apple、Linear、Notion、Figma、Spotify、Airbnb、GitHub、Slack、Netflix、Tesla、Claude、Supabase、Raycast |
| 🕷️ **设计爬虫** | 从 GitHub、公司设计系统、设计博客中学习优秀设计，提取色彩/排版/布局/调性特征 |
| 🧠 **嵌入式记忆** | 记录每次生成的 prompt、风格、用户修改，形成设计偏好档案（Nexus 最小版） |
| 🛡️ **美学规则引擎** | 7 条内置规则（对比度/字号/行宽/色彩/配色黑名单/间距/圆角），自动检查和修复 |
| 📦 **自包含 Skill** | 解压即用，无需外部服务，数据格式与 Nexus/RuleForge 完整版一致 |
| 🔄 **双向同步** | 导出为知识包，可导入到其他 Agent 或设备 |

---

## 🏗️ 架构概览

```
DesignSeed/
├── engine/              # 🎨 HTML 设计引擎
│   ├── cli.js           #   命令行入口
│   ├── renderer.js      #   Prompt → HTML 渲染器
│   ├── mixer.js         #   风格混合引擎（向量插值）
│   ├── seed-design-systems.js  # 15 个种子设计系统数据
│   ├── templates/       #   12 种风格定义（色彩/字体/间距/组件）
│   └── components/      #   UI 组件库（导航/卡片/表单/统计等）
├── crawler/             # 🕷️ 设计爬虫
│   ├── cli.js           #   命令行入口
│   ├── fetcher.js       #   多源采集（GitHub/URL/本地文件）
│   ├── parser.js        #   设计特征提取（色彩/排版/布局/调性）
│   └── sources.json     #   预置设计源（Google Stitch/Ant Design/Material 等）
├── memory/              # 🧠 嵌入式记忆（Nexus 最小版）
│   ├── cli.js           #   命令行入口
│   ├── store.js         #   SQLite 存储（生成记录/设计系统/用户偏好）
│   └── schema.sql       #   数据库 Schema
├── rules/               # 🛡️ 美学规则引擎（RuleForge 最小版）
│   ├── cli.js           #   命令行入口
│   ├── engine.js        #   规则检查器
│   └── defaults.json    #   7 条内置规则
├── sync/                # 🔄 同步层
│   ├── exporter.js      #   知识包导出（自动脱敏）
│   ├── importer.js      #   知识包导入（EMA 合并）
│   └── schema.json      #   知识包 JSON Schema
└── SKILL.md             # Agent 技能说明
```

---

## 🚀 快速开始

### 方式一：Agent Skill（推荐）

下载解压后，Agent 直接识别 `SKILL.md` 即可使用：

```bash
# 生成页面
node engine/cli.js generate --prompt "一个产品落地页" --style glassmorphism --output page.html

# 生成风格展示页（全部 12 种风格）
node engine/cli.js demo --output demo.html

# 查看所有风格
node engine/cli.js list
```

### 方式二：设计爬虫

```bash
# 从预置源学习设计
node crawler/cli.js crawl --source google-stitch

# 从任意 URL 学习
node crawler/cli.js learn --url "https://ant.design"

# 查看已学习的设计系统
node crawler/cli.js list
```

### 方式三：记忆与规则

```bash
# 查看生成统计
node memory/cli.js stats

# 查看用户偏好
node memory/cli.js prefs

# 检查生成的 HTML 是否符合美学规则
node rules/cli.js check --file page.html

# 查看所有规则
node rules/cli.js list
```

---

## 🎨 风格对照表

| 风格 ID | 名称 | 调性 | 适用场景 |
|---------|------|------|----------|
| `minimalism` | 极简 | 正式 · 清冷 · 低复杂度 | 企业官网、SaaS 产品 |
| `neumorphism` | 新拟态 | 柔和 · 现代 · 中复杂度 | 移动 App、仪表盘 |
| `glassmorphism` | 玻璃拟态 | 时尚 · 通透 · 中复杂度 | 活动页、创意展示 |
| `memphis` | 孟菲斯 | 活泼 · 复古 · 高复杂度 | 儿童品牌、创意营销 |
| `cyberpunk` | 赛博朋克 | 暗黑 · 科技 · 高复杂度 | 游戏、科技产品 |
| `ink_wash` | 水墨 | 东方 · 禅意 · 低复杂度 | 文化品牌、茶饮餐饮 |
| `retro_pixel` | 像素复古 | 怀旧 · 趣味 · 中复杂度 | 游戏社区、独立品牌 |
| `futurism` | 未来主义 | 科技 · 前卫 · 中复杂度 | AI 产品、科技公司 |
| `organic` | 有机 | 自然 · 温暖 · 低复杂度 | 环保品牌、健康产品 |
| `industrial` | 工业 | 硬朗 · 专业 · 中复杂度 | 制造业、B2B 平台 |
| `hand_drawn` | 手绘 | 亲切 · 随性 · 中复杂度 | 教育、个人博客 |
| `data_viz` | 数据可视化 | 精确 · 专业 · 高复杂度 | 数据平台、分析报告 |

每种风格包含四维调性向量：`formality`（正式度）、`warmth`（温暖度）、`complexity`（复杂度）、`innovation`（创新度），可用于风格混合和相似度计算。

---

## 🏢 种子设计系统

v0.2 预置了 15 个头部设计系统的特征数据，用于风格混合参考、质量评分基准和智能推荐训练：

| 设计系统 | 公司 | 主色调 | 调性标签 | 适用场景 |
|----------|------|--------|----------|----------|
| **Stripe** | Stripe | `#635BFF` | 专业 · 金融 · 开发者 | 支付、金融科技 |
| **Vercel** | Vercel | `#000000` | 极简 · 开发者 · 暗色 | 开发工具、云服务 |
| **Apple** | Apple | `#0071E3` | 高端 · 简约 · 精致 | 消费电子、高端产品 |
| **Linear** | Linear | `#5E6AD2` | 现代 · 高效 · 专业 | 项目管理、SaaS |
| **Notion** | Notion | `#000000` | 极简 · 灵活 · 知识 | 笔记、知识管理 |
| **Figma** | Figma | `#A259FF` | 创意 · 协作 · 设计 | 设计工具、创意平台 |
| **Spotify** | Spotify | `#1DB954` | 活泼 · 娱乐 · 社交 | 音乐、娱乐平台 |
| **Airbnb** | Airbnb | `#FF5A5F` | 温暖 · 旅行 · 社区 | 旅游、住宿平台 |
| **GitHub** | GitHub | `#24292E` | 专业 · 开发者 · 开源 | 代码托管、开发者社区 |
| **Slack** | Slack | `#4A154B` | 友好 · 协作 · 企业 | 企业通讯、团队协作 |
| **Netflix** | Netflix | `#E50914` | 娱乐 · 影视 · 暗色 | 视频平台、娱乐内容 |
| **Tesla** | Tesla | `#CC0000` | 科技 · 未来 · 高端 | 汽车、能源科技 |
| **Claude** | Anthropic | `#D97757` | 专业 · AI · 可靠 | AI 产品、企业服务 |
| **Supabase** | Supabase | `#3ECF8E` | 开发者 · 现代 · 开源 | 数据库、后端服务 |
| **Raycast** | Raycast | `#FF6363` | 效率 · 工具 · 极客 | 效率工具、开发者 |

### 使用种子设计系统

```bash
# 查看所有种子设计系统
node engine/cli.js seeds

# 基于种子系统生成页面
node engine/cli.js generate --prompt "一个 SaaS 落地页" --seed stripe --output page.html

# 混合两个种子系统
node engine/cli.js mix --style1 minimalism --style2 glassmorphism --ratio 0.7 --output mixed.html
```

---

## 🛡️ 美学规则引擎

内置 7 条美学规则，自动检查生成的设计：

| 规则 | 类型 | 说明 |
|------|------|------|
| `accessibility_contrast` | hard_limit | 文字对比度 ≥ 4.5:1（WCAG 2.1 AA） |
| `min_font_size` | hard_limit | 最小字号 ≥ 12px |
| `max_line_length` | soft_preference | 行宽 ≤ 80 字符 |
| `color_harmony` | hard_limit | 主色调不超过 7 种 |
| `ugly_combo_clash` | hard_limit | 红绿/橙蓝/黄紫等高饱和冲突配色拦截 |
| `spacing_consistency` | soft_preference | 间距值符合 4/8/12/16/24/32/48/64 比例尺 |
| `border_radius_consistency` | soft_preference | 圆角值符合 0/2/4/8/12/16/24 比例尺 |

---

## 🧠 嵌入式记忆

DesignSeed 记录每次设计交互，形成设计偏好档案（Nexus 最小版）：

**数据表：**

| 表 | 说明 |
|----|------|
| `design_systems` | 从外部学习的设计系统特征（色彩/排版/布局/调性） |
| `design_anchors` | 生成历史记录（prompt、风格、用户修改次数、反馈信号） |
| `user_preferences` | 用户风格偏好向量（EMA 学习） |
| `custom_rules` | 用户自定义美学规则 |

**反馈信号类型：**

| 信号 | 来源 | 说明 |
|------|------|------|
| `accept` | 用户直接确认 | "就这样"、"不错" |
| `reject` | 用户否定 | "太丑了"、"换一个" |
| `modify` | 用户修改 | 修改了颜色/字体/布局等参数 |
| `reuse` | 重复使用 | 同一风格被多次使用 |

---

## 🔄 同步与知识包

```bash
# 导出知识包（自动脱敏）
node sync/cli.js export --output designseed-pack.json

# 导入知识包（EMA 合并）
node sync/cli.js import --file designseed-pack.json

# 查看统计
node sync/cli.js stats
```

知识包格式与 Nexus 服务器端完全兼容，v1.0 对接时零迁移成本。

---

## 📖 使用场景

**场景 1：快速生成设计稿**

> "帮我做一个 SaaS 产品的落地页" → 选择 `minimalism` 风格 → 生成完整 HTML → 浏览器打开预览

**场景 2：风格迁移**

> "这个页面太单调了，给我看看赛博朋克风格的" → 用 `cyberpunk` 风格重新生成

**场景 3：设计系统学习**

> "帮我学一下 Ant Design 的设计规范" → 爬虫抓取 → 提取色彩/排版/布局特征 → 存入记忆 → 后续生成可引用

**场景 4：团队共享**

> 导出知识包 → 发给团队成员 → 导入 → 团队 AI Agent 共享同一套设计偏好

**场景 5：风格混合**

> "我想要一个介于极简和玻璃拟态之间的风格" → 用 `mixer.js` 按 0.7:0.3 比例混合 → 生成全新风格

---

## 🗺️ Roadmap

详见 [ROADMAP.md](./docs/ROADMAP.md)

### v0.1 ✅

- [x] HTML 设计引擎：12 种风格，Prompt → HTML
- [x] 设计爬虫：多源采集，特征提取
- [x] 嵌入式记忆：SQLite 存储，EMA 偏好学习
- [x] 美学规则引擎：7 条内置规则
- [x] 同步层：知识包导出/导入
- [x] CLI 工具：完整的命令行接口

### v0.2 — 风格混合 + 知识积累 ✅（2026-05-01）

- [x] 向量空间风格插值（两种风格按比例混合）
- [x] 15 个头部设计系统种子数据（Stripe/Vercel/Apple/Linear/Notion/Figma/Spotify/Airbnb/GitHub/Slack/Netflix/Tesla/Claude/Supabase/Raycast）
- [x] 自动修复（hard_limit 违反时自动调整）
- [x] 用户自定义风格预设（保存/加载/删除）
- [x] 风格相似度计算（基于调性向量余弦相似度）

### v0.3 — 智能增强（2026-06）

- [ ] LLM 辅助调性分析（替代关键词匹配）
- [ ] 基于内容的自动风格推荐
- [ ] 设计质量评分模型
- [ ] 批量采集外部设计系统（awesome-design-md 等）

### v1.0 — 服务器对接 + 跨端同步（2026-07）

- [ ] Nexus 服务器对接，跨设备设计知识共享
- [ ] 服务器端反馈聚合，模型层面进化

---

## 🤝 贡献

```bash
git clone https://github.com/kialajin-l/DesignSeed.git
cd DesignSeed
npm install
```

---

## 📄 许可证

MIT License

## 🙏 致谢

- [Claude Design](https://claude.ai) — 极简美学的灵感来源
- [Huashu Design](https://huashu.design) — 结构化设计思路的启发
- [Xiaomi miclaw](https://github.com/XiaomiMiClaw) — AI 助手平台
- [Model Context Protocol](https://modelcontextprotocol.io/) — AI Agent 标准化工具协议
- [Ant Design](https://ant.design) — 企业级设计系统参考
- [Material Design](https://m3.material.io) — Google 设计语言参考

---

## 🌟 Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=kialajin-l/DesignSeed&type=Date)](https://star-history.com/#kialajin-l/DesignSeed&Date)
