# DesignSeed 设计风格资源包规范

> 版本：v0.1 | 日期：2026-05-19

## 核心概念

**设计风格 = 资源包（Style Pack）**

一个资源包包含四个维度的定义，组合起来就是一套完整的设计语言：

```
Style Pack = Layout（布局） + Palette（配色） + Assets（素材） + Typography（排版）
```

资源包是自包含的，解压即用，不依赖外部状态。不同资源包之间可以混合（mix），就像 FrameTale 的风格混合一样。

---

## 一、资源包目录结构

```
style-pack/
├── pack.json              # 资源包元数据（必须）
├── layout/
│   ├── templates.json     # 布局模板定义
│   └── zones/             # 区域组件（可选，复杂布局拆分）
├── palette/
│   └── colors.json        # 配色方案
├── assets/
│   ├── index.json         # 素材索引（标签→URL映射）
│   └── stickers/          # 本地素材缓存（可选）
├── typography/
│   └── fonts.json         # 字体和排版参数
└── README.md              # 风格说明（可选）
```

---

## 二、pack.json — 资源包元数据

```json
{
  "id": "xiaohongshu-cute",
  "name": "小红书可爱风",
  "version": "0.1.0",
  "description": "粉色暖色调，适合教程、生活分享、可爱风格内容",
  "author": "DesignSeed",
  "license": "CC-BY-4.0",
  "tags": ["小红书", "可爱", "教程", "粉色", "手账"],
  "platforms": ["xiaohongshu", "wechat"],  // 适用平台
  "canvasPresets": [                        // 预设画布尺寸
    { "name": "小红书竖版", "width": 1440, "height": 1080 },
    { "name": "小红书横版", "width": 1440, "height": 810 },
    { "name": "公众号封面", "width": 900, "height": 1200 }
  ],
  "layouts": ["step-flow", "hero-grid", "comparison"],  // 包含的布局模板
  "palettes": ["pink-warm", "peach-soft"],               // 包含的配色方案
  "mixable": true,        // 是否可与其他资源包混合
  "priority": 0           // 混合时的优先级（越高越优先）
}
```

---

## 三、layout/templates.json — 布局模板

布局模板定义**区域的几何关系**，不包含具体颜色和素材。

### 模板数据结构

```json
{
  "templates": [
    {
      "id": "step-flow",
      "name": "步骤流程",
      "description": "编号步骤 + 箭头连接，适合教程和操作指南",
      "canvas": { "width": 1440, "height": 810 },
      "zones": [
        {
          "id": "header",
          "type": "text",                    // 区域类型
          "position": { "x": 0, "y": 0, "w": 100, "h": 20 },  // 百分比定位
          "fields": [
            {
              "key": "title",
              "type": "text",
              "placeholder": "教程标题",
              "style": {
                "fontSize": "32px",
                "fontWeight": "900",
                "lineHeight": "1.3"
              }
            }
          ],
          "slots": [
            {
              "type": "sticker",
              "tags": ["cute", "love", "star"],
              "max": 3,
              "position": "around"
            }
          ]
        },
        {
          "id": "steps",
          "type": "grid",
          "position": { "x": 0, "y": 20, "w": 100, "h": 55 },
          "cardStyle": {
            "borderRadius": "20px",
            "padding": "24px 20px",
            "boxShadow": "0 4px 20px rgba(0,0,0,0.1)",
            "border": "2px dashed"
          },
          "cardFields": [
            { "key": "number", "type": "text", "style": { "fontSize": "24px", "fontWeight": "900" } },
            { "key": "label", "type": "text", "style": { "fontSize": "16px", "fontWeight": "700" } },
            { "key": "desc", "type": "text", "style": { "fontSize": "12px" } }
          ],
          "arrow": { "symbol": "→", "fontSize": "28px" },
          "minCards": 2,
          "maxCards": 5,
          "defaultCards": 3
        },
        {
          "id": "footer",
          "type": "quote",
          "position": { "x": 0, "y": 75, "w": 100, "h": 25 },
          "fields": [
            { "key": "summary", "type": "text", "style": { "fontSize": "15px" } },
            { "key": "tags", "type": "text", "style": { "fontSize": "13px" } }
          ]
        }
      ]
    }
  ]
}
```

### 区域类型（zone.type）

| 类型 | 说明 | 典型用途 |
|------|------|----------|
| `text` | 纯文本区域 | 标题、副标题、描述 |
| `grid` | 网格/卡片区域 | 功能列表、步骤、对比 |
| `quote` | 引用/总结区域 | 底部总结、引用语 |
| `stats` | 数据统计区域 | 数字展示、指标 |
| `image` | 图片区域 | 产品截图、照片 |
| `decoration` | 装饰区域 | 贴纸、图标、背景元素 |

### 区域定位（position）

所有值为百分比（0-100），相对于画布：

```json
{ "x": 0, "y": 0, "w": 100, "h": 40 }
// x: 左边距  y: 上边距  w: 宽度  h: 高度
```

### 素材槽位（slots）

槽位定义"这里需要一个素材"，但不指定具体素材。渲染时根据 tags 从素材库检索：

```json
{
  "type": "sticker",      // 素材类型：sticker / icon / decoration / image
  "tags": ["cute", "love"],  // 检索标签（OR 逻辑）
  "max": 2,               // 最多放几个
  "position": "top-right" // 放置位置
}
```

---

## 四、palette/colors.json — 配色方案

一个资源包可以包含多套配色，同一布局换配色就是另一种风格。

```json
{
  "palettes": [
    {
      "id": "pink-warm",
      "name": "粉色暖调",
      "background": "#FFF5F5",
      "surface": "#ffffff",
      "primary": "#FF6B6B",
      "secondary": "#FFB347",
      "text": "#333333",
      "textSecondary": "#888888",
      "textOnBg": "#ffffff",
      "border": "#FFE0E0",
      "accent": "#FF6B6B",
      "gradients": {
        "hero": "linear-gradient(135deg, #FF6B6B 0%, #FFB347 100%)"
      },
      "shadows": {
        "card": "0 4px 20px rgba(255,107,107,0.1)",
        "elevated": "0 8px 30px rgba(255,107,107,0.15)"
      }
    },
    {
      "id": "blue-tech",
      "name": "蓝色科技",
      "background": "#0B0E17",
      "surface": "#1a1f35",
      "primary": "#667eea",
      "secondary": "#764ba2",
      "text": "#e8e8f0",
      "textSecondary": "#8888aa",
      "textOnBg": "#ffffff",
      "border": "#2a2f45",
      "accent": "#f093fb",
      "gradients": {
        "hero": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      },
      "shadows": {
        "card": "0 4px 20px rgba(102,126,234,0.15)",
        "elevated": "0 8px 30px rgba(102,126,234,0.2)"
      }
    }
  ]
}
```

### 配色字段说明

| 字段 | 用途 | 必须 |
|------|------|------|
| `background` | 页面/卡片背景 | ✅ |
| `surface` | 卡片/浮层背景 | ✅ |
| `primary` | 主色调（按钮、强调） | ✅ |
| `secondary` | 辅助色 | ✅ |
| `text` | 主要文字颜色 | ✅ |
| `textSecondary` | 次要文字颜色 | ✅ |
| `textOnBg` | 在背景色上的文字颜色 | ✅ |
| `border` | 边框颜色 | ✅ |
| `accent` | 点缀色 | ⬜ |
| `gradients` | 渐变定义 | ⬜ |
| `shadows` | 阴影定义 | ⬜ |

---

## 五、assets/index.json — 素材索引

素材不打包进资源包，而是通过索引引用公开 URL。爬虫负责发现和维护这个索引。

```json
{
  "version": "0.1.0",
  "sources": [
    {
      "id": "flaticon",
      "name": "Flaticon",
      "url": "https://www.flaticon.com",
      "license": "Freepik License",
      "api": null
    },
    {
      "id": "iconify",
      "name": "Iconify",
      "url": "https://iconify.design",
      "license": "Apache-2.0",
      "api": "https://api.iconify.design"
    }
  ],
  "assets": [
    {
      "id": "star-01",
      "type": "sticker",
      "tags": ["star", "decoration", "cute"],
      "source": "flaticon",
      "url": "https://cdn.flaticon.com/svg/xxx.svg",
      "preview": "https://cdn.flaticon.com/preview/xxx.png",
      "license": "Freepik",
      "colors": ["#FFD700", "#FFA500"],
      "width": 120,
      "height": 120
    },
    {
      "id": "rocket-01",
      "type": "icon",
      "tags": ["rocket", "tech", "launch", "speed"],
      "source": "iconify",
      "url": "https://api.iconify.design/mdi/rocket-launch.svg",
      "preview": null,
      "license": "Apache-2.0",
      "colors": ["#667eea"],
      "width": 24,
      "height": 24
    }
  ],
  "tagIndex": {
    "cute": ["star-01", "heart-01", "flower-01"],
    "tech": ["rocket-01", "code-01", "cpu-01"],
    "decoration": ["star-01", "sparkle-01", "dot-01"]
  }
}
```

### 素材检索逻辑

```
输入：slot.tags = ["cute", "love"]
逻辑：tagIndex["cute"] ∪ tagIndex["love"]  →  去重  →  按 type 过滤  →  返回候选列表
排序：优先级 = 标签匹配数 × 素材质量分 × 时效性
```

---

## 六、typography/fonts.json — 排版参数

```json
{
  "fontStack": {
    "zh": "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
    "en": "'Inter', 'SF Pro Display', -apple-system, sans-serif",
    "mono": "'JetBrains Mono', 'Fira Code', monospace"
  },
  "scale": {
    "hero": { "size": "42px", "weight": "900", "lineHeight": "1.2" },
    "h1": { "size": "32px", "weight": "800", "lineHeight": "1.3" },
    "h2": { "size": "24px", "weight": "700", "lineHeight": "1.4" },
    "h3": { "size": "18px", "weight": "700", "lineHeight": "1.4" },
    "body": { "size": "15px", "weight": "400", "lineHeight": "1.6" },
    "caption": { "size": "12px", "weight": "400", "lineHeight": "1.5" },
    "badge": { "size": "14px", "weight": "600", "lineHeight": "1.0" }
  },
  "spacing": {
    "sectionGap": "40px",
    "cardGap": "16px",
    "elementGap": "12px",
    "padding": { "sm":
