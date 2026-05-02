/**
 * DesignSeed — 专家评审引擎
 * 5 维度评分 + 修复清单
 * 
 * v0.3 新增：追平 Huashu Design 的专家评审能力
 * 参考：Huashu Design 的 5 维度评审（哲学一致性/视觉层级/细节执行/功能性/创新性）
 */

/**
 * 5 维度评审体系
 */
const REVIEW_DIMENSIONS = [
  {
    id: 'philosophy',
    name: '哲学一致性',
    description: '设计是否贯彻了选定的设计哲学？视觉语言是否统一？',
    weight: 0.25,
    criteria: [
      '视觉风格是否与设计哲学一致',
      '色彩、排版、间距是否形成统一语言',
      '是否有偏离主题的元素',
      '品牌/项目调性是否贯穿始终',
    ],
  },
  {
    id: 'hierarchy',
    name: '视觉层级',
    description: '信息层级是否清晰？用户能否在 3 秒内理解页面结构？',
    weight: 0.25,
    criteria: [
      '主标题/副标题/正文层级是否清晰',
      '视觉焦点是否明确',
      '留白是否合理引导视线',
      'CTA 是否突出',
    ],
  },
  {
    id: 'execution',
    name: '细节执行',
    description: '像素级细节是否到位？间距、对齐、圆角是否一致？',
    weight: 0.20,
    criteria: [
      '间距是否使用一致的倍数系统',
      '圆角是否统一',
      '对齐是否精确',
      '颜色是否来自统一的色板',
      '字体层级是否一致',
    ],
  },
  {
    id: 'functionality',
    name: '功能性',
    description: '设计是否可用？交互是否直觉？信息是否可获取？',
    weight: 0.20,
    criteria: [
      '信息是否易于获取',
      '交互是否符合用户预期',
      '响应式是否考虑',
      '无障碍是否达标（对比度、字号）',
    ],
  },
  {
    id: 'innovation',
    name: '创新性',
    description: '设计是否有亮点？是否超出了"模板感"？',
    weight: 0.10,
    criteria: [
      '是否有独特的视觉处理',
      '是否超出了常见模板',
      '是否在细节上有巧思',
      '是否给人"眼前一亮"的感觉',
    ],
  },
];

/**
 * 评审一个设计
 * @param {object} design - { html, style, philosophy? }
 * @returns {object} 评审结果
 */
function reviewDesign(design) {
  const scores = {};
  let totalScore = 0;

  REVIEW_DIMENSIONS.forEach(dim => {
    // 基于规则的自动评分
    const score = evaluateDimension(dim, design);
    scores[dim.id] = {
      name: dim.name,
      score: score,
      maxScore: 10,
      weight: dim.weight,
      weightedScore: Math.round(score * dim.weight * 10) / 10,
      feedback: generateFeedback(dim, score, design),
      fixes: generateFixes(dim, score, design),
    };
    totalScore += scores[dim.id].weightedScore;
  });

  return {
    overallScore: Math.round(totalScore * 10) / 10,
    grade: getGrade(totalScore),
    dimensions: scores,
    summary: generateSummary(totalScore, scores),
    priorityFixes: getPriorityFixes(scores),
  };
}

/**
 * 评估单个维度的分数
 */
function evaluateDimension(dimension, design) {
  const html = design.html || '';
  const style = design.style || {};
  const c = style.colors || {};
  let score = 7; // 基础分

  switch (dimension.id) {
    case 'philosophy':
      // 检查是否有设计哲学一致性
      if (design.philosophy) score += 1;
      if (html.includes('font-family') && (html.match(/font-family/g) || []).length > 2) score += 0.5;
      if (c.primary) score += 0.5;
      if (!html.includes('Comic Sans') && !html.includes('Papyrus')) score += 1;
      break;

    case 'hierarchy':
      // 检查视觉层级
      const h1Count = (html.match(/<h1/g) || []).length;
      const h2Count = (html.match(/<h2/g) || []).length;
      if (h1Count === 1) score += 1; // 只有一个主标题
      if (h2Count >= 1 && h2Count <= 5) score += 1; // 合理的副标题数量
      if (html.includes('font-weight: 700') || html.includes('font-weight:600')) score += 0.5;
      if (html.includes('margin-bottom') || html.includes('margin: 0 0')) score += 0.5;
      break;

    case 'execution':
      // 检查细节执行
      const borderRadii = html.match(/border-radius:\s*(\d+)px/g) || [];
      const uniqueRadii = new Set(borderRadii.map(r => r.match(/\d+/)[0]));
      if (uniqueRadii.size <= 3) score += 1; // 圆角一致
      if (html.includes('box-sizing: border-box')) score += 0.5;
      if (!html.includes('!important')) score += 0.5;
      if (html.includes('line-height')) score += 1;
      break;

    case 'functionality':
      // 检查功能性
      if (html.includes('aria-') || html.includes('role=')) score += 1;
      if (html.includes('loading="lazy"')) score += 0.5;
      if (html.includes('max-width')) score += 0.5;
      if (html.includes('padding') && html.includes('margin')) score += 1;
      break;

    case 'innovation':
      // 创新性较难自动评估，给基础分
      if (html.includes('gradient')) score += 0.5;
      if (html.includes('backdrop-filter') || html.includes('box-shadow')) score += 0.5;
      if (html.includes('animation') || html.includes('transition')) score += 1;
      break;
  }

  return Math.min(10, Math.max(1, Math.round(score * 10) / 10));
}

/**
 * 生成维度反馈
 */
function generateFeedback(dimension, score, design) {
  if (score >= 8) return `${dimension.name}表现优秀，设计语言统一且专业。`;
  if (score >= 6) return `${dimension.name}良好，有小幅改进空间。`;
  if (score >= 4) return `${dimension.name}一般，建议重点关注以下改进点。`;
  return `${dimension.name}需要大幅改进，以下是具体建议。`;
}

/**
 * 生成修复建议
 */
function generateFixes(dimension, score, design) {
  const fixes = [];
  const html = design.html || '';

  switch (dimension.id) {
    case 'philosophy':
      if (score < 7) fixes.push('明确选定一个设计哲学，并检查所有元素是否符合该哲学');
      if (!design.philosophy) fixes.push('建议在 SKILL.md 中指定设计哲学（如 Pentagram 信息建筑 / Kenya Hara 东方极简）');
      break;
    case 'hierarchy':
      if (score < 7) {
        if ((html.match(/<h1/g) || []).length !== 1) fixes.push('确保只有一个 H1 主标题');
        fixes.push('增加标题与正文之间的视觉差异（字号、字重、颜色）');
      }
      break;
    case 'execution':
      if (score < 7) {
        fixes.push('统一 border-radius 值（建议使用 2-3 个层级：8px/12px/16px）');
        fixes.push('确保所有间距使用 4px 或 8px 的倍数');
      }
      break;
    case 'functionality':
      if (score < 7) {
        if (!html.includes('aria-')) fixes.push('为交互元素添加 aria-label');
        if (!html.includes('max-width')) fixes.push('为内容区域添加 max-width 限制最大宽度');
      }
      break;
    case 'innovation':
      if (score < 7) fixes.push('考虑添加微妙的 hover 效果或过渡动画');
      break;
  }
  return fixes;
}

/**
 * 生成评审摘要
 */
function generateSummary(totalScore, scores) {
  const grade = getGrade(totalScore);
  const best = Object.values(scores).sort((a, b) => b.score - a.score)[0];
  const worst = Object.values(scores).sort((a, b) => a.score - b.score)[0];

  return `综合评分 ${totalScore.toFixed(1)}/10（${grade}）。最强维度：${best.name}（${best.score}/10），最需改进：${worst.name}（${worst.score}/10）。`;
}

/**
 * 获取优先修复项（得分最低的维度的修复建议）
 */
function getPriorityFixes(scores) {
  const sorted = Object.values(scores).sort((a, b) => a.score - b.score);
  const fixes = [];
  for (const dim of sorted.slice(0, 2)) {
    dim.fixes.forEach(f => fixes.push({ dimension: dim.name, fix: f, priority: dim.score < 5 ? 'high' : 'medium' }));
  }
  return fixes;
}

/**
 * 评分等级
 */
function getGrade(score) {
  if (score >= 9) return 'S — 卓越';
  if (score >= 8) return 'A — 优秀';
  if (score >= 7) return 'B+ — 良好';
  if (score >= 6) return 'B — 合格';
  if (score >= 5) return 'C — 一般';
  if (score >= 4) return 'D — 需改进';
  return 'F — 不合格';
}

/**
 * 生成评审报告 HTML
 * @param {object} review - reviewDesign 的返回值
 * @param {object} style
 */
function reviewReport(review, style = {}) {
  const c = style.colors || {};
  const t = style.typography || {};
  const fontFamily = t.fontFamily || '-apple-system, BlinkMacSystemFont, sans-serif';

  const dimensionsHtml = Object.values(review.dimensions).map(dim => `
<div style="background:${c.surface || '#fff'};border-radius:12px;padding:20px;border:1px solid ${c.border || '#e8e8e8'};">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
    <span style="font-size:14px;font-weight:600;color:${c.text || '#1a1a1a'};font-family:${fontFamily};">${dim.name}</span>
    <span style="font-size:20px;font-weight:700;color:${dim.score >= 7 ? (c.success || '#22c55e') : dim.score >= 5 ? (c.warning || '#f59e0b') : (c.error || '#ef4444')};font-family:${fontFamily};">${dim.score}/10</span>
  </div>
  <div style="height:6px;background:${c.border || '#e8e8e8'};border-radius:3px;margin-bottom:8px;">
    <div style="height:100%;width:${dim.score * 10}%;background:${dim.score >= 7 ? (c.success || '#22c55e') : dim.score >= 5 ? (c.warning || '#f59e0b') : (c.error || '#ef4444')};border-radius:3px;"></div>
  </div>
  <div style="font-size:13px;color:${c.textSecondary || '#666'};font-family:${fontFamily};">${dim.feedback}</div>
  ${dim.fixes.length > 0 ? `
  <div style="margin-top:12px;">
    ${dim.fixes.map(f => `<div style="font-size:12px;color:${c.textSecondary || '#888'};padding:4px 0;font-family:${fontFamily};">• ${f}</div>`).join('')}
  </div>` : ''}
</div>`).join('');

  const priorityFixesHtml = review.priorityFixes.length > 0 ? `
<div style="background:${c.error || '#ef4444'}08;border:1px solid ${c.error || '#ef4444'}20;border-radius:12px;padding:20px;margin-top:20px;">
  <div style="font-size:14px;font-weight:600;color:${c.error || '#ef4444'};margin-bottom:12px;font-family:${fontFamily};">🔧 优先修复</div>
  ${review.priorityFixes.map(fix => `
  <div style="display:flex;gap:8px;padding:6px 0;font-size:13px;font-family:${fontFamily};">
    <span style="color:${fix.priority === 'high' ? (c.error || '#ef4444') : (c.warning || '#f59e0b')};font-weight:600;">[${fix.priority === 'high' ? '高' : '中'}]</span>
    <span style="color:${c.textSecondary || '#666'};">${fix.dimension}：${fix.fix}</span>
  </div>`).join('')}
</div>` : '';

  return `
<div style="font-family:${fontFamily};max-width:640px;">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;">
    <div style="width:64px;height:64px;border-radius:16px;background:${review.overallScore >= 7 ? (c.success || '#22c55e') : review.overallScore >= 5 ? (c.warning || '#f59e0b') : (c.error || '#ef4444')}15;display:flex;align-items:center;justify-content:center;">
      <span style="font-size:28px;font-weight:700;color:${review.overallScore >= 7 ? (c.success || '#22c55e') : review.overallScore >= 5 ? (c.warning || '#f59e0b') : (c.error || '#ef4444')};font-family:${fontFamily};">${review.overallScore}</span>
    </div>
    <div>
      <div style="font-size:20px;font-weight:700;color:${c.text || '#1a1a1a'};">${review.grade}</div>
      <div style="font-size:14px;color:${c.textSecondary || '#666'};">${review.summary}</div>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
    ${dimensionsHtml}
  </div>
  ${priorityFixesHtml}
</div>`;
}

module.exports = { REVIEW_DIMENSIONS, reviewDesign, reviewReport, getGrade };
