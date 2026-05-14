'use strict';

/**
 * DesignSeed — 反馈闭环模块
 *
 * 核心流程：
 *   用户修改设计 → 检测差异 → 提取反馈信号 → 更新锚点 → 更新偏好 → 优化下次生成
 *
 * 反馈类型：
 *   - explicit: 用户主动评分（👍/👎）、文字评价
 *   - implicit: 用户修改了哪些属性（颜色、字号、间距等）
 *   - behavioral: 用户是否采纳了生成结果（使用/丢弃）
 */

class FeedbackCollector {
  constructor(memory) {
    this.memory = memory;
  }

  /**
   * 记录一次显式反馈（用户主动评分）
   * @param {number} anchorId - 锚点 ID
   * @param {object} feedback - { rating: 1|-1, comment?: string, dimensions?: { color: 1, typography: -1, ... } }
   */
  recordExplicit(anchorId, feedback) {
    const anchor = this.memory.getAnchor(anchorId);
    if (!anchor) throw new Error(`锚点 ${anchorId} 不存在`);

    const signal = anchor.feedback_signal || { positive: [], negative: [], explicit: [] };
    const entry = {
      type: 'explicit',
      rating: feedback.rating,
      comment: feedback.comment || null,
      dimensions: feedback.dimensions || {},
      timestamp: new Date().toISOString(),
    };

    if (feedback.rating >= 1) {
      signal.positive.push(entry);
    } else {
      signal.negative.push(entry);
    }
    signal.explicit.push(entry);

    this.memory.updateAnchor(anchorId, { feedback_signal: signal });

    // 根据维度级反馈更新偏好
    if (feedback.dimensions) {
      for (const [dim, val] of Object.entries(feedback.dimensions)) {
        this.memory.updatePreferenceFromFeedback(dim, val > 0 ? 0.7 : 0.3);
      }
    }

    return entry;
  }

  /**
   * 记录一次隐式反馈（用户修改了设计）
   * @param {number} anchorId - 锚点 ID
   * @param {object} diff - 修改详情 { before: {...}, after: {...}, changedKeys: [...] }
   */
  recordImplicit(anchorId, diff) {
    const anchor = this.memory.getAnchor(anchorId);
    if (!anchor) throw new Error(`锚点 ${anchorId} 不存在`);

    const signal = anchor.feedback_signal || { positive: [], negative: [], explicit: [] };
    const entry = {
      type: 'implicit',
      changedKeys: diff.changedKeys || [],
      before: diff.before || {},
      after: diff.after || {},
      timestamp: new Date().toISOString(),
    };

    signal.positive.push(entry);

    this.memory.updateAnchor(anchorId, {
      feedback_signal: signal,
      user_modifications: (anchor.user_modifications || 0) + 1,
    });

    // 从修改中推断偏好变化
    this._inferPreferenceFromDiff(diff);

    return entry;
  }

  /**
   * 记录行为反馈（采纳/丢弃）
   * @param {number} anchorId - 锚点 ID
   * @param {string} action - 'adopted' | 'discarded' | 'exported'
   */
  recordBehavior(anchorId, action) {
    const anchor = this.memory.getAnchor(anchorId);
    if (!anchor) throw new Error(`锚点 ${anchorId} 不存在`);

    const signal = anchor.feedback_signal || { positive: [], negative: [], explicit: [] };
    const entry = {
      type: 'behavioral',
      action,
      timestamp: new Date().toISOString(),
    };

    if (action === 'adopted' || action === 'exported') {
      signal.positive.push(entry);
    } else if (action === 'discarded') {
      signal.negative.push(entry);
    }

    this.memory.updateAnchor(anchorId, { feedback_signal: signal });
    return entry;
  }

  /**
   * 分析一个锚点的综合反馈得分
   * @param {number} anchorId
   * @returns {{ score: number, confidence: number, summary: string }}
   */
  analyzeAnchor(anchorId) {
    const anchor = this.memory.getAnchor(anchorId);
    if (!anchor) return null;

    const signal = anchor.feedback_signal || { positive: [], negative: [], explicit: [] };
    const posCount = signal.positive.length;
    const negCount = signal.negative.length;
    const total = posCount + negCount;

    if (total === 0) return { score: 0.5, confidence: 0, summary: '无反馈数据' };

    const rawScore = posCount / total;
    const confidence = Math.min(1, total / 10);
    const modBonus = Math.min(0.1, (anchor.user_modifications || 0) * 0.02);
    const score = Math.round(Math.min(1, rawScore + modBonus) * 100) / 100;

    return {
      score,
      confidence: Math.round(confidence * 100) / 100,
      summary: this._generateSummary(signal, score),
    };
  }

  /**
   * 批量分析所有锚点，生成全局反馈报告
   */
  generateReport() {
    const anchors = this.memory.listAnchors({ limit: 100 });
    const report = {
      totalAnchors: anchors.length,
      withFeedback: 0,
      avgScore: 0,
      styleScores: {},
      topPerformers: [],
      underPerformers: [],
    };

    let totalScore = 0;
    for (const anchor of anchors) {
      const analysis = this.analyzeAnchor(anchor.id);
      if (!analysis || analysis.confidence === 0) continue;

      report.withFeedback++;
      totalScore += analysis.score;

      const style = anchor.style || 'unknown';
      if (!report.styleScores[style]) {
        report.styleScores[style] = { total: 0, count: 0, avg: 0 };
      }
      report.styleScores[style].total += analysis.score;
      report.styleScores[style].count++;

      if (analysis.score >= 0.7) {
        report.topPerformers.push({ anchorId: anchor.id, prompt: anchor.prompt, style, score: analysis.score });
      } else if (analysis.score < 0.4) {
        report.underPerformers.push({ anchorId: anchor.id, prompt: anchor.prompt, style, score: analysis.score });
      }
    }

    report.avgScore = report.withFeedback > 0
      ? Math.round((totalScore / report.withFeedback) * 100) / 100
      : 0;

    for (const style of Object.keys(report.styleScores)) {
      const s = report.styleScores[style];
      s.avg = Math.round((s.total / s.count) * 100) / 100;
    }

    report.topPerformers.sort((a, b) => b.score - a.score);
    report.underPerformers.sort((a, b) => a.score - b.score);

    return report;
  }

  /**
   * 从 diff 中推断偏好变化
   */
  _inferPreferenceFromDiff(diff) {
    if (!diff.changedKeys || !diff.after) return;

    const dimensionMap = {
      color: 'color_temperature',
      backgroundColor: 'color_temperature',
      primaryColor: 'color_temperature',
      fontFamily: 'formality',
      fontSize: 'readability',
      lineHeight: 'readability',
      spacing: 'complexity',
      borderRadius: 'innovation',
      boxShadow: 'innovation',
      width: 'layout_density',
      maxWidth: 'layout_density',
      padding: 'layout_density',
    };

    for (const key of diff.changedKeys) {
      const dimension = dimensionMap[key];
      if (!dimension) continue;

      const before = diff.before[key];
      const after = diff.after[key];
      if (before === after) continue;

      this.memory.updatePreferenceFromFeedback(dimension, 0.6);
    }
  }

  _generateSummary(signal, score) {
    const parts = [];
    const explicitRatings = signal.explicit || [];
    if (explicitRatings.length > 0) {
      const positive = explicitRatings.filter(e => e.rating > 0).length;
      const negative = explicitRatings.length - positive;
      parts.push(`${positive}次好评${negative > 0 ? `、${negative}次差评` : ''}`);
    }

    const modifications = signal.positive.filter(e => e.type === 'implicit').length;
    if (modifications > 0) {
      parts.push(`${modifications}次修改`);
    }

    const behaviors = signal.positive.filter(e => e.type === 'behavioral' && e.action === 'adopted').length;
    if (behaviors > 0) {
      parts.push(`被采纳${behaviors}次`);
    }

    const discarded = signal.negative.filter(e => e.type === 'behavioral' && e.action === 'discarded').length;
    if (discarded > 0) {
      parts.push(`被丢弃${discarded}次`);
    }

    return parts.length > 0 ? parts.join('，') : '反馈数据不足';
  }
}

module.exports = FeedbackCollector;
