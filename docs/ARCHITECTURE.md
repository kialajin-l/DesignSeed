# DesignSeed 架构文档

## 系统定位

DesignSeed 是一个自包含的 AI 设计 Skill，定位为"会生长的设计系统"。它不是一个独立服务，而是一个可以被任何 Agent 框架（miclaw Skill / MCP / 其他）直接调用的能力模块。

## 设计原则

1. **自包含**：一个 skill 包，解压即用，不需要额外服务
2. **本地优先**：所有数据存储在本地 SQLite，零外部依赖
3. **格式统一**：内嵌版的数据格式和完整 Nexus/RuleForge 服务完全一致
4. **渐进增强**：MVP 只做核心功能，但架构上为未来扩展留好接口

## 模块交互

```
┌─────────────────────────────────────────────────────┐
│                    Agent 调用层                       │
│  (Skill CLI / MCP / 直接 require)                    │
└──────────┬──────────────────────────┬───────────────┘
           │                          │
     ┌─────▼─────┐            ┌──────▼──────┐
     │  Engine   │            │   Crawler   │
     │ (生成设计) │            │ (学习设计)   │
     └─────┬─────┘            └──────┬──────┘
           │                          │
     ┌─────▼──────────────────────────▼──────┐
     │              Memory (Nexus 最小版)      │
     │  ┌──────────┐  ┌──────────┐           │
     │  │ 锚点记录  │  │ 偏好学习  │           │
     │  └──────────┘  └──────────┘           │
     └─────────────────┬────────────────────┘
                       │
     ┌─────────────────▼────────────────────┐
     │         Rules (RuleForge 最小版)       │
     │  ┌──────────┐  ┌──────────┐           │
     │  │ 美学检查  │  │ 自动修复  │           │
     │  └──────────┘  └──────────┘           │
     └─────────────────┬────────────────────┘
                       │
     ┌─────────────────▼────────────────────┐
     │           Sync (预留接口)              │
     │  ┌──────────┐  ┌──────────┐           │
     │  │ 数据导出  │  │ 数据导入  │           │
     │  └──────────┘  └──────────┘           │
     └──────────────────────────────────────┘
```

## 数据流

### 生成流程

```
用户输入 prompt
  ↓
Engine 分析 prompt，选择/匹配风格
  ↓
Memory 查询历史偏好（如果有）
  ↓
Engine 生成 HTML/CSS
  ↓
Rules 校验（对比度、字号、配色等）
  ↓
  ├─ 通过 → 输出 HTML 文件
  └─ 不通过 → 自动修复 → 重新校验 → 输出
  ↓
Memory 记录锚点（prompt + 风格 + 输出 hash）
```

### 学习流程

```
Crawler 采集设计系统文档
  ↓
Parser 提取特征（色彩/排版/布局/调性）
  ↓
Memory 存储为设计系统节点
  ↓
下次生成时，Engine 可以参考已学习的风格
```

### 反馈流程

```
用户修改生成结果
  ↓
Agent 检测到修改（最终版本 hash ≠ 初始版本 hash）
  ↓
Memory 更新锚点（user_modifications +1）
  ↓
Memory 更新用户偏好（EMA 学习）
  ↓
下次生成时，自动偏向用户偏好的维度
```

## 存储设计

### SQLite 表结构

| 表 | 用途 | 关键字段 |
|---|------|---------|
| design_systems | 爬虫采集的设计知识 | company, colors, tone, quality_score |
| design_anchors | 生成历史记录 | prompt, style, user_modifications, feedback_signal |
| user_preferences | 用户偏好向量 | dimension, value, confidence, sample_count |
| custom_rules | 用户自定义规则 | rule_type, dimension, condition, threshold |

### 数据格式兼容性

所有 JSON 字段的格式和 Nexus 服务器端完全一致：
- `preferences.styleVector` — 风格偏好向量
- `anchors[].feedback_signal` — 反馈信号结构
- `custom_rules[]` — 规则格式

这意味着：
1. 本地积累的数据可以直接上传到 Nexus 服务器
2. 服务器聚合后的数据可以直接下载到本地
3. 零迁移成本

## 扩展点

### v0.2: 风格混合

在 Engine 中加入向量空间插值：
```javascript
// 两种风格的混合
const mixed = styleMixer.blend(styleA, styleB, { ratio: 0.7 });
// ratio: 0 = 纯 A, 1 = 纯 B
```

### v0.3: LLM 辅助调性分析

在 Parser 中接入 LLM：
```javascript
// 当前：基于关键词匹配
tone = parser.analyzeTone(features);

// 升级：LLM 语义分析
tone = await llm.analyze(`
  分析以下设计系统的调性，返回 JSON：
  ${JSON.stringify(features)}
`);
```

### v1.0: 服务器同步

在 Sync 模块中实现真正的网络同步：
```javascript
// 导出本地数据
const exporter = new DataExporter(memory);
const data = exporter.exportAll();

// 上传到 Nexus 服务器
await nexusServer.upload(data);

// 下载聚合数据
const globalData = await nexusServer.download();

// 合并（EMA 策略）
const importer = new DataImporter(memory);
importer.importFull(globalData);
```

## 安全考虑

1. **本地数据不外泄**：MVP 阶段所有数据存储在本地 SQLite，不发送到任何外部服务
2. **知识包脱敏**：exportKnowledgePack() 导出时移除用户隐私数据
3. **规则优先级**：硬限制（hard_limit）不可被用户覆盖，软偏好（soft_preference）可以
4. **文件大小限制**：爬虫采集时限制单文件最大 1MB，防止内存溢出
