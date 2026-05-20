/**
 * DesignSeed — 卡片模板渲染器
 * v0.7
 *
 * 根据模板 ID 生成固定尺寸的卡片 HTML。
 * 支持 style 参数切换风格（颜色/字体由 renderer 的 style 系统驱动）。
 */

const { matchTemplate } = require('./index');
const renderer = require('../renderer');

/**
 * 渲染一张卡片
 *
 * @param {string} title - 卡片标题
 * @param {object} opts
 * @param {string} opts.template - 模板 ID（如 'xiaohongshu-note'）
 * @param {string} opts.style - 风格名（如 'cyberpunk'），默认 minimalism
 * @param {string} opts.subtitle - 副标题
 * @param {string} opts.body - 正文内容
 * @returns {string} 完整 HTML 字符串
 */
function renderCard(title, opts) {
  opts = opts || {};
  var templateId = opts.template || 'xiaohongshu-note';
  var style = opts.style || 'minimalism';
  var subtitle = opts.subtitle || '';
  var body = opts.body || '';

  var tpl = matchTemplate(templateId);
  if (!tpl) {
    tpl = matchTemplate('xiaohongshu-note');
  }

  var w = tpl.canvas.width;
  var h = tpl.canvas.height;

  // 使用 renderer 的 style 系统获取颜色
  var styleDef = renderer.getStyle ? renderer.getStyle(style) : null;
  var bg = '#0A0A0F';
  var fg = '#E0E0E0';
  var accent = '#00FFFF';
  var font = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif';

  if (styleDef) {
    bg = styleDef.colors ? styleDef.colors.background || bg : bg;
    fg = styleDef.colors ? styleDef.colors.text || fg : fg;
    accent = styleDef.colors ? (styleDef.colors.primary || styleDef.colors.accent) || accent : accent;
    font = styleDef.typography ? (styleDef.typography.fontFamily || font) : font;
  }

  // 生成响应式缩放的卡片 HTML
  var html = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n';
  html += '<meta charset="UTF-8">\n';
  html += '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
  html += '<title>' + escHtml(title) + ' — ' + escHtml(tpl.name) + '</title>\n';
  html += '<style>\n';
  html += '  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }\n';
  html += '  body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #1a1a1a; }\n';
  html += '  .card-wrap { position: relative; width: ' + w + 'px; height: ' + h + 'px; overflow: hidden; }\n';
  html += '  .card { width: 100%; height: 100%; background: ' + bg + '; color: ' + fg + '; font-family: ' + font + '; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 8%; text-align: center; position: relative; }\n';
  html += '  .card h1 { font-size: ' + Math.round(w * 0.06) + 'px; font-weight: 700; margin-bottom: ' + Math.round(h * 0.03) + 'px; line-height: 1.3; }\n';
  if (subtitle) {
    html += '  .card .subtitle { font-size: ' + Math.round(w * 0.03) + 'px; color: ' + accent + '; margin-bottom: ' + Math.round(h * 0.02) + 'px; }\n';
  }
  if (body) {
    html += '  .card .body { font-size: ' + Math.round(w * 0.025) + 'px; line-height: 1.6; opacity: 0.85; max-width: 80%; }\n';
  }
  html += '  .card .template-badge { position: absolute; bottom: ' + Math.round(h * 0.03) + 'px; right: ' + Math.round(w * 0.03) + 'px; font-size: 11px; opacity: 0.3; }\n';
  html += '  @media (max-width: ' + w + 'px) { .card-wrap { width: 100vw; height: ' + Math.round(100 * h / w) + 'vw; } .card h1 { font-size: 5vw; } }\n';
  html += '</style>\n</head>\n<body>\n';
  html += '<div class="card-wrap">\n';
  html += '  <div class="card">\n';
  html += '    <h1>' + escHtml(title) + '</h1>\n';
  if (subtitle) {
    html += '    <div class="subtitle">' + escHtml(subtitle) + '</div>\n';
  }
  if (body) {
    html += '    <div class="body">' + escHtml(body) + '</div>\n';
  }
  html += '    <div class="template-badge">' + escHtml(tpl.name) + ' (' + w + '×' + h + ')</div>\n';
  html += '  </div>\n';
  html += '</div>\n';
  html += '</body>\n</html>';

  return html;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = { renderCard };
