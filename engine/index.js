/**
 * DesignSeed — 统一导出
 * v0.3: 新增设备框架、复杂布局、交互状态、图片sourcing、品牌协议、设计哲学、专家评审、反AI slop
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
};
