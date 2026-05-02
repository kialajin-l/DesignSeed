# DesignSeed 🌱

> 🌱 This is a **Vibe Coding** project: Built with AI, for AI-augmented development.

![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Version](https://img.shields.io/badge/Version-v0.3-blue.svg)
![Node](https://img.shields.io/badge/Node-%3E%3D18-green.svg)

**DesignSeed** 是一个会生长的 AI 设计系统——Agent-first 的 HTML 设计引擎，让 AI 助手拥有"审美"能力。

本项目灵感来源于 **Claude Design** 的极简美学和 **Huashu Design** 的结构化设计思路，将其扩展为完整的风格引擎、设计爬虫、嵌入式记忆和美学规则系统。它的核心价值是：**让 AI 生成的页面不再是千篇一律的白底黑字，而是有风格、有调性、有记忆的设计作品。**

---

## ✨ 核心功能

### v0.1-v0.2 基础能力

| 功能 | 说明 |
|------|------|
| 🎨 **12 种内置风格 + 混合引擎** | 极简、新拟态、玻璃拟态等 12 种风格，支持任意两种风格按比例混合生成全新风格 |
| 🏢 **15 个种子设计系统** | Stripe、Vercel、Apple、Linear、Notion、Figma、Spotify、Airbnb、GitHub、Slack、Netflix、Tesla、Claude、Supabase、Raycast |
| 🕷️ **设计爬虫** | 从 GitHub、公司设计系统、设计博客中学习优秀设计，提取色彩/排版/布局/调性特征 |
| 🧠 **嵌入式记忆** | 记录每次生成的 prompt、风格、用户修改，形成设计偏好档案（Nexus 最小版） |
| 🛡️ **美学规则引擎** | 7 条内置规则（对比度/字号/行宽/色彩/配色黑名单/间距/圆角），自动检查和修复 |
| 📦 **自包含 Skill** | 解压即用，无需外部服务，数据格式与 Nexus/RuleForge 完整版一致 |
| 🔄 **双向同步** | 导出为知识包，可导入到其他 Agent 或设备 |

### v0.3 新增能力（追平 Huashu Design）

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
├── memory/              # 🧠 嵌入式记忆（Nexus 最小版）
├── rules/               # 🛡️ 美学规则引擎（RuleForge 最小版）
├── sync/                # 🔄 同步层
└── SKILL.md             # Agent 技能说明
```

---

## 🚀 快速开始

### 生成 App 原型（v0.3 新增）

```bash
# 生成带 iPhone 设备框架的页面
node engine/cli.js generate --prompt "一个任务管理 App" --device iphone-16-pro --output app.html

# 生成 Dashboard 布局
node engine/cli.js generate --prompt "数据分析仪表盘" --layout dashboard --output dashboard.html

# 生成可交互的 Tab 页面
node engine/cli.js generate --prompt "设置页面" --layout settings --interactions --output settings.html
```

### 设计方向推荐

```bash
# 根据需求描述推荐设计方向
node engine/cli.js recommend --description "一个面向开发者的 SaaS 产品"

# 查看所有设计哲学
node engine/cli.js philosophies
```

### 专家评审

```bash
# 评审生成的设计
node engine/cli.js review --file page.html

# 反 AI Slop 检查
node engine/cli.js check-slop --file page.html
```

### 基础功能

```bash
# 生成页面（12 种风格）
node engine/cli.js generate --prompt "一个产品落地页" --style glassmorphism --output page.html

# 风格混合
node engine/cli.js mix --style1 minimalism --style2 glassmorphism --ratio 0.7 --output mixed.html

# 设计爬虫
node crawler/cli.js learn --url "https://ant.design"

# 美学规则检查
node rules/cli.js check --file page.html
```

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

> "我想要一个介于极简和玻璃拟态之间的风格" → mixer.js 按 0.7:0.3 比例混合 → 生成全新风格

**场景 5：团队共享**

> 导出知识包 → 发给团队成员 → 导入 → 团队 AI Agent 共享同一套设计偏好

---

## 🗺️ Roadmap

详见 [ROADMAP.md](./docs/ROADMAP.md)

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

### v0.3 ✅ — 追平 Huashu（设计生产工具）
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

### v0.5 — 自适应界面 + NightShift 集成（规划中）
- [ ] 时间/疲劳/专注感知
- [ ] Nexus 记忆联动
- [ ] RuleForge 规则联动

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
