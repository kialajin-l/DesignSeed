'use strict';

const fs = require('fs');
const os = require('os');
const { DesignMemory } = require('../memory');

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
      anchors: (data.design_anchors || data.anchors || []).map(a => ({
        prompt: a.prompt,
        style: a.style,
        params: a.params,
      })),
      rules: (data.custom_rules || data.rules || []).map(r => ({
        rule_type: r.rule_type || r.ruleType,
        dimension: r.dimension,
        condition: r.condition,
        threshold: r.threshold,
        action: r.action,
        source: r.source,
      })),
      learnedDesigns: (data.design_systems || data.learnedDesigns || []).map(ds => ({
        company: ds.company,
        url: ds.url,
        content: ds.content,
        colors: ds.colors,
        typography: ds.typography,
        layout: ds.layout,
        components: ds.components,
        tone: ds.tone,
        philosophy: ds.philosophy,
        quality_score: ds.quality_score,
        source: ds.source,
      })),
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

function getArg(argv, name) {
  const index = argv.indexOf(name);
  if (index === -1 || index + 1 >= argv.length) return null;
  return argv[index + 1];
}

if (require.main === module) {
  const outputPath = getArg(process.argv, '--output');
  const knowledgePack = process.argv.includes('--knowledge-pack');
  const mem = new DesignMemory().init();
  try {
    const exporter = new DataExporter(mem);
    const data = knowledgePack
      ? exporter.exportKnowledgePack(outputPath)
      : exporter.exportAll(outputPath);

    if (!outputPath) {
      process.stdout.write(JSON.stringify(data, null, 2) + '\n');
    } else {
      console.log(`Exported ${knowledgePack ? 'knowledge pack' : 'data'} to ${outputPath}`);
    }
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  } finally {
    mem.close();
  }
}
