/**
 * DesignSeed — 设计审计引擎
 * 融合 Impeccable 反模式检测 + 五维度质量评分
 * 与 RuleForge 美学规则引擎协同工作
 */

const fs = require('fs');
const path = require('path');

// ─── 反模式检测规则（确定性，正则匹配） ─────────────────────────────

const ANTI_PATTERNS = [
  // === AI Slop 特征 ===
  {
    id: 'purple-gradient',
    name: '紫色渐变滥用',
    severity: 'error',
    description: '禁止使用紫蓝渐变作为主色调，这是最典型的 AI slop 特征',
    detect: (html) => {
      const gradients = html.match(/linear-gradient\([^)]*(?:#(?:[0-9a-fA-F]{3,8})+|rgb\([^)]+\)|var\([^)]+\))[^)]*(?:#(?:[0-9a-fA-F]{3,8})+|rgb\([^)]+\)|var\([^)]+\))[^)]*\)/gi) || [];
      const purpleBlue = gradients.filter(g => {
        const lower = g.toLowerCase();
        return (lower.includes('7c') || lower.includes('8b') || lower.includes('6b') || lower.includes('5b')) &&
               (lower.includes('3a') || lower.includes('4a') || lower.includes('5a'));
      });
      return purpleBlue.length > 0;
    }
  },
  {
    id: 'inter-font',
    name: 'Inter 字体过度使用',
    severity: 'warning',
    description: 'Inter 是 AI 最常用的字体，建议使用更有特色的字体',
    detect: (html) => /font-family:\s*['"]?Inter['"]?/i.test(html)
  },
    {
    id: 'card-nesting',
    name: '卡片过度嵌套',
    severity: 'warning',
    description: '卡片嵌套超过 2 层会导致视觉臃肿',
    detect: (html) => {
      // 简单检测：如果一个 card div 内部还有 card 样式的 div
      const cardPattern = /border-radius:\s*\d+px[^"]*background:\s*(?:#fff|#ffffff|white|var\(--[^)]*surface[^)]*\))/gi;
      const matches = html.match(cardPattern) || [];
      return matches.length > 6; // 超过 6 个卡片可能有嵌套
    }
  },
  {
    id: 'low-contrast',
    name: '低对比度文字',
    severity: 'error',
    description: '彩色背景上的灰色文字对比度不足，违反 WCAG 标准',
    detect: (html) => {
      // 检测 gradient 背景 + 灰色文字的组合
      const hasGradientBg = /background:\s*(?:linear-gradient|radial-gradient)/i.test(html);
      const hasGrayText = /color:\s*(?:#(?:[89a-f][0-9a-f]){3}|rgb\(\s*(?:1[0-2]\d|1[3-9]\d|[2-9]\d{2})\s*,\s*(?:1[0-2]\d|1[3-9]\d|[2-9]\d{2})\s*,\s*(?:1[0-2]\d|1[3-9]\d|[2-9]\d{2})\s*\))/i.test(html);
      return hasGradientBg && hasGrayText;
    }
  },
  {
    id: 'glow-effects',
    name: '发光效果滥用',
    severity: 'warning',
    description: 'text-shadow 发光效果过多会显得廉价',
    detect: (html) => {
      const glowCount = (html.match(/text-shadow:\s*[^;]*(?:0\s+0|0px\s+0px)/gi) || []).length;
      return glowCount > 3;
    }
  },
  {
    id: 'rounded-icon-above-title',
    name: '标题上方圆角图标',
    severity: 'info',
    description: '每个标题上方放圆角方形图标是 AI 的惯用套路',
    detect: (html) => {
      // 检测是否有多个 "图标 + 标题" 的模式
      const iconTitlePattern = /border-radius:\s*(?:8|12|16)px[^"]*(?:width|height):\s*(?:40|48|56|64)px/gi;
      return (html.match(iconTitlePattern) || []).length > 3;
    }
  },
  {
    id: 'glassmorphism-overuse',
    name: '毛玻璃效果过度',
    severity: 'warning',
    description: 'backdrop-filter 滥用会导致性能问题',
    detect: (html) => {
      const glassCount = (html.match(/backdrop-filter/gi) || []).length;
      return glassCount > 2;
    }
  },
  {
    id: 'excessive-animation',
    name: '过度动效',
    severity: 'warning',
    description: '无意义的动画会分散注意力',
    detect: (html) => {
      const animCount = (html.match(/animation|@keyframes|transition/gi) || []).length;
      return animCount > 5;
    }
  },
  {
    id: 'inline-style-soup',
    name: '内联样式泛滥',
    severity: 'info',
    description: '过多内联样式影响可维护性',
    detect: (html) => {
      const inlineCount = (html.match(/style="/gi) || []).length;
      return inlineCount > 30;
    }
  },
  {
    id: 'missing-viewport',
    name: '缺少 viewport meta',
    severity: 'error',
    description: '移动端适配必须有 viewport meta 标签',
    detect: (html) => !/meta\s+name=["']viewport["']/i.test(html)
  },
  {
    id: 'missing-lang',
    name: '缺少 lang 属性',
    severity: 'info',
    description: 'html 标签应包含 lang 属性以支持无障碍',
    detect: (html) => /<html(?!\s+lang)/i.test(html)
  },
  {
    id: 'missing-alt',
    name: '图片缺少 alt 属性',
    severity: 'warning',
    description: 'img 标签应包含 alt 属性以支持无障碍',
    detect: (html) => {
      const imgs = html.match(/<img[^>]*>/gi) || [];
      const noAlt = imgs.filter(img => !/alt\s*=/i.test(img));
      return noAlt.length > 0;
    }
  },
    {
    id: 'color-only-contrast',
    name: '仅靠颜色区分信息',
    severity: 'warning',
    description: '不应仅靠颜色传达信息，需配合图标或文字',
    detect: (html) => {
      // 检测是否有 status 类的颜色标记但没有文字
      const colorStatus = (html.match(/background:\s*(?:#(?:22c55e|ef4444|f59e0b|3b82f6))/gi) || []).length;
      return colorStatus > 3;
    }
  },
  {
    id: 'pastel-on-dark',
    name: '暗色背景配柔和色',
    severity: 'info',
    description: '暗色背景上使用低饱和度颜色可能对比度不足',
    detect: (html) => {
      const hasDarkBg = /background:\s*(?:#(?:[0-2][0-9a-f]{2}){3}|rgb\(\s*(?:[0-2]\d{2})\s*,\s*(?:[0-2]\d{2})\s*,\s*(?:[0-2]\d{2})\s*\))/i.test(html);
      const hasPastel = /color:\s*(?:#(?:[a-f][0-9a-f]){3}|rgb\(\s*(?:1[5-9]\d|2[0-4]\d|25[0-5])\s*,\s*(?:1[5-9]\d|2[0-4]\d|25[0-5])\s*,\s*(?:1[5-9]\d|2[0-4]\d|25[0-5])\s*\))/i.test(html);
      return hasDarkBg && hasPastel;
    }
  }
];

// ─── 五维度评分系统 ─────────────────────────────

/**
 * 无障碍评分（Accessibility）
 * 检查：viewport、lang、alt、对比度、语义化标签
 */
function scoreAccessibility(html) {
  let score = 100;
  const issues = [];

  if (!/meta\s+name=["']viewport["']/i.test(html)) {
    score -= 20;
    issues.push('缺少 viewport meta 标签');
  }
  if (/<html(?!\s+lang)/i.test(html)) {
    score -= 10;
    issues.push('html 标签缺少 lang 属性');
  }
  const imgs = html.match(/<img[^>]*>/gi) || [];
  const noAlt = imgs.filter(img => !/alt\s*=/i.test(img));
  if (noAlt.length > 0) {
    score -= 15;
    issues.push(`${noAlt.length} 个图片缺少 alt 属性`);
  }
  // 检测语义化标签
  const semanticTags = ['<header', '<nav', '<main', '<section', '<article', '<footer'];
  const hasSemantic = semanticTags.some(tag => html.toLowerCase().includes(tag));
  if (!hasSemantic) {
    score -= 10;
    issues.push('缺少语义化 HTML 标签');
  }
  // 检测 heading 层级
  const h1Count = (html.match(/<h1/gi) || []).length;
  if (h1Count === 0) {
    score -= 10;
    issues.push('缺少 h1 标题');
  } else if (h1Count > 1) {
    score -= 5;
    issues.push('存在多个 h1 标题');
  }

  return { score: Math.max(0, score), issues };
}

/**
 * 性能评分（Performance）
 * 检查：内联样式数量、CSS 复杂度、外部资源
 */
function scorePerformance(html) {
  let score = 100;
  const issues = [];

  const inlineCount = (html.match(/style="/gi) || []).length;
  if (inlineCount > 50) {
    score -= 25;
    issues.push(`内联样式过多（${inlineCount} 处），建议使用 class`);
  } else if (inlineCount > 30) {
    score -= 15;
    issues.push(`内联样式较多（${inlineCount} 处）`);
  }

  const backdropFilterCount = (html.match(/backdrop-filter/gi) || []).length;
  if (backdropFilterCount > 3) {
    score -= 15;
    issues.push(`backdrop-filter 使用过多（${backdropFilterCount} 处），影响渲染性能`);
  }

  const boxShadowCount = (html.match(/box-shadow/gi) || []).length;
  if (boxShadowCount > 10) {
    score -= 10;
    issues.push(`box-shadow 过多（${boxShadowCount} 处）`);
  }

  const animCount = (html.match(/animation|@keyframes/gi) || []).length;
  if (animCount > 5) {
    score -= 10;
    issues.push(`动画过多（${animCount} 处）`);
  }

  return { score: Math.max(0, score), issues };
}

/**
 * 主题一致性评分（Theme Consistency）
 * 检查：颜色使用是否统一、字体是否一致、间距是否有规律
 */
function scoreThemeConsistency(html) {
  let score = 100;
  const issues = [];

  // 提取所有使用的颜色
  const colorMatches = html.match(/(?:#(?:[0-9a-fA-F]{3,8})|rgb\([^)]+\)|rgba\([^)]+\))/g) || [];
  const uniqueColors = [...new Set(colorMatches.map(c => c.toLowerCase()))];
  if (uniqueColors.length > 15) {
    score -= 20;
    issues.push(`颜色使用过多（${uniqueColors.length} 种），建议控制在 10 种以内`);
  }

  // 提取所有使用的字体
  const fontMatches = html.match(/font-family:\s*([^;]+)/gi) || [];
  const uniqueFonts = [...new Set(fontMatches.map(f => f.trim().toLowerCase()))];
  if (uniqueFonts.length > 3) {
    score -= 15;
    issues.push(`字体使用过多（${uniqueFonts.length} 种），建议控制在 2 种以内`);
  }

  // 检测 border-radius 是否有规律
  const radiusMatches = html.match(/border-radius:\s*([^;]+)/gi) || [];
  const uniqueRadius = [...new Set(radiusMatches.map(r => r.trim().toLowerCase()))];
  if (uniqueRadius.length > 5) {
    score -= 10;
    issues.push(`圆角使用不统一（${uniqueRadius.length} 种值）`);
  }

  return { score: Math.max(0, score), issues };
}

/**
 * 响应式评分（Responsive）
 * 检查：viewport、媒体查询、流体布局
 */
function scoreResponsive(html) {
  let score = 100;
  const issues = [];

  if (!/meta\s+name=["']viewport["']/i.test(html)) {
    score -= 30;
    issues.push('缺少 viewport meta 标签');
  }

  const hasMediaQuery = /@media\s*\(/i.test(html);
  if (!hasMediaQuery) {
    score -= 25;
    issues.push('缺少媒体查询，可能不支持响应式');
  }

  const hasFlex = /display:\s*flex/i.test(html);
  const hasGrid = /display:\s*grid/i.test(html);
  if (!hasFlex && !hasGrid) {
    score -= 15;
    issues.push('未使用 Flexbox 或 Grid 布局');
  }

  const hasMaxWidth = /max-width:\s*\d+px/i.test(html);
  if (!hasMaxWidth) {
    score -= 10;
    issues.push('缺少 max-width 限制，内容可能在大屏上过度拉伸');
  }

  return { score: Math.max(0, score), issues };
}

/**
 * 反模式评分（Anti-patterns）
 * 检查：是否违反设计规则
 */
function scoreAntiPatterns(html) {
  let score = 100;
  const issues = [];

  for (const rule of ANTI_PATTERNS) {
    try {
      if (rule.detect(html)) {
        const penalty = rule.severity === 'error' ? 15 : rule.severity === 'warning' ? 8 : 3;
        score -= penalty;
        issues.push(`[${rule.severity.toUpperCase()}] ${rule.name}: ${rule.description}`);
      }
    } catch (e) {
      // 检测规则出错，跳过
    }
  }

  return { score: Math.max(0, score), issues };
}

// ─── 主审计函数 ─────────────────────────────

/**
 * 对 HTML 内容进行五维度质量审计
 * @param {string} html - 要审计的 HTML 内容
 * @param {object} options - 可选配置
 * @returns {object} 审计结果
 */
function audit(html, options = {}) {
  const opts = options || {};

  // 五维度评分
  const accessibility = scoreAccessibility(html);
  const performance = scorePerformance(html);
  const themeConsistency = scoreThemeConsistency(html);
  const responsive = scoreResponsive(html);
  const antiPatterns = scoreAntiPatterns(html);

  // 综合评分（加权平均）
  const weights = {
    accessibility: 0.25,
    performance: 0.20,
    themeConsistency: 0.25,
    responsive: 0.15,
    antiPatterns: 0.15
  };

  const overallScore = Math.round(
    accessibility.score * weights.accessibility +
    performance.score * weights.performance +
    themeConsistency.score * weights.themeConsistency +
    responsive.score * weights.responsive +
    antiPatterns.score * weights.antiPatterns
  );

  // 收集所有问题
  const allIssues = [
    ...accessibility.issues.map(i => ({ dimension: '无障碍', ...parseIssue(i) })),
    ...performance.issues.map(i => ({ dimension: '性能', ...parseIssue(i) })),
    ...themeConsistency.issues.map(i => ({ dimension: '主题一致性', ...parseIssue(i) })),
    ...responsive.issues.map(i => ({ dimension: '响应式', ...parseIssue(i) })),
    ...antiPatterns.issues.map(i => ({ dimension: '反模式', ...parseIssue(i) })),
  ];

  // 按严重度排序
  const severityOrder = { ERROR: 0, WARNING: 1, INFO: 2 };
  allIssues.sort((a, b) => (severityOrder[a.severity] || 3) - (severityOrder[b.severity] || 3));

  return {
    overallScore,
    dimensions: {
      accessibility: { score: accessibility.score, issues: accessibility.issues },
      performance: { score: performance.score, issues: performance.issues },
      themeConsistency: { score: themeConsistency.score, issues: themeConsistency.issues },
      responsive: { score: responsive.score, issues: responsive.issues },
      antiPatterns: { score: antiPatterns.score, issues: antiPatterns.issues },
    },
    issues: allIssues,
    summary: generateSummary(overallScore, allIssues)
  };
}

/**
 * 解析问题字符串，提取严重度
 */
function parseIssue(issue) {
  const match = issue.match(/^\[(\w+)\]\s*(.+)$/);
  if (match) {
    return { severity: match[1], message: match[2] };
  }
  return { severity: 'INFO', message: issue };
}

/**
 * 生成审计摘要
 */
function generateSummary(score, issues) {
  const errorCount = issues.filter(i => i.severity === 'ERROR').length;
  const warningCount = issues.filter(i => i.severity === 'WARNING').length;
  const infoCount = issues.filter(i => i.severity === 'INFO').length;

  let grade;
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  let verdict;
  if (score >= 90) verdict = '优秀 — 设计质量很高，可直接上线';
  else if (score >= 80) verdict = '良好 — 有小问题，建议优化后上线';
  else if (score >= 70) verdict = '及格 — 存在明显问题，需要修改';
  else if (score >= 60) verdict = '不及格 — 需要大幅修改';
  else verdict = '严重问题 — 建议重新设计';

  return {
    grade,
    verdict,
    errorCount,
    warningCount,
    infoCount,
    totalIssues: issues.length
  };
}

/**
 * 格式化审计报告为可读文本
 */
function formatReport(result) {
  const lines = [];
  lines.push('');
  lines.push('  ╔══════════════════════════════════════════════════════════╗');
  lines.push('  ║              DesignSeed 设计审计报告                    ║');
  lines.push('  ╚══════════════════════════════════════════════════════════╝');
  lines.push('');
  lines.push(`  综合评分: ${result.overallScore}/100 (${result.summary.grade})`);
  lines.push(`  评价: ${result.summary.verdict}`);
  lines.push('');
  lines.push('  ┌─────────────────┬───────┬──────────────────────────────┐');
  lines.push('  │ 维度            │ 评分  │ 状态                         │');
  lines.push('  ├─────────────────┼───────┼──────────────────────────────┤');

  const dims = [
    ['无障碍', result.dimensions.accessibility.score],
    ['性能', result.dimensions.performance.score],
    ['主题一致性', result.dimensions.themeConsistency.score],
    ['响应式', result.dimensions.responsive.score],
    ['反模式', result.dimensions.antiPatterns.score],
  ];

  for (const [name, score] of dims) {
    const bar = score >= 80 ? '██████████' : score >= 60 ? '████████░░' : score >= 40 ? '██████░░░░' : '████░░░░░░';
    const paddedName = name.padEnd(15);
    const paddedScore = String(score).padStart(3);
    lines.push(`  │ ${paddedName} │  ${paddedScore}  │ ${bar} │`);
  }

  lines.push('  └─────────────────┴───────┴──────────────────────────────┘');
  lines.push('');

  if (result.issues.length > 0) {
    lines.push('  问题详情:');
    lines.push('  ─────────────────────────────────────────────────────────');
    for (const issue of result.issues) {
      const icon = issue.severity === 'ERROR' ? '🔴' : issue.severity === 'WARNING' ? '🟡' : '🔵';
      lines.push(`  ${icon} [${issue.dimension}] ${issue.message}`);
    }
    lines.push('');
  }

  lines.push(`  共 ${result.summary.totalIssues} 个问题: ${result.summary.errorCount} 错误 / ${result.summary.warningCount} 警告 / ${result.summary.infoCount} 提示`);
  lines.push('');

  return lines.join('\n');
}

module.exports = { audit, formatReport, ANTI_PATTERNS };
