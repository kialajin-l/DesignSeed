'use strict';

class DataImporter {
  constructor(memory) {
    this.memory = memory;
  }

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
        console.warn('ajv not installed, skipping schema validation');
      } else {
        throw e;
      }
    }

    // Import preferences (EMA merge)
    if (data.preferences) {
      const localPrefs = this.memory.getPreferences ? this.memory.getPreferences() : {};
      const merged = this.mergePreferences(localPrefs, data.preferences);
      if (this.memory.setPreferences) {
        this.memory.setPreferences(merged);
      }
      result.imported++;
    }

    // Import anchors
    if (Array.isArray(data.anchors)) {
      for (const anchor of data.anchors) {
        try {
          if (this.memory.addAnchor) {
            this.memory.addAnchor(anchor);
            result.imported++;
          }
        } catch (e) {
          result.conflicts.push({ type: 'anchor', id: anchor.id, error: e.message });
          result.skipped++;
        }
      }
    }

    // Import rules
    if (Array.isArray(data.rules)) {
      for (const rule of data.rules) {
        try {
          if (this.memory.addRule) {
            this.memory.addRule(rule);
            result.imported++;
          }
        } catch (e) {
          result.conflicts.push({ type: 'rule', id: rule.id, error: e.message });
          result.skipped++;
        }
      }
    }

    // Import learned designs
    if (Array.isArray(data.learnedDesigns)) {
      for (const design of data.learnedDesigns) {
        try {
          if (this.memory.addLearnedDesign) {
            this.memory.addLearnedDesign(design);
            result.imported++;
          }
        } catch (e) {
          result.conflicts.push({ type: 'learnedDesign', company: design.company, error: e.message });
          result.skipped++;
        }
      }
    }

    return result;
  }

  importKnowledgePack(data) {
    const result = { imported: 0, skipped: 0, conflicts: [] };

    if (!data || data.type !== 'knowledge_pack') {
      throw new Error('Invalid knowledge pack: missing type field or wrong type');
    }

    // Only import design system data, skip user-specific data
    if (Array.isArray(data.anchors)) {
      for (const anchor of data.anchors) {
        try {
          if (this.memory.addAnchor) {
            this.memory.addAnchor(anchor);
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
            this.memory.addRule(rule);
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
          if (this.memory.addLearnedDesign) {
            this.memory.addLearnedDesign(design);
            result.imported++;
          }
        } catch (e) {
          result.conflicts.push({ type: 'learnedDesign', error: e.message });
          result.skipped++;
        }
      }
    }

    return result;
  }

  mergePreferences(local, remote) {
    const merged = { ...local };

    // EMA merge for style vector
    if (remote.styleVector && local.styleVector) {
      const alpha = 0.3;
      merged.styleVector = {};
      const allKeys = new Set([
        ...Object.keys(local.styleVector),
        ...Object.keys(remote.styleVector),
      ]);
      for (const key of allKeys) {
        const localVal = local.styleVector[key] || 0;
        const remoteVal = remote.styleVector[key] || 0;
        merged.styleVector[key] = alpha * remoteVal + (1 - alpha) * localVal;
      }
    } else if (remote.styleVector) {
      merged.styleVector = { ...remote.styleVector };
    }

    // Sum feedback counts
    if (typeof remote.feedbackCount === 'number') {
      merged.feedbackCount = (local.feedbackCount || 0) + remote.feedbackCount;
    }

    // Use more recent sync timestamp
    if (remote.lastSync) {
      if (!local.lastSync || new Date(remote.lastSync) > new Date(local.lastSync)) {
        merged.lastSync = remote.lastSync;
      }
    }

    return merged;
  }
}

module.exports = { DataImporter };
