'use strict';

/**
 * DesignSeed - Preference Profiler
 *
 * Builds user design preference profile from accumulated selections and feedback.
 */

class PreferenceProfiler {
  constructor(memory) {
    this.memory = memory;
  }

  buildProfile() {
    const preferences = this.memory.getAllPreferences();
    const anchors = this.memory.getRecentAnchors(50);
    const profile = {
      dimensions: {},
      styleAffinity: {},
      complexityLevel: 'moderate',
      recommendedStyles: [],
      recommendedMix: null,
      confidence: 0,
      sampleSize: anchors.length,
    };

    for (const pref of preferences) {
      profile.dimensions[pref.dimension] = {
        value: pref.value,
        confidence: pref.confidence,
        samples: pref.sample_count,
        label: this._labelValue(pref.dimension, pref.value),
      };
    }

    const styleCounts = {};
    for (const anchor of anchors) {
      if (anchor.style) styleCounts[anchor.style] = (styleCounts[anchor.style] || 0) + 1;
    }
    const total = anchors.length || 1;
    for (const [style, count] of Object.entries(styleCounts)) {
      profile.styleAffinity[style] = Math.round((count / total) * 100) / 100;
    }

    profile.recommendedStyles = Object.entries(profile.styleAffinity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([style, affinity]) => ({ style, affinity }));

    if (profile.recommendedStyles.length >= 2) {
      const top2 = profile.recommendedStyles.slice(0, 2);
      profile.recommendedMix = {
        styleA: top2[0].style,
        styleB: top2[1].style,
        ratio: top2[0].affinity / (top2[0].affinity + top2[1].affinity),
      };
    }

    const cx = profile.dimensions.complexity;
    if (cx) {
      profile.complexityLevel = cx.value < 0.3 ? 'minimal' : cx.value < 0.6 ? 'moderate' : 'rich';
    }

    if (preferences.length > 0) {
      profile.confidence = Math.round(preferences.reduce((s, p) => s + p.confidence, 0) / preferences.length * 100) / 100;
    }

    return profile;
  }

  getSuggestions() {
    const profile = this.buildProfile();
    const suggestions = {
      style: profile.recommendedStyles[0] ? profile.recommendedStyles[0].style : null,
      mix: profile.recommendedMix,
      params: {},
    };
    const w = profile.dimensions.color_temperature;
    if (w) suggestions.params.colorTemperature = w.value > 0.6 ? 'warm' : w.value < 0.4 ? 'cool' : 'neutral';
    const f = profile.dimensions.formality;
    if (f) suggestions.params.formality = f.value > 0.7 ? 'formal' : f.value < 0.3 ? 'casual' : 'balanced';
    const r = profile.dimensions.readability;
    if (r) suggestions.params.fontSize = r.value > 0.6 ? 'large' : r.value < 0.4 ? 'compact' : 'standard';
    return suggestions;
  }

  _labelValue(dim, val) {
    const labels = {
      color_temperature: [[0,0.3,'Cool tone'],[0.3,0.6,'Neutral'],[0.6,1.0,'Warm tone']],
      formality: [[0,0.3,'Casual'],[0.3,0.6,'Balanced'],[0.6,1.0,'Formal']],
      readability: [[0,0.3,'Compact'],[0.3,0.6,'Standard'],[0.6,1.0,'Spacious']],
      complexity: [[0,0.3,'Minimal'],[0.3,0.6,'Moderate'],[0.6,1.0,'Rich']],
      innovation: [[0,0.3,'Classic'],[0.3,0.6,'Modern'],[0.6,1.0,'Avant-garde']],
      layout_density: [[0,0.3,'Sparse'],[0.3,0.6,'Standard'],[0.6,1.0,'Dense']],
    };
    const ranges = labels[dim];
    if (!ranges) return 'value: ' + val;
    for (const [min, max, label] of ranges) {
      if (val >= min && val < max) return label;
    }
    return 'value: ' + val;
  }

  getSummary() {
    const profile = this.buildProfile();
    const lines = [];
    lines.push('## Design Preference Profile');
    lines.push('Sample: ' + profile.sampleSize + ' designs | Confidence: ' + Math.round(profile.confidence * 100) + '%');
    lines.push('');
    if (Object.keys(profile.dimensions).length > 0) {
      lines.push('### Dimension Preferences');
      for (const [dim, data] of Object.entries(profile.dimensions)) {
        const pct = Math.round(data.value * 100);
        lines.push('- ' + dim + ': ' + pct + '% ' + data.label + ' (' + Math.round(data.confidence * 100) + '% conf)');
      }
      lines.push('');
    }
    if (profile.recommendedStyles.length > 0) {
      lines.push('### Recommended Styles');
      for (const rec of profile.recommendedStyles) {
        lines.push('- ' + rec.style + ': ' + Math.round(rec.affinity * 100) + '% affinity');
      }
    }
    return lines.join(String.fromCharCode(10));
  }
}

module.exports = PreferenceProfiler;
