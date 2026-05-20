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
