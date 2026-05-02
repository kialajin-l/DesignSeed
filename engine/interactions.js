/**
 * DesignSeed — 交互状态管理
 * Tab 切换 / 导航 / 展开收起 / Modal / Toast / Dropdown
 * 
 * v0.3 新增：从静态页面升级到可交互原型
 * 使用纯 CSS :checked/:target 实现，无需 JavaScript
 */

/**
 * Tab 切换组件（纯 CSS 实现）
 * @param {Array} tabs - [{ label, content, icon? }]
 * @param {object} style - 风格配置
 * @param {string} prefix - 唯一前缀（避免多实例 ID 冲突）
 */
function tabSwitcher(tabs, style = {}, prefix = 'tab') {
  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  const tabsHtml = tabs.map((tab, i) => {
    const id = `${prefix}-${i}`;
    return `
<input type="radio" name="${prefix}" id="${id}" ${i === 0 ? 'checked' : ''} style="display:none;">
<label for="${id}" style="padding:10px 20px;cursor:pointer;font-size:14px;font-weight:${i === 0 ? '600' : '400'};color:${i === 0 ? (c.primary || '#6c63ff') : (c.textSecondary || '#888')};border-bottom:${i === 0 ? `2px solid ${c.primary || '#6c63ff'}` : '2px solid transparent'};font-family:${fontFamily};transition:all 0.2s;display:inline-block;">
  ${tab.icon ? tab.icon + ' ' : ''}${tab.label}
</label>`;
  }).join('\n');

  const panelsHtml = tabs.map((tab, i) => {
    const id = `${prefix}-${i}`;
    return `
<div id="${id}-panel" style="display:${i === 0 ? 'block' : 'none'};padding:20px 0;">
  ${tab.content}
</div>
<style>
  #${id}:checked ~ .${prefix}-panels #${id}-panel { display: block; }
  #${id}:checked ~ .${prefix}-tabs label[for="${id}"] {
    color: ${c.primary || '#6c63ff'};
    border-bottom: 2px solid ${c.primary || '#6c63ff'};
    font-weight: 600;
  }
  #${id}:checked ~ .${prefix}-tabs label:not([for="${id}"]) {
    color: ${c.textSecondary || '#888'};
    border-bottom: 2px solid transparent;
    font-weight: 400;
  }
</style>`;
  }).join('\n');

  return `
<div style="font-family:${fontFamily};">
  <div class="${prefix}-tabs" style="display:flex;gap:0;border-bottom:1px solid ${c.border || '#e8e8e8'};">
    ${tabsHtml}
  </div>
  ${panelsHtml}
</div>`;
}

/**
 * 折叠面板（Accordion，纯 CSS）
 * @param {Array} items - [{ title, content, defaultOpen? }]
 * @param {string} prefix - 唯一前缀
 */
function accordion(items, style = {}, prefix = 'acc') {
  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  return `
<div style="font-family:${fontFamily};border:1px solid ${c.border || '#e8e8e8'};border-radius:12px;overflow:hidden;">
  ${items.map((item, i) => {
    const id = `${prefix}-${i}`;
    return `
<input type="checkbox" id="${id}" ${item.defaultOpen ? 'checked' : ''} style="display:none;">
<div style="border-bottom:1px solid ${c.border || '#e8e8e8'};">
  <label for="${id}" style="display:flex;align-items:center;justify-content:space-between;padding:16px 20px;cursor:pointer;background:${c.surface || '#fff'};">
    <span style="font-size:15px;font-weight:500;color:${c.text || '#1a1a1a'};">${item.title}</span>
    <svg width="16" height="16" viewBox="0 0 16 16" style="transition:transform 0.2s;${item.defaultOpen ? 'transform:rotate(180deg)' : ''};" class="${prefix}-chevron-${i}">
      <path d="M4 6l4 4 4-4" stroke="${c.textSecondary || '#888'}" fill="none" stroke-width="2" stroke-linecap="round"/>
    </svg>
  </label>
  <div style="max-height:${item.defaultOpen ? '500px' : '0'};overflow:hidden;transition:max-height 0.3s ease;background:${c.surface || '#fff'};">
    <div style="padding:0 20px 16px;font-size:14px;color:${c.textSecondary || '#666'};line-height:1.6;">
      ${item.content}
    </div>
  </div>
</div>
<style>
  #${id}:checked ~ div:last-of-type { max-height: 500px; }
  #${id}:checked ~ div label svg { transform: rotate(180deg); }
</style>`;
  }).join('\n')}
</div>`;
}

/**
 * Modal 弹窗（纯 CSS，点击背景关闭）
 * @param {string} triggerText - 触发按钮文字
 * @param {string} modalTitle - 弹窗标题
 * @param {string} modalContent - 弹窗内容
 * @param {string} prefix - 唯一前缀
 */
function modal(triggerText, modalTitle, modalContent, style = {}, prefix = 'modal') {
  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  return `
<style>
  #${prefix}-overlay { display:none; position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:1000; align-items:center; justify-content:center; }
  #${prefix}-trigger:checked ~ #${prefix}-overlay { display:flex; }
  #${prefix}-trigger:checked ~ #${prefix}-btn { pointer-events:none; }
</style>
<input type="checkbox" id="${prefix}-trigger" style="display:none;">
<label for="${prefix}-trigger" id="${prefix}-btn" style="display:inline-block;padding:10px 20px;background:${c.primary || '#6c63ff'};color:#fff;border-radius:8px;cursor:pointer;font-size:14px;font-family:${fontFamily};">
  ${triggerText}
</label>
<div id="${prefix}-overlay">
  <label for="${prefix}-trigger" style="position:absolute;top:0;left:0;right:0;bottom:0;cursor:pointer;"></label>
  <div style="background:${c.surface || '#fff'};border-radius:16px;padding:32px;max-width:480px;width:90%;position:relative;box-shadow:0 25px 60px rgba(0,0,0,0.3);">
    <label for="${prefix}-trigger" style="position:absolute;top:16px;right:16px;cursor:pointer;font-size:20px;color:${c.textSecondary || '#888'};">✕</label>
    <div style="font-size:20px;font-weight:600;color:${c.text || '#1a1a1a'};margin-bottom:16px;font-family:${fontFamily};">${modalTitle}</div>
    <div style="font-size:14px;color:${c.textSecondary || '#666'};line-height:1.6;font-family:${fontFamily};">${modalContent}</div>
    <div style="display:flex;gap:8px;margin-top:24px;justify-content:flex-end;">
      <label for="${prefix}-trigger" style="padding:8px 16px;border-radius:8px;border:1px solid ${c.border || '#e8e8e8'};background:transparent;color:${c.text || '#333'};font-size:14px;cursor:pointer;font-family:${fontFamily};">Cancel</label>
      <label for="${prefix}-trigger" style="padding:8px 16px;border-radius:8px;background:${c.primary || '#6c63ff'};color:#fff;font-size:14px;cursor:pointer;font-family:${fontFamily};">Confirm</label>
    </div>
  </div>
</div>`;
}

/**
 * Toast 通知（纯 CSS 动画，自动消失）
 * @param {string} message - 通知内容
 * @param {string} type - 'success' | 'error' | 'info'
 * @param {string} prefix - 唯一前缀
 */
function toast(message, type = 'info', style = {}, prefix = 'toast') {
  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';
  const colors = {
    success: { bg: '#f0fdf4', border: '#22c55e', text: '#166534', icon: '✓' },
    error: { bg: '#fef2f2', border: '#ef4444', text: '#991b1b', icon: '✕' },
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', icon: 'ℹ' },
  };
  const tc = colors[type] || colors.info;

  return `
<style>
  @keyframes ${prefix}-slide {
    0% { transform: translateX(100%); opacity: 0; }
    10% { transform: translateX(0); opacity: 1; }
    90% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(100%); opacity: 0; }
  }
  #${prefix}-toast {
    position: fixed; top: 20px; right: 20px; z-index: 2000;
    animation: ${prefix}-slide 3s ease forwards;
    pointer-events: none;
  }
</style>
<div id="${prefix}-toast" style="display:flex;align-items:center;gap:12px;padding:14px 20px;background:${tc.bg};border:1px solid ${tc.border};border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.12);font-family:${fontFamily};min-width:280px;">
  <span style="width:24px;height:24px;border-radius:50%;background:${tc.border};color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;flex-shrink:0;">${tc.icon}</span>
  <span style="font-size:14px;color:${tc.text};font-weight:500;">${message}</span>
</div>`;
}

/**
 * Dropdown 下拉菜单（纯 CSS）
 * @param {string} triggerText - 触发按钮文字
 * @param {Array} items - [{ label, icon?, danger? }]
 * @param {string} prefix - 唯一前缀
 */
function dropdown(triggerText, items, style = {}, prefix = 'dd') {
  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  return `
<style>
  #${prefix}-menu { display:none; position:absolute; top:100%; right:0; margin-top:4px; background:${c.surface || '#fff'}; border:1px solid ${c.border || '#e8e8e8'}; border-radius:10px; box-shadow:0 8px 24px rgba(0,0,0,0.12); min-width:180px; z-index:100; padding:4px; }
  #${prefix}-trigger:checked ~ #${prefix}-menu { display:block; }
  #${prefix}-trigger:checked ~ #${prefix}-btn { background:${c.surface || '#f5f5f7'}; }
</style>
<div style="position:relative;display:inline-block;">
  <input type="checkbox" id="${prefix}-trigger" style="display:none;">
  <label for="${prefix}-trigger" id="${prefix}-btn" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border:1px solid ${c.border || '#e8e8e8'};border-radius:8px;cursor:pointer;font-size:14px;color:${c.text || '#333'};background:${c.surface || '#fff'};font-family:${fontFamily};">
    ${triggerText}
    <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 5l3 3 3-3" stroke="currentColor" fill="none" stroke-width="1.5"/></svg>
  </label>
  <div id="${prefix}-menu">
    ${items.map(item => `
    <label for="${prefix}-trigger" style="display:flex;align-items:center;gap:8px;padding:8px 12px;cursor:pointer;font-size:14px;color:${item.danger ? (c.error || '#ef4444') : (c.text || '#333')};border-radius:6px;font-family:${fontFamily};">
      ${item.icon ? `<span>${item.icon}</span>` : ''}
      ${item.label}
    </label>`).join('')}
  </div>
</div>`;
}

module.exports = { tabSwitcher, accordion, modal, toast, dropdown };
