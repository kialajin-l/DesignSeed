'use strict';

const fs = require('fs');
const { DesignMemory } = require('../memory');

class DataImporter {
  constructor(memory) {
    this.memory = memory;
  }

  /**
   * importFull — 导入 exporter.exportAll() 的完整数据
   * 字段映射对齐 memory/store.js DesignMemory 的实际 API
   */
  importFull(data) {
    const result = { imported: 0, skipped: 0, conflicts: [] };

    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data: expected an object');
    }

    // Validate schema if ajv is available
    try {
      const Ajv = require('ajv');
      const schema = require('./schema.json');
      const ajv = new Ajv({ allErrors: true });
      const validate = ajv.compile(schema);
      const valid = validate(data);
      if (!valid) {
        throw new Error('Schema validation failed: ' + JSON.stringify(validate.errors));
      }
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        // ajv not installed, skip validation
      } else {
        throw e;
      }
    }

    // Import user_preferences → setPreference(dimension, value, confidence)
    const prefs = data.user_preferences || data.preferences;
    if (Array.isArray(prefs)) {
      for (const pref of prefs) {
        try {
          if (this.memory.setPreference) {
            this.memory.setPreference(pref.dimension, pref.value, pref.confidence);
            result.imported++;
          }
        } catch (e) {
          result.conflicts.push({ type: 'preference', dimension: pref.dimension, error: e.message });
          result.skipped++;
        }
      }
    }

    // Import design_anchors / anchors → saveAnchor(anchor)
    const anchors = data.design_anchors || data.anchors;
    if (Array.isArray(anchors)) {
      for (const anchor of anchors) {
        try {
          if (this.memory.saveAnchor) {
            // 去掉数据库自增 id 和时间戳，避免主键冲突
            const clean = { ...anchor };
            delete clean.id;
            delete clean.created_at;
            delete clean.updated_at;
            this.memory.saveAnchor(clean);
            result.imported++;
          }
        } catch (e) {
          result.conflicts.push({ type: 'anchor', error: e.message });
          result.skipped++;
        }
      }
    }

    // Import custom_rules / rules → addRule(rule)
    const rules = data.custom_rules || data.rules;
    if (Array.isArray(rules)) {
      for (const rule of rules) {
        try {
          if (this.memory.addRule) {
            const clean = { ...rule };
            delete clean.id;
            delete clean.created_at;
            delete clean.updated_at;
            this.memory.addRule(clean);
            result.imported++;
          }
        } catch (e) {
          result.conflicts.push({ type: 'rule', error: e.message });
          result.skipped++;
        }
      }
    }

    // Import design_systems / learnedDesigns → saveDesignSystem(ds)
    const designs = data.design_systems || data.learnedDesigns;
    if (Array.isArray(designs)) {
      for (const ds of designs) {
        try {
          if (this.memory.saveDesignSystem) {
            const clean = { ...ds };
            delete clean.id;
            delete clean.learned_at;
            this.memory.saveDesignSystem(clean);
            result.imported++;
          }
        } catch (e) {
          result.conflicts.push({ type: 'design_system', company: ds.company, error: e.message });
          result.skipped++;
        }
      }
    }

    return result;
  }

  /**
   * importKnowledgePack — 导入知识包（只含设计系统数据，不含用户偏好）
   */
  importKnowledgePack(data) {
    const result = { imported: 0, skipped: 0, conflicts: [] };

    if (!data || data.type !== 'knowledge_pack') {
      throw new Error('Invalid knowledge pack: missing type field or wrong type');
    }

    if (Array.isArray(data.anchors)) {
      for (const anchor of data.anchors) {
        try {
          if (this.memory.saveAnchor) {
            this.memory.saveAnchor(anchor);
            result.imported++;
          }
        } catch (e) {
          result.conflicts.push({ type: 'anchor', error: e.message });
          result.skipped++;
        }
      }
    }

    if (Array.isArray(data.rules)) {
      for (const rule of data.rules) {
        try {
          if (this.memory.addRule) {
            this.memory.addRule({
              rule_type: rule.rule_type || rule.ruleType,
              dimension: rule.dimension,
              condition: rule.condition,
              threshold: rule.threshold,
              action: rule.action,
              source: rule.source,
            });
            result.imported++;
          }
        } catch (e) {
          result.conflicts.push({ type: 'rule', error: e.message });
          result.skipped++;
        }
      }
    }

    if (Array.isArray(data.learnedDesigns)) {
      for (const design of data.learnedDesigns) {
        try {
          if (this.memory.saveDesignSystem) {
            this.memory.saveDesignSystem(design);
            result.imported++;
          }
        } catch (e) {
          result.conflicts.push({ type: 'design_system', error: e.message });
          result.skipped++;
        }
      }
    }

    return result;
  }
}

module.exports = { DataImporter };

function getArg(argv, name) {
  const index = argv.indexOf(name);
  if (index === -1 || index + 1 >= argv.length) return null;
  return argv[index + 1];
}

if (require.main === module) {
  const inputPath = getArg(process.argv, '--input');
  if (!inputPath) {
    console.error('Usage: node sync/importer.js --input <path>');
    process.exit(1);
  }

  const mem = new DesignMemory().init();
  try {
    const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    const importer = new DataImporter(mem);
    const result = raw.type === 'knowledge_pack'
      ? importer.importKnowledgePack(raw)
      : importer.importFull(raw);

    console.log(`Imported ${result.imported} item(s), skipped ${result.skipped}, conflicts ${result.conflicts.length}`);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  } finally {
    mem.close();
  }
}
