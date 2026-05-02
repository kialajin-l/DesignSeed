/**
 * DesignSeed — 复杂 UI 布局组件
 * Dashboard / Editor / Workshop / Settings / List / Detail 六种布局模式
 * 
 * v0.3 新增：追平 Huashu Design 的复杂 UI 组件能力
 */

/**
 * Dashboard 布局 — 侧边栏 + 主内容区 + 统计卡片
 */
function dashboardLayout(options = {}) {
  const {
    sidebar = { items: ['Dashboard', 'Projects', 'Settings'] },
    stats = [
      { label: 'Total Projects', value: '12', change: '+3' },
      { label: 'Active', value: '5', change: '+1' },
      { label: 'Completed', value: '7', change: '+2' },
    ],
    recentItems = [],
    style = {},
  } = options;

  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  const sidebarHtml = `
<div style="width:240px;background:${c.sidebar || '#1a1a2e'};color:${c.sidebarText || '#a0a0b8'};padding:24px 0;flex-shrink:0;display:flex;flex-direction:column;">
  <div style="padding:0 24px 32px;font-size:20px;font-weight:700;color:${c.sidebarActive || '#fff'};font-family:${fontFamily};">${sidebar.brand || 'App'}</div>
  ${sidebar.items.map((item, i) => `
  <a href="#" style="display:flex;align-items:center;gap:12px;padding:10px 24px;color:${i === 0 ? (c.sidebarActive || '#fff') : (c.sidebarText || '#a0a0b8')};text-decoration:none;font-size:14px;font-family:${fontFamily};background:${i === 0 ? (c.sidebarActiveBg || 'rgba(255,255,255,0.08)') : 'transparent'};border-left:${i === 0 ? `3px solid ${c.primary || '#6c63ff'}` : '3px solid transparent'};">
    ${item.icon ? `<span>${item.icon}</span>` : ''}
    <span>${typeof item === 'string' ? item : item.label}</span>
  </a>`).join('')}
</div>`;

  const statsHtml = stats.map(s => `
<div style="background:${c.surface || '#fff'};border-radius:12px;padding:20px 24px;border:1px solid ${c.border || '#e8e8e8'};">
  <div style="font-size:13px;color:${c.textSecondary || '#888'};font-family:${fontFamily};margin-bottom:8px;">${s.label}</div>
  <div style="display:flex;align-items:baseline;gap:8px;">
    <span style="font-size:28px;font-weight:700;color:${c.text || '#1a1a1a'};font-family:${fontFamily};">${s.value}</span>
    ${s.change ? `<span style="font-size:13px;color:${s.change.startsWith('+') ? (c.success || '#22c55e') : (c.error || '#ef4444')};font-family:${fontFamily};">${s.change}</span>` : ''}
  </div>
</div>`).join('');

  const recentHtml = recentItems.length > 0 ? `
<div style="background:${c.surface || '#fff'};border-radius:12px;border:1px solid ${c.border || '#e8e8e8'};overflow:hidden;">
  <div style="padding:16px 24px;border-bottom:1px solid ${c.border || '#e8e8e8'};font-size:16px;font-weight:600;color:${c.text || '#1a1a1a'};font-family:${fontFamily};">Recent</div>
  ${recentItems.map(item => `
  <div style="padding:12px 24px;border-bottom:1px solid ${c.border || '#e8e8e8'};display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="font-size:14px;font-weight:500;color:${c.text || '#1a1a1a'};font-family:${fontFamily};">${item.title}</div>
      <div style="font-size:12px;color:${c.textSecondary || '#888'};font-family:${fontFamily};margin-top:2px;">${item.subtitle || ''}</div>
    </div>
    <span style="font-size:12px;padding:4px 10px;border-radius:20px;background:${item.statusColor || (c.primary + '15') || '#f0f0f0'};color:${item.statusTextColor || c.primary || '#666'};font-family:${fontFamily};">${item.status || ''}</span>
  </div>`).join('')}
</div>` : '';

  return `
<div style="display:flex;height:100vh;font-family:${fontFamily};background:${c.background || '#f5f5f7'};">
  ${sidebarHtml}
  <div style="flex:1;padding:32px;overflow-y:auto;">
    <div style="font-size:24px;font-weight:700;color:${c.text || '#1a1a1a'};margin-bottom:24px;">Dashboard</div>
    <div style="display:grid;grid-template-columns:repeat(${stats.length}, 1fr);gap:16px;margin-bottom:32px;">
      ${statsHtml}
    </div>
    ${recentHtml}
  </div>
</div>`;
}

/**
 * Editor 布局 — 三栏（文件树 + 编辑器 + 预览）
 */
function editorLayout(options = {}) {
  const {
    files = [
      { name: 'index.html', active: true },
      { name: 'styles.css' },
      { name: 'app.js' },
    ],
    editorContent = '<div style="color:#666;font-family:monospace;font-size:14px;padding:20px;">// Your code here</div>',
    previewContent = '',
    style = {},
  } = options;

  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  return `
<div style="display:flex;height:100vh;font-family:${fontFamily};background:${c.background || '#1e1e1e'};">
  <!-- 文件树 -->
  <div style="width:220px;background:${c.sidebar || '#252526'};border-right:1px solid ${c.border || '#333'};padding:12px 0;flex-shrink:0;">
    <div style="padding:0 16px 12px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:${c.textSecondary || '#888'};font-family:${fontFamily};">Explorer</div>
    ${files.map(f => `
    <div style="padding:6px 16px 6px 24px;font-size:13px;color:${f.active ? (c.text || '#fff') : (c.textSecondary || '#999')};background:${f.active ? (c.activeBg || 'rgba(255,255,255,0.08)') : 'transparent'};font-family:'SF Mono', 'Fira Code', monospace;cursor:pointer;">
      ${f.name}
    </div>`).join('')}
  </div>
  <!-- 编辑器 -->
  <div style="flex:1;display:flex;flex-direction:column;">
    <div style="height:40px;background:${c.surface || '#2d2d2d'};border-bottom:1px solid ${c.border || '#333'};display:flex;align-items:center;padding:0 16px;">
      ${files.filter(f => f.active).map(f => `
      <div style="padding:8px 16px;font-size:13px;color:${c.text || '#fff'};border-bottom:2px solid ${c.primary || '#6c63ff'};font-family:${fontFamily};">${f.name}</div>`).join('')}
    </div>
    <div style="flex:1;overflow:auto;">${editorContent}</div>
  </div>
  <!-- 预览 -->
  ${previewContent ? `
  <div style="width:40%;border-left:1px solid ${c.border || '#333'};background:${c.surface || '#fff'};overflow:auto;">
    ${previewContent}
  </div>` : ''}
</div>`;
}

/**
 * Workshop 布局 — 主工作区 + 右侧属性面板
 */
function workshopLayout(options = {}) {
  const {
    title = 'Workshop',
    toolbar = [],
    mainContent = '',
    sidePanel = { title: 'Properties', content: '' },
    style = {},
  } = options;

  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  const toolbarHtml = toolbar.length > 0 ? `
<div style="height:48px;background:${c.surface || '#fff'};border-bottom:1px solid ${c.border || '#e8e8e8'};display:flex;align-items:center;padding:0 16px;gap:8px;">
  ${toolbar.map(item => `
  <button style="padding:6px 12px;border-radius:6px;border:1px solid ${c.border || '#e8e8e8'};background:${item.active ? (c.primary || '#6c63ff') : 'transparent'};color:${item.active ? '#fff' : (c.text || '#333')};font-size:13px;font-family:${fontFamily};cursor:pointer;">${item.label}</button>`).join('')}
</div>` : '';

  return `
<div style="display:flex;height:100vh;font-family:${fontFamily};background:${c.background || '#f5f5f7'};">
  <div style="flex:1;display:flex;flex-direction:column;">
    <div style="padding:16px 24px;background:${c.surface || '#fff'};border-bottom:1px solid ${c.border || '#e8e8e8'};">
      <div style="font-size:20px;font-weight:600;color:${c.text || '#1a1a1a'};">${title}</div>
    </div>
    ${toolbarHtml}
    <div style="flex:1;padding:24px;overflow-y:auto;">${mainContent}</div>
  </div>
  <div style="width:300px;background:${c.surface || '#fff'};border-left:1px solid ${c.border || '#e8e8e8'};padding:20px;overflow-y:auto;flex-shrink:0;">
    <div style="font-size:14px;font-weight:600;color:${c.text || '#1a1a1a'};margin-bottom:16px;">${sidePanel.title}</div>
    ${sidePanel.content}
  </div>
</div>`;
}

/**
 * Settings 布局 — 左侧分类导航 + 右侧设置表单
 */
function settingsLayout(options = {}) {
  const {
    categories = ['General', 'Appearance', 'Notifications', 'Account'],
    activeCategory = 'General',
    fields = [],
    style = {},
  } = options;

  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  const fieldsHtml = fields.map(f => {
    if (f.type === 'toggle') {
      return `
<div style="display:flex;align-items:center;justify-content:space-between;padding:16px 0;border-bottom:1px solid ${c.border || '#e8e8e8'};">
  <div>
    <div style="font-size:14px;font-weight:500;color:${c.text || '#1a1a1a'};font-family:${fontFamily};">${f.label}</div>
    ${f.description ? `<div style="font-size:12px;color:${c.textSecondary || '#888'};margin-top:4px;font-family:${fontFamily};">${f.description}</div>` : ''}
  </div>
  <div style="width:44px;height:24px;border-radius:12px;background:${f.value ? (c.primary || '#6c63ff') : (c.border || '#ccc')};position:relative;cursor:pointer;">
    <div style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:2px;${f.value ? 'right:2px' : 'left:2px'};box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div>
  </div>
</div>`;
    }
    if (f.type === 'select') {
      return `
<div style="padding:16px 0;border-bottom:1px solid ${c.border || '#e8e8e8'};">
  <div style="font-size:14px;font-weight:500;color:${c.text || '#1a1a1a'};margin-bottom:8px;font-family:${fontFamily};">${f.label}</div>
  <select style="width:100%;padding:8px 12px;border:1px solid ${c.border || '#e8e8e8'};border-radius:8px;font-size:14px;color:${c.text || '#333'};background:${c.surface || '#fff'};font-family:${fontFamily};">
    ${(f.options || []).map(o => `<option${o === f.value ? ' selected' : ''}>${o}</option>`).join('')}
  </select>
</div>`;
    }
    // text input
    return `
<div style="padding:16px 0;border-bottom:1px solid ${c.border || '#e8e8e8'};">
  <div style="font-size:14px;font-weight:500;color:${c.text || '#1a1a1a'};margin-bottom:8px;font-family:${fontFamily};">${f.label}</div>
  <input type="text" value="${f.value || ''}" placeholder="${f.placeholder || ''}" style="width:100%;padding:8px 12px;border:1px solid ${c.border || '#e8e8e8'};border-radius:8px;font-size:14px;color:${c.text || '#333'};background:${c.surface || '#fff'};font-family:${fontFamily};box-sizing:border-box;">
</div>`;
  }).join('');

  return `
<div style="display:flex;height:100vh;font-family:${fontFamily};background:${c.background || '#f5f5f7'};">
  <div style="width:240px;background:${c.surface || '#fff'};border-right:1px solid ${c.border || '#e8e8e8'};padding:24px 0;flex-shrink:0;">
    <div style="padding:0 24px 20px;font-size:18px;font-weight:600;color:${c.text || '#1a1a1a'};">Settings</div>
    ${categories.map(cat => `
    <a href="#" style="display:block;padding:8px 24px;font-size:14px;color:${cat === activeCategory ? (c.primary || '#6c63ff') : (c.text || '#333')};text-decoration:none;background:${cat === activeCategory ? (c.primary + '10' || '#f0f0ff') : 'transparent'};border-left:${cat === activeCategory ? `3px solid ${c.primary || '#6c63ff'}` : '3px solid transparent'};font-family:${fontFamily};">${cat}</a>`).join('')}
  </div>
  <div style="flex:1;padding:32px;overflow-y:auto;">
    <div style="max-width:640px;">
      <div style="font-size:20px;font-weight:600;color:${c.text || '#1a1a1a'};margin-bottom:24px;">${activeCategory}</div>
      ${fieldsHtml}
    </div>
  </div>
</div>`;
}

/**
 * List 布局 — 搜索栏 + 列表/网格切换 + 数据列表
 */
function listLayout(options = {}) {
  const {
    title = 'Items',
    searchPlaceholder = 'Search...',
    viewMode = 'list', // 'list' | 'grid'
    columns = ['Name', 'Status', 'Date', 'Actions'],
    rows = [],
    style = {},
  } = options;

  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  if (viewMode === 'grid') {
    return `
<div style="padding:32px;font-family:${fontFamily};background:${c.background || '#f5f5f7'};min-height:100vh;">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
    <div style="font-size:24px;font-weight:700;color:${c.text || '#1a1a1a'};">${title}</div>
    <div style="display:flex;gap:8px;">
      <input type="text" placeholder="${searchPlaceholder}" style="padding:8px 16px;border:1px solid ${c.border || '#e8e8e8'};border-radius:8px;font-size:14px;width:240px;font-family:${fontFamily};">
    </div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(280px, 1fr));gap:16px;">
    ${rows.map(row => `
    <div style="background:${c.surface || '#fff'};border-radius:12px;border:1px solid ${c.border || '#e8e8e8'};padding:20px;">
      ${row.image ? `<div style="width:100%;height:160px;background:${c.border || '#e8e8e8'};border-radius:8px;margin-bottom:12px;background-image:url(${row.image});background-size:cover;background-position:center;"></div>` : ''}
      <div style="font-size:16px;font-weight:600;color:${c.text || '#1a1a1a'};margin-bottom:4px;">${row.cells ? row.cells[0] : row.title}</div>
      <div style="font-size:13px;color:${c.textSecondary || '#888'};">${row.cells ? row.cells[1] : row.subtitle}</div>
    </div>`).join('')}
  </div>
</div>`;
  }

  return `
<div style="padding:32px;font-family:${fontFamily};background:${c.background || '#f5f5f7'};min-height:100vh;">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
    <div style="font-size:24px;font-weight:700;color:${c.text || '#1a1a1a'};">${title}</div>
    <div style="display:flex;gap:8px;">
      <input type="text" placeholder="${searchPlaceholder}" style="padding:8px 16px;border:1px solid ${c.border || '#e8e8e8'};border-radius:8px;font-size:14px;width:240px;font-family:${fontFamily};">
    </div>
  </div>
  <div style="background:${c.surface || '#fff'};border-radius:12px;border:1px solid ${c.border || '#e8e8e8'};overflow:hidden;">
    <div style="display:grid;grid-template-columns:${columns.map(() => '1fr').join(' ')};padding:12px 20px;border-bottom:1px solid ${c.border || '#e8e8e8'};background:${c.surface || '#fafafa'};">
      ${columns.map(col => `<div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:${c.textSecondary || '#888'};">${col}</div>`).join('')}
    </div>
    ${rows.map(row => `
    <div style="display:grid;grid-template-columns:${columns.map(() => '1fr').join(' ')};padding:14px 20px;border-bottom:1px solid ${c.border || '#e8e8e8'};align-items:center;">
      ${(row.cells || []).map(cell => `<div style="font-size:14px;color:${c.text || '#333'};">${cell}</div>`).join('')}
    </div>`).join('')}
  </div>
</div>`;
}

/**
 * Detail 布局 — 详情页（标题 + 元信息 + 内容 + 侧边操作栏）
 */
function detailLayout(options = {}) {
  const {
    title = 'Detail',
    meta = [],
    content = '',
    actions = [],
    style = {},
  } = options;

  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  return `
<div style="display:flex;height:100vh;font-family:${fontFamily};background:${c.background || '#f5f5f7'};">
  <div style="flex:1;padding:40px;overflow-y:auto;">
    <div style="max-width:720px;">
      <div style="font-size:28px;font-weight:700;color:${c.text || '#1a1a1a'};margin-bottom:8px;">${title}</div>
      ${meta.length > 0 ? `
      <div style="display:flex;gap:16px;margin-bottom:24px;">
        ${meta.map(m => `<div style="font-size:13px;color:${c.textSecondary || '#888'};">${m.label}: <span style="color:${c.text || '#333'};">${m.value}</span></div>`).join('')}
      </div>` : ''}
      <div style="background:${c.surface || '#fff'};border-radius:12px;border:1px solid ${c.border || '#e8e8e8'};padding:24px;font-size:15px;line-height:1.7;color:${c.text || '#333'};">
        ${content}
      </div>
    </div>
  </div>
  ${actions.length > 0 ? `
  <div style="width:280px;background:${c.surface || '#fff'};border-left:1px solid ${c.border || '#e8e8e8'};padding:24px;flex-shrink:0;">
    <div style="font-size:14px;font-weight:600;color:${c.text || '#1a1a1a'};margin-bottom:16px;">Actions</div>
    ${actions.map(a => `
    <button style="width:100%;padding:10px 16px;border-radius:8px;border:${a.variant === 'danger' ? `1px solid ${c.error || '#ef4444'}` : 'none'};background:${a.variant === 'danger' ? 'transparent' : (a.primary ? (c.primary || '#6c63ff') : (c.surface || '#f5f5f7'))};color:${a.variant === 'danger' ? (c.error || '#ef4444') : (a.primary ? '#fff' : (c.text || '#333'))};font-size:14px;font-family:${fontFamily};cursor:pointer;margin-bottom:8px;">${a.label}</button>`).join('')}
  </div>` : ''}
</div>`;
}

module.exports = {
  dashboardLayout,
  editorLayout,
  workshopLayout,
  settingsLayout,
  listLayout,
  detailLayout,
};
