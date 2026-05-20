/**
 * 小红书笔记卡片模板
 * 
 * 典型布局：编号步骤 + 箭头流程 + 贴纸装饰
 * 适用场景：教程、使用指南、步骤说明
 * 
 * 区域结构：
 *   ┌─────────────────────────────┐
 *   │  标题区 + 装饰贴纸          │  20% 高度
 *   ├────┬────┬────┬────┬────────┤
 *   │ 01 │ →  │ 02 │ →  │ 03    │  55% 高度
 *   │步骤│    │步骤│    │步骤   │
 *   ├────┴────┴────┴────┴────────┤
 *   │        总结/引用            │  25% 高度
 *   └─────────────────────────────┘
 */

const template = {
  id: 'xiaohongshu-note',
  name: '小红书笔记',
  description: '编号步骤 + 箭头流程，适合教程和使用指南',
  canvas: { width: 1440, height: 810 },

  defaultColors: {
    background: '#FFF5F5',
    surface: '#ffffff',
    primary: '#FF6B6B',
    text: '#333333',
    textSecondary: '#888888',
    textOnBg: '#ffffff',
    border: '#FFE0E0',
    accent: '#FFB347',
    stepBg: '#FFF0F0',
    arrowColor: '#FFB3B3',
  },

  zones: [
    {
      id: 'header',
      type: 'text',
      position: { x: 0, y: 0, w: 100, h: 20 },
      style: {
        padding: '30px 40px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      },
      fields: [
        { key: 'numberBadge', type: 'text', placeholder: '01', style: { fontSize: '14px', fontWeight: '700', color: '#FF6B6B', background: '#FFE8E8', padding: '6px 14px', borderRadius: '20px', display: 'inline-block' } },
        { key: 'title', type: 'text', placeholder: '教程标题', style: { fontSize: '32px', fontWeight: '900', color: '#333333', lineHeight: '1.3' } },
      ],
      slots: [
        { type: 'sticker', tags: ['cute', 'love', 'star', 'decoration'], max: 3, position: 'around' },
      ],
    },
    {
      id: 'steps',
      type: 'grid',
      position: { x: 0, y: 20, w: 100, h: 55 },
      style: {
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0',
      },
      cardStyle: {
        background: '#FFFFFF',
        borderRadius: '20px',
        padding: '24px 20px',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(255,107,107,0.1)',
        border: '2px dashed #FFD0D0',
        width: '220px',
        flexShrink: '0',
        position: 'relative',
      },
      cardFields: [
        { key: 'number', type: 'text', placeholder: '01', style: { fontSize: '24px', fontWeight: '900', color: '#FF6B6B', marginBottom: '8px' } },
        { key: 'label', type: 'text', placeholder: '步骤名', style: { fontSize: '16px', fontWeight: '700', color: '#333', marginBottom: '6px' } },
        { key: 'desc', type: 'text', placeholder: '描述', style: { fontSize: '12px', color: '#888', lineHeight: '1.4' } },
      ],
      arrow: { symbol: '→', color: '#FFB3B3', fontSize: '28px' },
      minCards: 3,
      maxCards: 5,
      defaultCards: 3,
      slots: [
        { type: 'icon', tags: ['step', 'process', 'check'], max: 5, position: 'card-top' },
      ],
    },
    {
      id: 'footer',
      type: 'quote',
      position: { x: 0, y: 75, w: 100, h: 25 },
      style: {
        padding: '20px 40px 30px',
        textAlign: 'center',
        borderTop: '2px dashed #FFD0D0',
      },
      fields: [
        { key: 'summary', type: 'text', placeholder: '总结文字', style: { fontSize: '15px', color: '#666', lineHeight: '1.5', maxWidth: '600px', margin: '0 auto' } },
        { key: 'tags', type: 'text', placeholder: '#标签1 #标签2', style: { fontSize: '13px', color: '#FF6B6B', marginTop: '10px', fontWeight: '500' } },
      ],
    },
  ],

  fill(prompt, colors = {}) {
    const segments = prompt.split(/[，,。！？\n]+/).map(s => s.trim()).filter(Boolean);

    const title = segments[0] || '使用教程';
    const summary = segments.find(s => /总结|结论|核心|关键|跟着做/.test(s)) || '跟着做就对了！';
    const tags = segments.find(s => /#/.test(s)) || '#教程 #分享';

    const stepSegments = segments.filter(s => /[：:]/.test(s) || /^\d+[.、]/.test(s));
    const steps = stepSegments.slice(0, 5).map((s, i) => {
      const parts = s.split(/[：:]/);
      return {
        number: String(i + 1).padStart(2, '0'),
        label: parts[0].replace(/^\d+[.、]\s*/, '').trim(),
        desc: (parts[1] || '').trim(),
      };
    });

    while (steps.length < 3 && steps.length < segments.length - 2) {
      const remaining = segments.filter(s =>
        !stepSegments.includes(s) && s !== title && s !== summary && s !== tags && !/#/.test(s)
      );
      if (remaining.length === 0) break;
      const s = remaining.shift();
      steps.push({
        number: String(steps.length + 1).padStart(2, '0'),
        label: s,
        desc: '',
      });
    }

    while (steps.length < 3) {
      steps.push({
        number: String(steps.length + 1).padStart(2, '0'),
        label: '步骤 ' + (steps.length + 1),
        desc: '描述',
      });
    }

    return {
      header: { numberBadge: '01', title },
      steps: { cards: steps },
      footer: { summary, tags },
    };
  },
};

module.exports = template;
