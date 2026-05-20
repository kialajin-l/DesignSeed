/**
 * DesignSeed — 统一导出
 * v0.7: 新增风格包系统、装饰扩展、布局引擎、卡片模板、资源解析
 */

const renderer = require('./renderer');
const styles = require('./templates/styles');
const components = require('./components/ui-components');

// v0.2
const mixer = require('./mixer');
const seedDesignSystems = require('./seed-design-systems');

// v0.3 — 设备框架
const deviceFrames = require('./device-frames');

// v0.3 — 复杂 UI 布局
const layouts = require('./layouts');

// v0.3 — 交互状态管理
const interactions = require('./interactions');

// v0.3 — 真实图片 sourcing
const imageSourcing = require('./image-sourcing');

// v0.3 — 品牌资产协议
const brandProtocol = require('./brand-protocol');

// v0.3 — 设计方向顾问
const designPhilosophy = require('./design-philosophy');

// v0.3 — 专家评审引擎
const expertReview = require('./expert-review');

// v0.3 — 反 AI slop
const antiAiSlop = require('./anti-ai-slop');

// v0.7 — 装饰素材系统（基础 + 扩展）
const decorations = require('./decorations');
const decorationsExtra = require('./decorations-extra');

// v0.7 — 布局引擎
const layoutEngine = require('./layout-engine');

// v0.7 — 网格布局
const gridLayout = require('./grid-layout');

// v0.7 — 风格包系统
const stylePackLoader = require('./style-pack-loader');

// v0.7 — 资源解析
const assetResolver = require('./asset-resolver');

// v0.7 — 卡片模板
const cardTemplates = require('./card-templates');

module.exports = {
  // 核心
  renderer,
  styles,
  components,

  // v0.2
  mixer,
  seedDesignSystems,

  // v0.3
  deviceFrames,
  layouts,
  interactions,
  imageSourcing,
  brandProtocol,
  designPhilosophy,
  expertReview,
  antiAiSlop,

  // v0.7
  decorations,
  decorationsExtra,
  layoutEngine,
  gridLayout,
  stylePackLoader,
  assetResolver,
  cardTemplates,
};
