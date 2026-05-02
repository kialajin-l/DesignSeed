/**
 * DesignSeed — 设计方向顾问
 * 20+ 种设计哲学，需求模糊时引导用户选择方向
 * 
 * v0.3 新增：追平 Huashu Design 的设计方向顾问能力
 * 参考：Pentagram / Field.io / Kenya Hara / Sagmeister 等顶级设计工作室
 */

const DESIGN_PHILOSOPHIES = [
  // ─── 信息建筑派 ───
  {
    id: 'pentagram',
    name: 'Pentagram 信息建筑',
    school: '信息建筑',
    description: '以清晰的信息层级为核心，用网格系统和留白构建视觉秩序。设计为信息服务，不为装饰。',
    traits: ['极简', '网格', '留白', '层级清晰'],
    color: '#000000',
    typography: '衬线体 + 无衬线体混排',
    layout: '严格网格，大量留白',
    bestFor: ['企业官网', '数据仪表盘', '文档系统'],
    tone: { formality: 0.9, warmth: 0.3, complexity: 0.3, innovation: 0.4 },
    example: 'Apple.com 的产品页面',
  },
  {
    id: 'swiss',
    name: '瑞士国际主义',
    school: '信息建筑',
    description: '数学般的精确排版，网格即一切。Helvetica 的精神家园。',
    traits: ['网格', '精确', '无装饰', 'Helvetica'],
    color: '#000000',
    typography: 'Helvetica / Akzidenz-Grotesk',
    layout: '严格数学网格',
    bestFor: ['学术', '政府', '金融'],
    tone: { formality: 0.95, warmth: 0.1, complexity: 0.2, innovation: 0.3 },
    example: '瑞士航空的视觉系统',
  },
  {
    id: 'bauhaus',
    name: '包豪斯功能主义',
    school: '信息建筑',
    description: '形式追随功能。每一个视觉元素都必须有存在的理由。',
    traits: ['功能主义', '几何', '原色', '无衬线'],
    color: '#E63946',
    typography: 'Futura / DIN',
    layout: '几何网格，原色色块',
    bestFor: ['教育', '工具类应用', '建筑'],
    tone: { formality: 0.7, warmth: 0.2, complexity: 0.3, innovation: 0.5 },
    example: '包豪斯学院的海报设计',
  },

  // ─── 运动诗学派 ───
  {
    id: 'field',
    name: 'Field.io 运动诗学',
    school: '运动诗学',
    description: '设计是时间的艺术。微动效、缓动曲线、帧级控制构成体验的韵律。',
    traits: ['微动效', '缓动', '时间轴', '帧级控制'],
    color: '#6366f1',
    typography: 'Inter / SF Pro',
    layout: '流动网格，响应式',
    bestFor: ['交互原型', '产品演示', '创意工具'],
    tone: { formality: 0.3, warmth: 0.5, complexity: 0.7, innovation: 0.9 },
    example: 'Stripe 的支付流程动画',
  },
  {
    id: 'motion',
    name: 'Google Material Motion',
    school: '运动诗学',
    description: '运动有物理意义——它告诉用户"发生了什么"和"接下来去哪"。',
    traits: ['物理隐喻', '共享轴', '容器变换', '涟漪'],
    color: '#1a73e8',
    typography: 'Roboto / Google Sans',
    layout: 'Material Design 网格',
    bestFor: ['Android 应用', 'Web 应用', '跨平台'],
    tone: { formality: 0.4, warmth: 0.5, complexity: 0.5, innovation: 0.6 },
    example: 'Google 的 Material Design 系统',
  },

  // ─── 东方极简派 ───
  {
    id: 'hara',
    name: 'Kenya Hara 东方极简',
    school: '东方极简',
    description: '白不是空，是满的可能性。用最少的元素传达最丰富的意境。',
    traits: ['留白', '呼吸感', '自然材质', '克制'],
    color: '#F5F5F0',
    typography: 'Noto Sans / 思源黑体',
    layout: '大量留白，内容居中',
    bestFor: ['生活方式品牌', '茶/花/禅', '高端产品'],
    tone: { formality: 0.6, warmth: 0.7, complexity: 0.2, innovation: 0.4 },
    example: '无印良品的产品目录',
  },
  {
    id: 'wabi',
    name: '侘寂美学',
    school: '东方极简',
    description: '不完美中的完美。接受无常，在朴素中发现深层的美。',
    traits: ['不规则', '自然纹理', '朴素', '手作感'],
    color: '#8B7355',
    typography: '手写体 + 衬线体',
    layout: '非对称，有机形态',
    bestFor: ['手工艺品牌', '独立咖啡馆', '艺术展览'],
    tone: { formality: 0.3, warmth: 0.9, complexity: 0.4, innovation: 0.5 },
    example: '京都老铺的品牌设计',
  },

  // ─── 实验先锋派 ───
  {
    id: 'sagmeister',
    name: 'Sagmeister 实验先锋',
    school: '实验先锋',
    description: '打破一切规则。设计应该让人停下来思考，而不是舒适地滑过。',
    traits: ['大胆', '挑衅', '非常规排版', '概念驱动'],
    color: '#FF0000',
    typography: '任意，非常规排版',
    layout: '打破网格，非常规',
    bestFor: ['艺术展览', '音乐专辑', '创意机构'],
    tone: { formality: 0.1, warmth: 0.4, complexity: 0.9, innovation: 1.0 },
    example: 'Sagmeister & Walsh 的作品集',
  },
  {
    id: 'brutalism',
    name: '数字野兽主义',
    school: '实验先锋',
    description: '故意的"丑"是对过度设计的反叛。裸露的结构，原始的美。',
    traits: ['裸露HTML', '系统字体', '无装饰', '反设计'],
    color: '#0000FF',
    typography: '系统字体 / Courier',
    layout: '无网格，原始HTML结构',
    bestFor: ['个人博客', '独立开发者', '反主流文化'],
    tone: { formality: 0.05, warmth: 0.2, complexity: 0.6, innovation: 0.9 },
    example: 'Craigslist / Bloomberg',
  },
  {
    id: 'glitch',
    name: '故障美学',
    school: '实验先锋',
    description: '数字世界的"错误"也是一种美。像素错位、色彩分离、扫描线。',
    traits: ['故障效果', '像素化', '色彩分离', '赛博朋克'],
    color: '#FF00FF',
    typography: '等宽字体 / 像素字体',
    layout: '错位网格，叠加',
    bestFor: ['游戏', '音乐', '科技亚文化'],
    tone: { formality: 0.05, warmth: 0.2, complexity: 0.9, innovation: 0.95 },
    example: ' vaporwave 视觉文化',
  },

  // ─── 温暖人文派 ───
  {
    id: 'warm',
    name: '温暖人文主义',
    school: '温暖人文',
    description: '技术为人服务。圆角、暖色、手写元素让界面有温度。',
    traits: ['圆角', '暖色', '手写', '亲切'],
    color: '#F59E0B',
    typography: '圆体 / 手写体',
    layout: '宽松间距，圆角卡片',
    bestFor: ['教育', '健康', '社交', '儿童'],
    tone: { formality: 0.2, warmth: 0.95, complexity: 0.3, innovation: 0.3 },
    example: 'Notion / Linear 的温暖变体',
  },
  {
    id: 'organic',
    name: '有机自然主义',
    school: '温暖人文',
    description: '从自然中学习设计。渐变如日落，曲线如河流，纹理如树皮。',
    traits: ['自然渐变', '有机曲线', '大地色', '纹理'],
    color: '#059669',
    typography: '圆体 + 衬线体',
    layout: '有机网格，曲线分隔',
    bestFor: ['环保品牌', '食品', '旅游', '健康'],
    tone: { formality: 0.2, warmth: 0.9, complexity: 0.4, innovation: 0.4 },
    example: 'Patagonia 的品牌设计',
  },

  // ─── 科技未来派 ───
  {
    id: 'cyber',
    name: '赛博朋克',
    school: '科技未来',
    description: '霓虹灯、全息投影、暗色背景。高科技，低生活。',
    traits: ['霓虹', '暗色', '全息', '扫描线'],
    color: '#00FFFF',
    typography: '等宽字体 / 科技感无衬线',
    layout: '暗色背景，霓虹高亮',
    bestFor: ['游戏', '加密货币', '科技产品'],
    tone: { formality: 0.2, warmth: 0.1, complexity: 0.8, innovation: 0.8 },
    example: 'Cyberpunk 2077 的 UI',
  },
  {
    id: 'glassmorphism',
    name: '玻璃拟态',
    school: '科技未来',
    description: '毛玻璃效果、半透明层、模糊背景。轻盈而有层次。',
    traits: ['毛玻璃', '半透明', '模糊', '层次'],
    color: '#6366f1',
    typography: 'SF Pro / Inter',
    layout: '层叠卡片，模糊背景',
    bestFor: ['macOS 应用', '现代 Web', '仪表盘'],
    tone: { formality: 0.4, warmth: 0.4, complexity: 0.6, innovation: 0.7 },
    example: 'macOS Big Sur 的界面',
  },
  {
    id: 'neumorphism',
    name: '新拟态',
    school: '科技未来',
    description: '柔和的凸起和凹陷，像真实的物理按钮。介于扁平和拟物之间。',
    traits: ['柔和阴影', '凸起', '凹陷', '单色'],
    color: '#E0E5EC',
    typography: 'SF Pro / Inter',
    layout: '单色背景，柔和阴影',
    bestFor: ['控制面板', '计算器', '音乐播放器'],
    tone: { formality: 0.4, warmth: 0.5, complexity: 0.5, innovation: 0.6 },
    example: 'Dribbble 上的新拟态设计',
  },

  // ─── 极致排版派 ───
  {
    id: 'typography',
    name: '极致排版主义',
    school: '极致排版',
    description: '字体就是设计。超大字号、极端对比、排版即视觉。',
    traits: ['超大字号', '极端对比', '排版即视觉', '少图或无图'],
    color: '#1a1a1a',
    typography: '衬线体 / 超大无衬线体',
    layout: '排版驱动，少装饰',
    bestFor: ['杂志', '新闻', '文学', '时尚'],
    tone: { formality: 0.7, warmth: 0.3, complexity: 0.5, innovation: 0.5 },
    example: '纽约时报的数字版',
  },
  {
    id: 'editorial',
    name: '编辑设计',
    school: '极致排版',
    description: '像杂志一样排版网页。图文混排、分栏、引用块、脚注。',
    traits: ['分栏', '图文混排', '引用', '脚注'],
    color: '#1a1a1a',
    typography: '衬线体正文 + 无衬线标题',
    layout: '多栏编辑网格',
    bestFor: ['博客', '文档', '新闻', '学术'],
    tone: { formality: 0.7, warmth: 0.4, complexity: 0.6, innovation: 0.3 },
    example: 'Medium 的阅读体验',
  },

  // ─── 数据驱动派 ───
  {
    id: 'data',
    name: '数据可视化主义',
    school: '数据驱动',
    description: '数据即设计。用图表、热力图、时间线替代文字描述。',
    traits: ['图表', '热力图', '时间线', '数据密度'],
    color: '#3b82f6',
    typography: '等宽字体 + 无衬线',
    layout: '仪表盘网格，高数据密度',
    bestFor: ['数据分析', '监控', '金融', '科研'],
    tone: { formality: 0.6, warmth: 0.2, complexity: 0.8, innovation: 0.5 },
    example: 'Grafana / Datadog 的仪表盘',
  },

  // ─── 品牌叙事派 ───
  {
    id: 'storytelling',
    name: '品牌叙事主义',
    school: '品牌叙事',
    description: '每个页面都是一个故事。滚动驱动叙事，视差效果，章节式布局。',
    traits: ['滚动叙事', '视差', '章节', '沉浸'],
    color: '#8b5cf6',
    typography: '衬线体 + 大图',
    layout: '全屏章节，滚动驱动',
    bestFor: ['品牌故事', '产品发布', '年报', '个人作品集'],
    tone: { formality: 0.5, warmth: 0.7, complexity: 0.6, innovation: 0.6 },
    example: 'Apple 的产品发布页',
  },
];

/**
 * 获取所有设计哲学
 */
function getAllPhilosophies() {
  return DESIGN_PHILOSOPHIES;
}

/**
 * 按风格流派分组
 */
function getPhilosophiesBySchool() {
  const schools = {};
  DESIGN_PHILOSOPHIES.forEach(p => {
    if (!schools[p.school]) schools[p.school] = [];
    schools[p.school].push(p);
  });
  return schools;
}

/**
 * 根据需求描述推荐 3 个差异化方向
 * @param {string} description - 需求描述
 * @param {object} preferences - 用户偏好 { formality?, warmth?, complexity?, innovation? }
 * @returns {Array} 推荐的 3 个设计哲学
 */
function recommendPhilosophies(description, preferences = {}) {
  const desc = description.toLowerCase();

  // 关键词匹配
  const keywords = {
    corporate: ['pentagram', 'swiss', 'typography'],
    startup: ['field', 'glassmorphism', 'storytelling'],
    creative: ['sagmeister', 'glitch', 'brutalism'],
    minimal: ['hara', 'pentagram', 'wabi'],
    tech: ['cyber', 'glassmorphism', 'data'],
    warm: ['warm', 'organic', 'wabi'],
    data: ['data', 'pentagram', 'swiss'],
    brand: ['storytelling', 'warm', 'editorial'],
    game: ['cyber', 'glitch', 'sagmeister'],
    education: ['warm', 'bauhaus', 'organic'],
  };

  let candidates = new Set();
  for (const [key, ids] of Object.entries(keywords)) {
    if (desc.includes(key)) {
      ids.forEach(id => candidates.add(id));
    }
  }

  // 如果没有匹配，用偏好选择
  if (candidates.size === 0 && Object.keys(preferences).length > 0) {
    const scored = DESIGN_PHILOSOPHIES.map(p => {
      let score = 0;
      if (preferences.formality !== undefined) score += 1 - Math.abs(p.tone.formality - preferences.formality);
      if (preferences.warmth !== undefined) score += 1 - Math.abs(p.tone.warmth - preferences.warmth);
      if (preferences.complexity !== undefined) score += 1 - Math.abs(p.tone.complexity - preferences.complexity);
      if (preferences.innovation !== undefined) score += 1 - Math.abs(p.tone.innovation - preferences.innovation);
      return { id: p.id, score };
    }).sort((a, b) => b.score - a.score);
    scored.slice(0, 3).forEach(s => candidates.add(s.id));
  }

  // 如果还是没有，选 3 个差异最大的
  if (candidates.size === 0) {
    return [DESIGN_PHILOSOPHIES[0], DESIGN_PHILOSOPHIES[5], DESIGN_PHILOSOPHIES[9]];
  }

  return [...candidates].slice(0, 3).map(id => DESIGN_PHILOSOPHIES.find(p => p.id === id)).filter(Boolean);
}

/**
 * 生成设计方向推荐卡片
 * @param {string} description - 需求描述
 * @param {object} preferences - 用户偏好
 * @param {object} style - 风格配置
 */
function recommendationCards(description, preferences = {}, style = {}) {
  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';
  const recs = recommendPhilosophies(description, preferences);

  return recs.map((p, i) => `
<div style="background:${c.surface || '#fff'};border-radius:16px;border:2px solid ${i === 0 ? (c.primary || '#6c63ff') : (c.border || '#e8e8e8')};padding:24px;flex:1;">
  ${i === 0 ? `<div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:${c.primary || '#6c63ff'};margin-bottom:12px;font-family:${fontFamily};">推荐</div>` : ''}
  <div style="width:40px;height:40px;border-radius:10px;background:${p.color}20;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
    <div style="width:20px;height:20px;border-radius:50%;background:${p.color};"></div>
  </div>
  <div style="font-size:18px;font-weight:600;color:${c.text || '#1a1a1a'};margin-bottom:4px;font-family:${fontFamily};">${p.name}</div>
  <div style="font-size:12px;color:${c.textSecondary || '#888'};margin-bottom:12px;font-family:${fontFamily};">${p.school}</div>
  <div style="font-size:14px;color:${c.textSecondary || '#666'};line-height:1.6;margin-bottom:16px;font-family:${fontFamily};">${p.description}</div>
  <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;">
    ${p.traits.map(tr => `<span style="padding:4px 10px;border-radius:20px;background:${c.primary || '#6c63ff'}10;color:${c.primary || '#6c63ff'};font-size:12px;font-family:${fontFamily};">${tr}</span>`).join('')}
  </div>
  <div style="font-size:12px;color:${c.textSecondary || '#888'};font-family:${fontFamily};">
    <strong>适合：</strong>${p.bestFor.join(' · ')}
  </div>
  <div style="font-size:12px;color:${c.textSecondary || '#888'};margin-top:8px;font-family:${fontFamily};font-style:italic;">
    例：${p.example}
  </div>
</div>`).join('\n');
}

module.exports = { DESIGN_PHILOSOPHIES, getAllPhilosophies, getPhilosophiesBySchool, recommendPhilosophies, recommendationCards };
