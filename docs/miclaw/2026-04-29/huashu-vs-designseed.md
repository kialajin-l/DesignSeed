# Huashu Design vs DesignSeed · 功能对照

> 生成时间：2026-04-29 22:55

---

## 一、定位对比

| 维度 | Huashu Design | DesignSeed |
|------|---------------|------------|
| **定位** | 专业设计师工作流（人驱动，AI 执行） | Agent-first 设计系统（AI 自主决策） |
| **核心理念** | HTML 是工具，根据任务 embody 对应专家 | 风格是活的，从反馈中进化 |
| **目标用户** | 有明确设计需求的人（设计师/PM/开发者） | Agent 自身（作为 skill 被调用） |
| **交付物** | 高保真 HTML 原型/幻灯片/动画/视频 | HTML 页面 + 风格特征数据 |
| **体量** | ~5000 行 SKILL.md + 大量 references/assets/scripts | 22 个文件，自包含 |
| **依赖** | Playwright、ffmpeg、React+Babel CDN | Node.js + Playwright（截图） |

---

## 二、核心能力对照

### 2.1 设计生成

| 能力 | Huashu Design | DesignSeed |
|------|:---:|:---:|
| HTML 页面生成 | ✅ React+Babel，高保真 | ✅ 纯 HTML/CSS，模板化 |
| 风格数量 | 20 种设计哲学（Pentagram/Field.io/Kenya Hara 等） | 12 种预设风格（glassmorphism/cyberpunk/水墨 等） |
| 风格选择方式 | **人驱动**：顾问模式推荐 3 个方向，用户选 | **AI 驱动**：根据 prompt 自动匹配最合适的风格 |
| 风格来源 | 人类设计哲学（5 流派 × 20 种） | 外部学习（DESIGN.md 爬虫提取） |
| 风格进化 | ❌ 静态知识库 | ✅ 用户反馈 → Nexus 记忆 → 自动优化 |
| 品牌资产协议 | ✅ 5 步硬流程（搜 logo/产品图/UI/色值/字体） | ❌ 无品牌感知 |
| 反 AI slop | ✅ 详细清单 + 正反例 | ❌ 无（模板本身可能产生 slop） |
| 设计变体（Variations） | ✅ 3+ 变体并排对比 | ❌ 单次生成 |
| Tweaks 实时调参 | ✅ localStorage 版 Tweaks 系统 | ❌ 无 |

### 2.2 交互原型

| 能力 | Huashu Design | DesignSeed |
|------|:---:|:---:|
| iOS 设备框 | ✅ `ios_frame.jsx`（iPhone 15 Pro 精确规格） | ❌ 无 |
| Android 设备框 | ✅ `android_frame.jsx` | ❌ 无 |
| macOS 窗口框 | ✅ `macos_window.jsx` | ❌ 无 |
| 浏览器窗口框 | ✅ `browser_window.jsx` | ❌ 无 |
| App 状态管理器 | ✅ `AppPhone` 组件（tab 切换/导航/模态） | ❌ 无 |
| Overview 平铺 | ✅ 多屏并排展示 | ❌ 无 |
| Flow Demo | ✅ 可点击的用户流程演示 | ❌ 无 |
| Playwright 点击测试 | ✅ 交付前自动验证 | ❌ 无 |

### 2.3 幻灯片/演示

| 能力 | Huashu Design | DesignSeed |
|------|:---:|:---:|
| HTML 幻灯片 | ✅ `deck_stage.js` + `deck_index.html` | ❌ 无 |
| Speaker Notes | ✅ 演讲者备注 | ❌ 无 |
| 键盘导航 | ✅ 翻页/全屏 | ❌ 无 |
| PDF 导出 | ✅ `export_deck_pdf.mjs` | ❌ 无 |
| 可编辑 PPTX 导出 | ✅ `html2pptx.js`（文字可编辑） | ❌ 无 |

### 2.4 动画/视频

| 能力 | Huashu Design | DesignSeed |
|------|:---:|:---:|
| 动画引擎 | ✅ `animations.jsx`（Stage/Sprite/useTime/Easing） | ❌ 无 |
| 60fps 插帧 | ✅ `convert-formats.sh` | ❌ 无 |
| MP4 导出 | ✅ `render-video.js`（25fps） | ❌ 无 |
| GIF 导出（palette 优化） | ✅ `convert-formats.sh` | ❌ 无 |
| BGM 配乐 | ✅ 6 首场景化配乐 | ❌ 无 |
| SFX 音效 | ✅ 37 个预制 + 场景配方 | ❌ 无 |
| Apple 画廊展示风格 | ✅ 3D 倾浮 + 焦点切换 | ❌ 无 |

### 2.5 设计评审

| 能力 | Huashu Design | DesignSeed |
|------|:---:|:---:|
| 专家评审 | ✅ 5 维度评分（哲学/层级/细节/功能/创新） | ❌ 无 |
| 修复清单 | ✅ Keep + Fix + Quick Wins | ❌ 无 |
| 设计方向顾问 | ✅ 20 种哲学 × 3 方向推荐 | ❌ 无 |

### 2.6 截图/可视化

| 能力 | Huashu Design | DesignSeed |
|------|:---:|:---:|
| HTML → PNG 截图 | ✅ Playwright（手动调用） | ✅ CLI 内置 `--screenshot` |
| 批量截图 | ✅ 手动循环 | ✅ `screenshot-all` 命令 |
| 风格列表展示 | ❌ 无 | ✅ `list` 命令（含 tone 特征值） |
| Demo 页生成 | ✅ 手动构建 | ✅ `demo` 命令（12 风格并排） |

### 2.7 记忆与进化

| 能力 | Huashu Design | DesignSeed |
|------|:---:|:---:|
| 用户偏好记忆 | ❌ 无（每次从零开始） | ✅ Nexus-lite（嵌入式记忆） |
| 设计反馈学习 | ❌ 无（靠人记住） | ✅ 用户修改 = 反馈信号 |
| 规则过滤 | ❌ 无 | ✅ RuleForge-lite（美学底线） |
| 外界学习 | ❌ 静态知识库 | ✅ 设计爬虫（DESIGN.md → 特征提取） |
| 跨会话记忆 | ❌ 无 | ✅ 锚点持久化 |

---

## 三、工作流对比

| 阶段 | Huashu Design | DesignSeed |
|------|---------------|------------|
| **需求理解** | 问 clarifying questions + 事实验证 | AI 自动从 prompt 推断 |
| **方向探索** | 设计方向顾问（8 Phase 流程） | AI 自动匹配风格 |
| **资产采集** | 5 步品牌资产协议（搜/下/验/提/固） | 无 |
| **设计系统** | 位置四问 + vocalize 系统 | 预设 12 风格模板 |
| **Junior Pass** | assumptions + placeholders → 用户确认 | 无（直接生成） |
| **Full Pass** | 填 placeholder + variations + tweaks | 直接输出 |
| **验证** | Playwright 截图 + 点击测试 | Playwright 截图 |
| **交付** | HTML + 可选 PDF/PPTX/MP4/GIF | HTML + PNG |
| **评审** | 5 维度专家评审 | 无 |
| **进化** | 无（下次从零开始） | 反馈 → 记忆 → 下次更好 |

---

## 四、各自独有优势

### Huashu Design 独有（DesignSeed 做不到的）

1. **品牌资产协议**：搜 logo/产品图/UI 截图的完整流程，确保品牌识别度
2. **反 AI slop 体系**：详细的设计禁区清单 + 正反例
3. **交互原型**：iOS/Android/macOS 设备框 + App 状态管理器 + 可点击 demo
4. **幻灯片系统**：HTML deck + Speaker Notes + PDF/PPTX 导出
5. **动画 + 音频**：完整的时间轴动画引擎 + BGM + SFX + 视频导出
6. **专家评审**：5 维度打分 + 修复清单
7. **设计方向顾问**：20 种设计哲学的顾问式推荐
8. **Junior Designer 工作流**：假设 → 验证 → 迭代，避免方向错误

### DesignSeed 独有（Huashu Design 做不到的）

1. **风格进化**：用户反馈 → Nexus 记忆 → 自动优化，风格会"长"
2. **设计爬虫**：从外部 DESIGN.md 学习新风格特征
3. **CLI 工具链**：`generate` / `screenshot` / `screenshot-all` / `list` / `demo`
4. **风格特征向量**：每个风格有 formality/warmth/complexity/innovation 量化值
5. **跨会话记忆**：记住用户偏好，下次生成更精准
6. **自包含分发**：22 个文件，解压即用，无外部依赖
7. **Agent-first**：设计为被 AI 调用，不是被人驱动

---

## 五、融合路径

DesignSeed 的愿景是成为 NightShift 生态中的设计 skill，而 Huashu Design 是当前最成熟的设计能力。两者融合方向：

| 阶段 | 融合内容 |
|------|---------|
| **Sprint 1** | DesignSeed 的 CLI + 截图能力集成进 Huashu Design 工作流 |
| **Sprint 2** | Huashu Design 的 20 种设计哲学作为 DesignSeed 爬虫的学习目标 |
| **Sprint 3** | DesignSeed 的 Nexus-lite 记忆 + RuleForge-lite 规则接入 Huashu Design 的反馈闭环 |
| **Sprint 4** | Huashu Design 的品牌资产协议 / 反 slop / 评审能力封装为 DesignSeed 的规则节点 |

**本质关系**：
- Huashu Design = **人类设计师的工作台**（深度、专业、人驱动）
- DesignSeed = **AI 设计师的记忆和品味**（进化、自主、Agent-first）
- 两者不是替代关系，而是**互补关系**：DesignSeed 提供"品味和记忆"，Huashu Design 提供"技能和流程"
