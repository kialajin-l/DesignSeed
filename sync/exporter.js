'use strict';

const fs = require('fs');
const os = require('os');

class DataExporter {
  constructor(memory) {
    this.memory = memory;
  }

  exportAll(outputPath) {
    const data = this.memory.exportAll();
    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      deviceId: this._getDeviceId(),
      ...data,
    };

    if (outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf8');
    }
    return exportData;
  }

  exportKnowledgePack(outputPath) {
    const data = this.memory.exportAll();
    const knowledgePack = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      type: 'knowledge_pack',
      anchors: (data.anchors || []).map(a => ({
        prompt: a.prompt,
        style: a.style,
        params: a.params,
      })),
      rules: (data.rules || []).map(r => ({
        ruleType: r.ruleType,
        dimension: r.dimension,
        condition: r.condition,
        threshold: r.threshold,
        action: r.action,
      })),
      learnedDesigns: data.learnedDesigns || [],
    };

    if (outputPath) {
      fs.writeFileSync(outputPath, JSON.stringify(knowledgePack, null, 2), 'utf8');
    }
    return knowledgePack;
  }

  _getDeviceId() {
    return os.hostname() + '_' + os.userInfo().username;
  }
}

module.exports = { DataExporter };
