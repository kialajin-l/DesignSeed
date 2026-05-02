/**
 * DesignSeed — 反 AI Slop 机制
 * 检查并防止生成"AI 味"过重的设计
 * 
 * v0.3 新增：参考 Huashu Design 的反 AI slop 清单
 * 核心原则：每个渐变/emoji/圆角 border accent 之前先问——这真的必要吗？
 */

/**
 * AI Slop 检查规则
 */
const SLOP_RULES = [
  {
    id: 'unnecessary-gradient',
    name: '不必要的渐变',
    description: '纯色就能解决的地方不要用渐变',
    severity: 'warning',
    check: (html) => {
      const gradients = (html.match(/linear-gradient|radial-gradient/g) || []).length;
      const hasManyElements = html.length > 5000;
      if (gradients > 3 && !hasManyElements) return { pass: false, count: gradients };
      return { pass: true };
    },
    fix: '减少渐变数量，优先使用纯色。渐变只在有明确视觉目的时使用（如模拟光照、引导视线）。',
  },
  {
    id: 'emoji-overload',
    name: 'Emoji 过载',
    description: '标题和按钮里堆砌 emoji',
    severity: 'warning',
    check: (html) => {
      const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
      const emojis = (html.match(emojiRegex) || []).length;
      if (emojis > 5) return { pass: false, count: emojis };
      return { pass: true };
    },
    fix: '移除标题和按钮中的 emoji。如果需要图标，使用 SVG 或图标字体。',
  },
  {
    id: 'rainbow-border',
    name: '彩虹边框',
    description: 'border 上用渐变色',
    severity: 'info',
    check: (html) => {
      if (html.includes('border-image') && html.includes('gradient')) return { pass: false };
      return { pass: true };
    },
    fix: '用实色边框或 box-shadow 替代 border-image 渐变。',
  },
  {
    id: 'excessive-border-radius',
    name: '过度圆角',
    description: '所有元素都是大圆角',
    severity: 'info',
    check: (html) => {
      const radii = (html.match(/border-radius:\s*(\d+)px/g) || []).map(r => parseInt(r.match(/\d+/)[0]));
      const bigRadii = radii.filter(r => r > 20);
      if (bigRadii.length > radii.length * 0.5 && radii.length > 3) return { pass: false, count: bigRadii.length };
      return { pass: true };
    },
    fix: '减少大圆角的使用。建议：按钮 8px，卡片 12px，模态框 16px。不是所有东西都需要 24px+。',
  },
  {
    id: 'glassmorphism-everywhere',
    name: '到处毛玻璃',
    description: '每个卡片都加 backdrop-filter: blur',
    severity: 'warning',
    check: (html) => {
      const blurs = (html.match(/backdrop-filter.*blur/g) || []).length;
      if (blurs > 3) return { pass: false, count: blurs };
      return { pass: true };
    },
    fix: '毛玻璃效果只用在需要"穿透"背景的场景（如浮动导航、模态框遮罩）。普通卡片不需要。',
  },
  {
    id: 'placeholder-text',
    name: '占位文字',
    description: '使用 Lorem ipsum 或 "点击这里"',
    severity: 'error',
    check: (html) => {
      const lower = html.toLowerCase();
      if (lower.includes('lorem ipsum') || lower.includes('click here') || lower.includes('learn more')) {
        return { pass: false };
      }
      return { pass: true };
    },
    fix: '使用真实的、有意义的文案。即使是 placeholder，也应该模拟真实内容的长度和语调。',
  },
  {
    id: 'too-many-shadows',
    name: '阴影过重',
    description: 'box-shadow 过大或过多',
    severity: 'info',
    check: (html) => {
      const heavyShadows = (html.match(/box-shadow:.*(?:4[0-9]|[5-9]\d|\d{3,})px/g) || []).length;
      if (heavyShadows > 2) return { pass: false, count: heavyShadows };
      return { pass: true };
    },
    fix: '使用轻量阴影：0 1px 3px rgba(0,0,0,0.1) 用于卡片，0 4px 12px rgba(0,0,0,0.08) 用于弹出层。避免超过 20px 的大阴影。',
  },
  {
    id: 'centered-everything',
    name: '一切居中',
    description: '所有文本和元素都 text-align: center',
    severity: 'info',
    check: (html) => {
      const centers = (html.match(/text-align:\s*center/g) || []).length;
      if (centers > 5) return { pass: false, count: centers };
      return { pass: true };
    },
    fix: '正文和长文本应该左对齐（或右对齐用于 RTL）。居中只用于标题、CTA、短文本。',
  },
  {
    id: 'neon-colors',
    name: '霓虹色滥用',
    description: '使用高饱和度的霓虹色作为主色',
    severity: 'warning',
    check: (html) => {
      const neonColors = html.match(/#(?:00ff00|ff00ff|00ffff|ff0000|ffff00)/gi) || [];
      if (neonColors.length > 0) return { pass: false, count: neonColors.length };
      return { pass: true };
    },
    fix: '降低饱和度。用 #22c55e 代替 #00ff00，用 #8b5cf6 代替 #ff00ff。霓虹色只在深色背景上小面积使用。',
  },
  {
    id: 'inconsistent-spacing',
    name: '间距不一致',
    description: 'padding/margin 值随意，没有使用倍数系统',
    severity: 'warning',
    check: (html) => {
      const paddings = (html.match(/padding:\s*(\d+)px/g) || []).map(p => parseInt(p.match(/\d+/)[0]));
      const uniquePaddings = new Set(paddings);
      // 如果有超过 8 种不同的 padding 值，可能不一致
      if (uniquePaddings.size > 8 && paddings.length > 10) return { pass: false, count: uniquePaddings.size };
      return { pass: true };
    },
    fix: '使用 4px 或 8px 的倍数系统：4/8/12/16/20/24/32/40/48/64。减少到 6-8 种间距值。',
  },
];

/**
 * 运行所有 Slop 检查
 * @param {string} html - 生成的 HTML
 * @returns {object} 检查结果
 */
function checkSlop(html) {
  const results = SLOP_RULES.map(rule => {
    const result = rule.check(html);
    return {
      id: rule.id,
      name: rule.name,
      description: rule.description,
      severity: rule.severity,
      pass: result.pass,
      details: result,
      fix: rule.fix,
    };
  });

  const passed = results.filter(r => r.pass).length;
  const failed = results.filter(r => !r.pass);
  const errors = failed.filter(r => r.severity === 'error');
  const warnings = failed.filter(r => r.severity === 'warning');
  const infos = failed.filter(r => r.severity === 'info');

  return {
    passed,
    total: results.length,
    score: Math.round((passed / results.length) * 100),
    grade: errors.length > 0 ? 'F' : warnings.length > 2 ? 'C' : warnings.length > 0 ? 'B' : 'A',
    errors,
    warnings,
    infos,
    allResults: results,
    summary: `通过 ${passed}/${results.length} 项检查。${errors.length > 0 ? `${errors.length} 个错误，` : ''}${warnings.length > 0 ? `${warnings.length} 个警告，` : ''}${infos.length > 0 ? `${infos.length} 个建议。` : ''}`,
  };
}

/**
 * 生成 Slop 检查报告 HTML
 * @param {object} result - checkSlop 的返回值
 * @param {object} style
 */
function slopReport(result, style = {}) {
  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  const gradeColors = { A: '#22c55e', B: '#3b82f6', C: '#f59e0b', F: '#ef4444' };

  const itemsHtml = result.allResults.map(r => `
<div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid ${c.border || '#e8e8e8'};">
  <span style="font-size:16px;flex-shrink:0;margin-top:2px;">${r.pass ? '✅' : r.severity === 'error' ? '❌' : r.severity === 'warning' ? '⚠️' : '💡'}</span>
  <div style="flex:1;">
    <div style="font-size:14px;font-weight:500;color:${c.text || '#1a1a1a'};font-family:${fontFamily};">${r.name}</div>
    <div style="font-size:12px;color:${c.textSecondary || '#888'};margin-top:2px;font-family:${fontFamily};">${r.description}</div>
    ${!r.pass ? `<div style="font-size:12px;color:${c.primary || '#6c63ff'};margin-top:6px;font-family:${fontFamily};">💡 ${r.fix}</div>` : ''}
  </div>
</div>`).join('');

  return `
<div style="font-family:${fontFamily};max-width:480px;">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
    <div style="width:48px;height:48px;border-radius:12px;background:${gradeColors[result.grade]}15;display:flex;align-items:center;justify-content:center;">
      <span style="font-size:24px;font-weight:700;color:${gradeColors[result.grade]};">${result.grade}</span>
    </div>
    <div>
      <div style="font-size:16px;font-weight:600;color:${c.text || '#1a1a1a'};">AI Slop 检查</div>
      <div style="font-size:13px;color:${c.textSecondary || '#888'};">${result.summary}</div>
    </div>
  </div>
  ${itemsHtml}
</div>`;
}

module.exports = { SLOP_RULES, checkSlop, slopReport };
