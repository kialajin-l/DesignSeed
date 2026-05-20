/**
 * DesignSeed — 卡片模板注册表
 * v0.7
 *
 * 预置模板：小红书笔记封面、微信公众号封面、Instagram 方卡
 */

const templates = [
  {
    id: 'xiaohongshu-note',
    name: '小红书笔记封面',
    canvas: { width: 1080, height: 1440 },
    aspect: '3:4',
    tags: ['social', 'xiaohongshu', 'note'],
  },
  {
    id: 'wechat-cover',
    name: '微信公众号封面',
    canvas: { width: 900, height: 383 },
    aspect: '2.35:1',
    tags: ['social', 'wechat', 'article'],
  },
  {
    id: 'instagram-square',
    name: 'Instagram 方卡',
    canvas: { width: 1080, height: 1080 },
    aspect: '1:1',
    tags: ['social', 'instagram', 'square'],
  },
  {
    id: 'wechat-moments',
    name: '微信朋友圈',
    canvas: { width: 1080, height: 1080 },
    aspect: '1:1',
    tags: ['social', 'wechat', 'moments'],
  },
  {
    id: 'phone-wallpaper',
    name: '手机壁纸',
    canvas: { width: 1080, height: 1920 },
    aspect: '9:16',
    tags: ['wallpaper', 'phone'],
  },
  {
    id: 'ppt-slide',
    name: 'PPT 幻灯片',
    canvas: { width: 1920, height: 1080 },
    aspect: '16:9',
    tags: ['presentation', 'slide'],
  },
];

/**
 * 列出所有可用模板
 */
function listTemplates() {
  return templates.map(function (t) {
    return { id: t.id, name: t.name, canvas: t.canvas, aspect: t.aspect, tags: t.tags };
  });
}

/**
 * 按 ID 或标签匹配模板
 * 支持模糊匹配：'xhs' → 'xiaohongshu-note'
 */
function matchTemplate(input) {
  if (!input) return null;
  var lower = input.toLowerCase().trim();

  // 精确匹配
  var found = templates.find(function (t) { return t.id === lower; });
  if (found) return found;

  // 模糊匹配 ID
  found = templates.find(function (t) { return t.id.includes(lower); });
  if (found) return found;

  // 标签匹配
  found = templates.find(function (t) {
    return t.tags.some(function (tag) { return tag.includes(lower); });
  });
  return found || null;
}

module.exports = { listTemplates, matchTemplate, templates };
