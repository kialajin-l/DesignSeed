/**
 * 公众号封面卡片模板
 * 
 * 典型布局：Hero大标题 + 底部功能网格
 * 适用场景：产品更新、技术文章、公众号推送封面
 * 
 * 区域结构：
 *   ┌─────────────────────────────┐
 *   │         Hero 区域           │  40% 高度
 *   │   大标题 + 副标题 + 装饰    │
 *   ├─────────┬─────────┬─────────┤
 *   │  功能1  │  功能2  │  功能3  │  35% 高度
 *   │ icon+文 │ icon+文 │ icon+文 │
 *   ├─────────┴─────────┴─────────┤
 *   │        引用/总结区域         │  25% 高度
 *   └─────────────────────────────┘
 */

const template = {
  id: 'wechat-cover',
  name: '公众号封面',
  description: '大标题 + 底部功能网格，适合产品更新和技术文章',
  canvas: { width: 900, height: 1200 },

  defaultColors: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    surface: '#ffffff',
    primary: '#667eea',
    text: '#1a1a1a',
    textSecondary: '#666666',
    textOnBg: '#ffffff',
    border: '#e8e8e8',
    accent: '#f093fb',
  },

  zones: [
    {
      id: 'hero',
      type: 'text',
      position: { x: 0, y: 0, w: 100, h: 40 },
      style: {
        padding: '60px 40px 40px',
        textAlign: 'center',
      },
      fields: [
        { key: 'badge', type: 'text', placeholder: '版本号/标签', style: { fontSize: '14px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', display: 'inline-block', padding: '6px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.2)' } },
        { key: 'title', type: 'text', placeholder: '主标题', style: { fontSize: '42px', fontWeight: '800', lineHeight: '1.2', marginBottom: '12px' } },
        { key: 'subtitle', type: 'text', placeholder: '副标题', style: { fontSize: '18px', fontWeight: '400', opacity: '0.85', lineHeight: '1.5' } },
      ],
      slots: [
        { type: 'decoration', tags: ['badge', 'version', 'tech'], max: 2, position: 'top-right' },
      ],
    },
    {
      id: 'feature-grid',
      type: 'grid',
      position: { x: 0, y: 40, w: 100, h: 35 },
      style: {
        padding: '20px 30px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '16px',
      },
      cardStyle: {
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '16px',
        padding: '24px 20px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      },
      cardFields: [
        { key: 'icon', type: 'icon', style: { fontSize: '36px', marginBottom: '12px', display: 'block' } },
        { key: 'label', type: 'text', placeholder: '功能名', style: { fontSize: '15px', fontWeight: '700', color: '#1a1a1a', marginBottom: '6px' } },
        { key: 'desc', type: 'text', placeholder: '描述', style: { fontSize: '12px', color: '#666', lineHeight: '1.4' } },
      ],
      minCards: 2,
      maxCards: 4,
      defaultCards: 3,
      slots: [
        { type: 'icon', tags: ['feature', 'function', 'tool'], max: 4, position: 'card-top' },
      ],
    },
    {
      id: 'quote',
      type: 'quote',
      position: { x: 0, y: 75, w: 100, h: 25 },
      style: {
        padding: '30px 40px',
        textAlign: 'center',
      },
      fields: [
        { key: 'quoteText', type: 'text', placeholder: '引用/总结文字', style: { fontSize: '16px', fontStyle: 'italic', lineHeight: '1.6', maxWidth: '700px', margin: '0 auto', position: 'relative', paddingLeft: '20px', borderLeft: '4px solid rgba(255,255,255,0.5)' } },
        { key: 'author', type: 'text', placeholder: '来源/作者', style: { fontSize: '13px', marginTop: '12px', opacity: '0.7' } },
      ],
    },
  ],

  fill(prompt, colors = {}) {
    const segments = prompt.split(/[，,。！？\n]+/).map(s => s.trim()).filter(Boolean);

    const title = segments[0] || 'DesignSeed';
    const subtitle = segments[1] || '会生长的 AI 设计系统';
    const badge = segments.find(s => /v\d|版本|更新|release/i.test(s)) || '';

    const featureSegments = segments.filter(s => /[：:—\-]/.test(s));
    const features = featureSegments.slice(0, 4).map(s => {
      const parts = s.split(/[：:—\-]/);
      return { label: parts[0].trim(), desc: (parts[1] || '').trim() };
    });

    while (features.length < 3 && features.length < segments.length) {
      const remaining = segments.filter(s => !featureSegments.includes(s) && s !== title && s !== subtitle && s !== badge);
      if (remaining.length === 0) break;
      features.push({ label: remaining.shift(), desc: '' });
    }

    while (features.length < 3) {
      features.push({ label: '功能 ' + (features.length + 1), desc: '描述' });
    }

    return {
      hero: { badge, title, subtitle },
      'feature-grid': { cards: features.slice(0, 4) },
      quote: {
        quoteText: segments.find(s => /总结|结论|核心/.test(s)) || '持续进化的设计系统',
        author: 'DesignSeed',
      },
    };
  },
};

module.exports = template;
