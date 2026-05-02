# DesignSeed 🌱

> 🌱 This is a **Vibe Coding** project: Built with AI, for AI-augmented development.

![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version](https://img.shields.io/badge/Version-v0.3-blue.svg)
![Node](https://img.shields.io/badge/Node-%3E%3D18-green.svg)

**DesignSeed** 是一个会生长的 AI 设计系统——Agent-first 的 HTML 设计引擎，让 AI 助手拥有"审美"能力。

它的核心价值是：**让 AI 生成的页面不再是千篇一律的白底黑字，而是有风格、有调性、有记忆的设计作品。**

---

## ✨ 核心功能

### 基础能力

| 功能 | 说明 |
|------|------|
| 🎨 **12 种内置风格 + 混合引擎** | 极简、新拟态、玻璃拟态等 12 种风格，支持任意两种风格按比例混合生成全新风格 |
| 🏢 **15 个种子设计系统** | Stripe、Vercel、Apple、Linear、Notion、Figma、Spotify、Airbnb、GitHub、Slack、Netflix、Tesla、Claude、Supabase、Raycast |
| 🕷️ **设计爬虫** | 从 GitHub、公司设计系统、设计博客中学习优秀设计，提取色彩/排版/布局/调性特征 |
| 🧠 **嵌入式记忆** | 记录每次生成的 prompt、风格、用户修改，形成设计偏好档案 |
| 🛡️ **美学规则引擎** | 7 条内置规则（对比度/字号/行宽/色彩/配色黑名单/间距/圆角），自动检查和修复 |
| 📦 **自包含 Skill** | 解压即用，无需外部服务 |
| 🔄 **双向同步** | 导出为知识包，可导入到其他 Agent 或设备 |

### v0.3 新增能力

| 功能 | 说明 |
|------|------|
| 📱 **设备框架** | iOS（iPhone 16 Pro/SE/iPad）+ Android（Pixel 9 Pro/Samsung S24/Xiaomi 15）精确像素级设备外壳 |
| 🖥️ **复杂 UI 布局** | Dashboard / Editor / Workshop / Settings / List / Detail 六种专业布局模式 |
| ⚡ **交互状态管理** | Tab 切换 / 折叠面板 / Modal 弹窗 / Toast 通知 / Dropdown 下拉菜单（纯 CSS 实现） |
| 🖼️ **真实图片 Sourcing** | Wikimedia Commons + Unsplash API，根据语义自动获取真实图片，告别 placeholder |
| 🏷️ **品牌资产协议** | Logo / 产品图 / UI 截图 5 步硬流程，非官方物料自动标注 |
| 💡 **设计方向顾问** | 20+ 种设计哲学（Pentagram/Field.io/Kenya Hara/Sagmeister 等），需求模糊时引导方向 |
| 🔍 **专家评审引擎** | 5 维度评分（哲学一致性/视觉层级/细节执行/功能性/创新性）+ 修复清单 |
| 🚫 **反 AI Slop** | 10 项检查规则，防止生成"AI 味"过重的设计（渐变/emoji/彩虹边框/毛玻璃滥用等） |

---

## 🏗️ 架构概览

```
DesignSeed/
├── engine/              # 🎨 HTML 设计引擎
│   ├── cli.js           #   命令行入口
│   ├── renderer.js      #   Prompt → HTML 渲染器
│   ├── mixer.js         #   风格混合引擎（向量插值）
│   ├── seed-design-systems.js  # 15 个种子设计系统数据
│   ├── device-frames.js #   📱 设备框架（iOS/Android/Tablet）
│   ├── layouts.js       #   🖥️ 复杂 UI 布局（6种模式）
│   ├── interactions.js  #   ⚡ 交互状态（Tab/Modal/Accordion）
│   ├── image-sourcing.js#   🖼️ 真实图片（Wikimedia/Unsplash）
│   ├── brand-protocol.js#   🏷️ 品牌资产协议
│   ├── design-philosophy.js # 💡 设计方向顾问（20+哲学）
│   ├── expert-review.js #   🔍 专家评审引擎
│   ├── anti-ai-slop.js  #   🚫 反 AI Slop 检查
│   ├── templates/       #   12 种风格定义
│   └── components/      #   基础 UI 组件库
├── crawler/             # 🕷️ 设计爬虫
├── memory/              # 🧠 嵌入式记忆
├── rules/               # 🛡️ 美学规则引擎
├── sync/                # 🔄 同步层
└── SKILL.md             # Agent 技能说明
```

---

## 🚀 快速开始

DesignSeed 是一个 AI 技能（Skill），安装后直接在对话中使用。你不需要输入任何命令，**用自然语言告诉 AI 你想要什么就行**。

### 生成 App 原型

> "帮我做一个任务管理 App 的界面，用 iPhone 16 Pro 的设备框架展示"

> "生成一个数据分析仪表盘，要有侧边栏和统计卡片"

> "做一个设置页面，左边是分类导航，右边是表单"

### 设计方向探索

> "我想做一个面向开发者的 SaaS 产品，帮我推荐一个设计方向"

> "我想要一个既有科技感又温暖的设计风格，有什么建议？"

### 风格混合

> "帮我做一个落地页，风格介于极简和玻璃拟态之间"

> "用 Stripe 的风格做一个定价页面，但颜色换成绿色系"

### 真实图片

> "帮我做一个团队介绍页面，要真实的办公场景图片"

> "生成一个产品展示页，用真实的手机照片而不是 placeholder"

### 设计评审

> "帮我检查一下这个页面的设计质量"

> "这个页面有没有 AI 味太重的问题？"

### 品牌展示

> "帮我做一个 Apple 风格的产品对比页，要用真实的 Logo 和产品图"

---

## 📱 设备框架

v0.3 提供精确像素级的设备外壳：

| 平台 | 型号 | 尺寸 | 特性 |
|------|------|------|------|
| **iOS** | iPhone 16 Pro | 393×852 | Dynamic Island, Home Indicator |
| **iOS** | iPhone 16 | 393×852 | Dynamic Island, Home Indicator |
| **iOS** | iPhone SE | 375×667 | 经典边框, Home Button |
| **iOS** | iPad Pro | 1024×768 | 窄边框, Home Indicator |
| **Android** | Pixel 9 Pro | 412×915 | Pill 打孔, 导航栏 |
| **Android** | Samsung S24 | 360×780 | 圆形打孔, 导航栏 |
| **Android** | Xiaomi 15 | 400×880 | 圆形打孔, 导航栏 |

---

## 🖥️ 复杂 UI 布局

| 布局 | 说明 | 适用场景 |
|------|------|----------|
| **Dashboard** | 侧边栏 + 统计卡片 + 最近项目 | 管理后台、数据分析 |
| **Editor** | 文件树 + 编辑器 + 预览 | 代码编辑器、文档编辑 |
| **Workshop** | 主工作区 + 右侧属性面板 | 设计工具、IDE |
| **Settings** | 左侧分类 + 右侧表单 | 应用设置、偏好配置 |
| **List** | 搜索栏 + 数据列表/网格 | 文件管理、数据浏览 |
| **Detail** | 标题 + 元信息 + 内容 + 操作栏 | 文章详情、项目详情 |

---

## 💡 设计方向顾问

v0.3 内置 20+ 种设计哲学，覆盖 7 大流派：

| 流派 | 设计哲学 | 代表 |
|------|----------|------|
| **信息建筑** | Pentagram / 瑞士国际主义 / 包豪斯 | Apple.com, 瑞士航空 |
| **运动诗学** | Field.io / Google Material Motion | Stripe, Google |
| **东方极简** | Kenya Hara / 侘寂美学 | 无印良品, 京都老铺 |
| **实验先锋** | Sagmeister / 数字野兽主义 / 故障美学 | Sagmeister&Walsh, Craigslist |
| **温暖人文** | 温暖人文主义 / 有机自然主义 | Notion, Patagonia |
| **科技未来** | 赛博朋克 / 玻璃拟态 / 新拟态 | Cyberpunk 2077, macOS |
| **极致排版** | 极致排版主义 / 编辑设计 | 纽约时报, Medium |
| **数据驱动** | 数据可视化主义 | Grafana, Datadog |
| **品牌叙事** | 品牌叙事主义 | Apple 发布会 |

---

## 🔍 专家评审

5 维度评分体系，自动评估设计质量：

| 维度 | 权重 | 说明 |
|------|------|------|
| 哲学一致性 | 25% | 视觉风格是否贯彻设计哲学 |
| 视觉层级 | 25% | 信息层级是否清晰，3秒能否理解页面 |
| 细节执行 | 20% | 间距/对齐/圆角/颜色是否一致 |
| 功能性 | 20% | 信息是否可获取，交互是否直觉 |
| 创新性 | 10% | 是否有亮点，是否超出模板感 |

评分等级：S（卓越）→ A（优秀）→ B+（良好）→ B（合格）→ C（一般）→ D（需改进）→ F（不合格）

---

## 🚫 反 AI Slop

10 项自动检查，防止生成"AI 味"过重的设计：

| 检查项 | 严重度 | 说明 |
|--------|--------|------|
| 不必要的渐变 | ⚠️ 警告 | 纯色能解决的地方不用渐变 |
| Emoji 过载 | ⚠️ 警告 | 标题和按钮里不堆砌 emoji |
| 彩虹边框 | 💡 建议 | 不用 border-image 渐变 |
| 过度圆角 | 💡 建议 | 不是所有东西都需要 24px+ 圆角 |
| 到处毛玻璃 | ⚠️ 警告 | backdrop-filter 只在需要穿透的场景使用 |
| 占位文字 | ❌ 错误 | 不用 Lorem ipsum 或 "点击这里" |
| 阴影过重 | 💡 建议 | 使用轻量阴影 |
| 一切居中 | 💡 建议 | 正文左对齐，居中只用于标题/CTA |
| 霓虹色滥用 | ⚠️ 警告 | 降低饱和度，霓虹色小面积使用 |
| 间距不一致 | ⚠️ 警告 | 使用 4/8px 倍数系统 |

---

## 🏢 种子设计系统

v0.2 预置了 15 个头部设计系统的特征数据：

| 设计系统 | 主色调 | 调性标签 |
|----------|--------|----------|
| **Stripe** | `#635BFF` | 专业 · 金融 · 开发者 |
| **Vercel** | `#000000` | 极简 · 开发者 · 暗色 |
| **Apple** | `#0071E3` | 高端 · 简约 · 精致 |
| **Linear** | `#5E6AD2` | 现代 · 高效 · 专业 |
| **Notion** | `#000000` | 极简 · 灵活 · 知识 |
| **Figma** | `#A259FF` | 创意 · 协作 · 设计 |
| **Spotify** | `#1DB954` | 活泼 · 娱乐 · 社交 |
| **Airbnb** | `#FF5A5F` | 温暖 · 旅行 · 社区 |
| **GitHub** | `#24292E` | 专业 · 开发者 · 开源 |
| **Slack** | `#4A154B` | 友好 · 协作 · 企业 |
| **Netflix** | `#E50914` | 娱乐 · 影视 · 暗色 |
| **Tesla** | `#CC0000` | 科技 · 未来 · 高端 |
| **Claude** | `#D97757` | 专业 · AI · 可靠 |
| **Supabase** | `#3ECF8E` | 开发者 · 现代 · 开源 |
| **Raycast** | `#FF6363` | 效率 · 工具 · 极客 |

---
## 🕷️ 设计爬虫

DesignSeed 内置了一个设计爬虫，可以从外部学习优秀的设计风格，提取色彩、排版、布局、调性等特征，生成新的设计风格供后续使用。

### 抓取设计风格

**从 GitHub 仓库抓取：**

> "帮我从 https://github.com/bradtraversy/design-resources-for-developers 这个仓库抓取设计风格"

> "去 Atlassian 的设计系统网站学一下他们的设计特征"

> "抓取 Shopify Polaris 的设计规范，提取色彩和排版信息"

**从设计博客抓取：**

> "从 Smashing Magazine 抓取最新的设计趋势文章，分析里面的配色方案"

> "帮我看看 Medium 上 Design Bootcamp 的设计风格，提取调性特征"

### 使用新风格

抓取后，爬虫会自动提取以下特征并存入本地：

| 特征 | 说明 |
|------|------|
| 🎨 **色彩** | 主色调、辅助色、背景色、色板、冷暖倾向 |
| 📝 **排版** | 字体族、字号层级、行高、字重 |
| 📐 **布局** | 栅格系统、间距比例、最大内容宽度 |
| 🧩 **组件** | 按钮、卡片、导航等组件的样式特征 |
| 🎭 **调性** | 正式度、温暖度、复杂度、创新度 |

**使用抓取到的风格生成页面：**

> "用刚才从 Atlassian 学到的风格，做一个项目管理页面"

> "把 Stripe 和 Linear 的设计特征混合，生成一个 SaaS 落地页"

> "用从 Smashing Magazine 抓取的配色方案，重新设计这个页面"

### 抓取流程

```
1. 你说："帮我从 [URL] 学习设计风格"
2. 爬虫抓取目标页面/仓库
3. Parser 提取色彩、排版、布局、调性特征
4. 特征存入本地 memory/design-profiles/
5. 后续生成页面时自动参考这些特征
```

### 支持的数据源

| 类型 | 示例 | 说明 |
|------|------|------|
| **GitHub 仓库** | `github.com/user/repo` | 自动遍历仓库，匹配 `DESIGN.md` 等设计文档 |
| **公司设计系统** | Atlassian、Carbon、Polaris、Material、Ant Design | 直接抓取设计规范网站 |
| **设计博客** | Smashing Magazine、Medium Design Bootcamp | 提取文章中的设计案例和配色方案 |
| **本地文件** | 你自己的设计文档 | 直接读取本地 Markdown/HTML 文件 |

### 批量学习

> "帮我批量学习这 5 个设计系统：Stripe、Vercel、Linear、Notion、Figma"

> "把 awesome-design-md 仓库里的设计文档全部抓取一遍"

---

## 🛡️ 美学规则引擎
内置 7 条美学规则：

| 规则 | 类型 | 说明 |
|------|------|------|
| `accessibility_contrast` | hard_limit | 文字对比度 ≥ 4.5:1（WCAG 2.1 AA） |
| `min_font_size` | hard_limit | 最小字号 ≥ 12px |
| `max_line_length` | soft_preference | 行宽 ≤ 80 字符 |
| `color_harmony` | hard_limit | 主色调不超过 7 种 |
| `ugly_combo_clash` | hard_limit | 高饱和冲突配色拦截 |
| `spacing_consistency` | soft_preference | 间距值符合 4/8/12/16/24/32/48/64 比例尺 |
| `border_radius_consistency` | soft_preference | 圆角值符合 0/2/4/8/12/16/24 比例尺 |

---

## 📖 使用场景

**场景 1：App 原型设计**

> "帮我做一个任务管理 App 的 Dashboard" → 选择 iPhone 16 Pro 设备框架 → Dashboard 布局 → 真实图片 → 生成完整可交互 HTML

**场景 2：设计方向探索**

> "我想做一个面向开发者的 SaaS 产品" → 设计方向顾问推荐 3 个方向 → 选择 Pentagram 信息建筑 → 生成页面

**场景 3：设计质量评审**

> 生成页面后 → 专家评审 5 维度打分 → 获取修复清单 → 自动修复 → 重新评审

**场景 4：风格混合**

> "我想要一个介于极简和玻璃拟态之间的风格" → 按比例混合 → 生成全新风格

**场景 5：团队共享**

> 导出知识包 → 发给团队成员 → 导入 → 团队 AI Agent 共享同一套设计偏好

---

## 🗺️ Roadmap

### v0.1 ✅ — MVP 核心
- [x] HTML 设计引擎：12 种风格，Prompt → HTML
- [x] 设计爬虫：多源采集，特征提取
- [x] 嵌入式记忆：SQLite 存储，EMA 偏好学习
- [x] 美学规则引擎：7 条内置规则
- [x] 同步层：知识包导出/导入

### v0.2 ✅ — 风格混合 + 知识积累
- [x] 向量空间风格插值
- [x] 15 个头部设计系统种子数据
- [x] 自动修复 + 用户预设

### v0.3 ✅ — 设计功能提升
- [x] 设备框架（iOS/Android/Tablet）
- [x] 复杂 UI 布局（6种模式）
- [x] 交互状态管理（Tab/Modal/Accordion/Toast/Dropdown）
- [x] 真实图片 Sourcing（Wikimedia/Unsplash）
- [x] 品牌资产协议（5步流程）
- [x] 设计方向顾问（20+设计哲学）
- [x] 专家评审引擎（5维度评分）
- [x] 反 AI Slop（10项检查）

### v0.4 — design.md 格式 + 创作者基础（规划中）
- [ ] design.md 格式规范
- [ ] design.md 生成器 / 验证器 / 导入器
- [ ] 设计爬虫增强

### v0.5 — 自适应界面（规划中）
- [ ] 时间/疲劳/专注感知
- [ ] 设计偏好联动
- [ ] 规则引擎联动

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
- [Xiaomi miclaw](https://github.com/XiaomiMiClaw) — AI 助手平台
- [Model Context Protocol](https://modelcontextprotocol.io/) — AI Agent 标准化工具协议
- [Ant Design](https://ant.design) — 企业级设计系统参考
- [Material Design](https://m3.material.io) — Google 设计语言参考

---

## 🌟 Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=kialajin-l/DesignSeed&type=Date)](https://star-history.com/#kialajin-l/DesignSeed&Date)
