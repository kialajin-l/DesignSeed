'use strict';

/**
 * DesignSeed - RuleForge 规则权重自适应
 *
 * 根据用户反馈自动调整规则的权重和阈值：
 *   - 被频繁触发且用户接受的规则 -> 权重增加
 *   - 被用户手动覆盖的规则 -> 权重降低
 *   - 长期未触发的规则 -> 权重衰减
 */

class AdaptiveRules {
  constructor(memory, ruleEngine) {
    this.memory = memory;
    this.ruleEngine = ruleEngine;
    this.ruleStats = new Map();
  }

  recordEvent(ruleId, outcome) {
    if (!this.ruleStats.has(ruleId)) {
      this.ruleStats.set(ruleId, { triggered: 0, accepted: 0, overridden: 0, ignored: 0 });
    }
    const s = this.ruleStats.get(ruleId);
    s.triggered++;
    if (outcome === 'accepted') s.accepted++;
    else if (outcome === 'overridden') s.overridden++;
    else if (outcome === 'ignored') s.ignored++;
  }

  computeWeight(ruleId) {
    const s = this.ruleStats.get(ruleId);
    if (!s || s.triggered === 0) return 1.0;
    const acceptRate = s.accepted / s.triggered;
    const overrideRate = s.overridden / s.triggered;
    let weight = 0.5 + acceptRate - overrideRate;
    weight += Math.min(0.2, s.triggered * 0.01);
    return Math.round(Math.max(0.1, Math.min(2.0, weight)) * 100) / 100;
  }

  applyWeights() {
    for (const rule of this.ruleEngine.getAllRules()) {
      const weight = this.computeWeight(rule.id);
      rule.weight = weight;
      if (weight < 0.3 && rule.type === 'hard_limit') {
        rule._originalType = rule.type;
        rule.type = 'soft_preference';
        rule.action = 'warn';
      }
      if (weight >= 0.5 && rule._originalType) {
        rule.type = rule._originalType;
        rule.action = rule.type === 'hard_limit' ? 'reject' : 'warn';
        delete rule._originalType;
      }
    }
  }

  learnFromReport(report) {
    if (!report) return;
    for (const under of (report.underPerformers || [])) {
      for (const rule of this.ruleEngine.getAllRules()) {
        if (rule.action === 'reject' || rule.action === 'adjust') {
          this.recordEvent(rule.id, 'overridden');
        }
      }
    }
    for (const top of (report.topPerformers || [])) {
      for (const rule of this.ruleEngine.getAllRules()) {
        this.recordEvent(rule.id, 'accepted');
      }
    }
    this.applyWeights();
  }

  getStats() {
    const result = [];
    for (const rule of this.ruleEngine.getAllRules()) {
      const s = this.ruleStats.get(rule.id) || { triggered: 0, accepted: 0, overridden: 0 };
      result.push({ id: rule.id, name: rule.name, type: rule.type, weight: this.computeWeight(rule.id), triggered: s.triggered, accepted: s.accepted, overridden: s.overridden });
    }
    return result.sort((a, b) => b.weight - a.weight);
  }

  reset() { this.ruleStats.clear(); }
}

module.exports = AdaptiveRules;
