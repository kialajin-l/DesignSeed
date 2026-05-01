-- DesignSeed 嵌入式记忆模块 — 数据库表结构
-- Nexus 最小可用版本：记录设计偏好、生成历史、反馈锚点

-- 设计系统知识库（爬虫采集的学习成果）
CREATE TABLE IF NOT EXISTS design_systems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company TEXT NOT NULL,
  url TEXT,
  content TEXT,              -- 原始内容
  colors TEXT,               -- JSON: 色彩特征
  typography TEXT,           -- JSON: 排版特征
  layout TEXT,               -- JSON: 布局特征
  components TEXT,           -- JSON: 组件特征
  tone TEXT,                 -- JSON: 调性 {formality, warmth, complexity, innovation}
  philosophy TEXT,
  quality_score REAL DEFAULT 0,
  source TEXT,
  learned_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 设计生成历史（每次生成记录）
CREATE TABLE IF NOT EXISTS design_anchors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt TEXT NOT NULL,          -- 用户输入
  style TEXT,                    -- 使用的风格
  params TEXT,                   -- JSON: 生成参数
  output_path TEXT,              -- 输出文件路径
  output_hash TEXT,              -- 输出内容 hash
  user_modifications INTEGER DEFAULT 0,  -- 用户修改次数
  final_version_hash TEXT,       -- 最终版本 hash
  feedback_signal TEXT,          -- JSON: 反馈信号 {positive: [], negative: []}
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户风格偏好（从反馈中学习）
CREATE TABLE IF NOT EXISTS user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dimension TEXT NOT NULL,       -- 维度名（如 color_temperature, formality）
  value REAL NOT NULL,           -- 偏好值 0-1
  confidence REAL DEFAULT 0.5,   -- 置信度 0-1
  sample_count INTEGER DEFAULT 0, -- 样本数量
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 自定义规则（用户添加的美学规则）
CREATE TABLE IF NOT EXISTS custom_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_type TEXT NOT NULL,       -- hard_limit / soft_preference
  dimension TEXT NOT NULL,       -- 作用维度
  condition TEXT NOT NULL,       -- 条件描述
  threshold REAL,                -- 阈值
  action TEXT DEFAULT 'adjust',  -- reject / adjust / warn
  source TEXT DEFAULT 'local',   -- local / server / community
  enabled INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用户自定义风格预设（保存偏好的混合比例）
CREATE TABLE IF NOT EXISTS style_presets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  style_a TEXT NOT NULL,
  style_b TEXT NOT NULL,
  ratio REAL NOT NULL DEFAULT 0.5,
  params TEXT,
  use_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
