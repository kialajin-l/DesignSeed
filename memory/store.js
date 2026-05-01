const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

class DesignMemory {
  constructor(dbPath) {
    this.dbPath = dbPath || path.join(__dirname, 'designseed.db');
    this.db = null;
  }

  init() {
    this.db = new Database(this.dbPath);
    this.db.pragma('journal_mode = WAL');
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    this.db.exec(schema);
    return this;
  }

  _ensure() {
    if (!this.db) throw new Error('Database not initialized. Call init() first.');
  }

  saveDesignSystem(data) {
    this._ensure();
    const stmt = this.db.prepare(`INSERT INTO design_systems (company, url, content, colors, typography, layout, components, tone, philosophy, quality_score, source) VALUES (@company, @url, @content, @colors, @typography, @layout, @components, @tone, @philosophy, @quality_score, @source)`);
    const result = stmt.run({ company: data.company, url: data.url || null, content: data.content || null, colors: data.colors ? JSON.stringify(data.colors) : null, typography: data.typography ? JSON.stringify(data.typography) : null, layout: data.layout ? JSON.stringify(data.layout) : null, components: data.components ? JSON.stringify(data.components) : null, tone: data.tone ? JSON.stringify(data.tone) : null, philosophy: data.philosophy || null, quality_score: data.quality_score || 0, source: data.source || null });
    return result.lastInsertRowid;
  }

  getDesignSystem(id) {
    this._ensure();
    const row = this.db.prepare('SELECT * FROM design_systems WHERE id = ?').get(id);
    return row ? this._parseDesignSystem(row) : null;
  }

  listDesignSystems(filters = {}) {
    this._ensure();
    let sql = 'SELECT * FROM design_systems';
    const conditions = [];
    const params = {};
    if (filters.company) { conditions.push('company LIKE @company'); params.company = `%${filters.company}%`; }
    if (filters.minScore !== undefined) { conditions.push('quality_score >= @minScore'); params.minScore = filters.minScore; }
    if (filters.source) { conditions.push('source = @source'); params.source = filters.source; }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY learned_at DESC';
    if (filters.limit) { sql += ' LIMIT @limit'; params.limit = filters.limit; }
    if (filters.offset) { sql += ' OFFSET @offset'; params.offset = filters.offset; }
    return this.db.prepare(sql).all(params).map(r => this._parseDesignSystem(r));
  }

  searchDesignSystems(query) {
    this._ensure();
    const stmt = this.db.prepare(`SELECT * FROM design_systems WHERE company LIKE @q OR content LIKE @q OR philosophy LIKE @q ORDER BY quality_score DESC LIMIT 20`);
    return stmt.all({ q: `%${query}%` }).map(r => this._parseDesignSystem(r));
  }

  _parseDesignSystem(row) {
    const parsed = { ...row };
    for (const key of ['colors', 'typography', 'layout', 'components', 'tone']) {
      if (parsed[key]) { try { parsed[key] = JSON.parse(parsed[key]); } catch {} }
    }
    return parsed;
  }

  saveAnchor(data) {
    this._ensure();
    const stmt = this.db.prepare(`INSERT INTO design_anchors (prompt, style, params, output_path, output_hash, user_modifications, final_version_hash, feedback_signal) VALUES (@prompt, @style, @params, @output_path, @output_hash, @user_modifications, @final_version_hash, @feedback_signal)`);
    const result = stmt.run({ prompt: data.prompt, style: data.style || null, params: data.params ? JSON.stringify(data.params) : null, output_path: data.output_path || null, output_hash: data.output_hash || null, user_modifications: data.user_modifications || 0, final_version_hash: data.final_version_hash || null, feedback_signal: data.feedback_signal ? JSON.stringify(data.feedback_signal) : null });
    return result.lastInsertRowid;
  }

  updateAnchor(id, updates) {
    this._ensure();
    const allowed = ['prompt', 'style', 'params', 'output_path', 'output_hash', 'user_modifications', 'final_version_hash', 'feedback_signal'];
    const sets = [];
    const params = { id };
    for (const key of allowed) {
      if (updates[key] !== undefined) {
        sets.push(`${key} = @${key}`);
        params[key] = (key === 'params' || key === 'feedback_signal') ? JSON.stringify(updates[key]) : updates[key];
      }
    }
    if (sets.length === 0) return false;
    sets.push('updated_at = CURRENT_TIMESTAMP');
    const sql = `UPDATE design_anchors SET ${sets.join(', ')} WHERE id = @id`;
    return this.db.prepare(sql).run(params).changes > 0;
  }

  getAnchor(id) {
    this._ensure();
    const row = this.db.prepare('SELECT * FROM design_anchors WHERE id = ?').get(id);
    return row ? this._parseAnchor(row) : null;
  }

  listAnchors(filters = {}) {
    this._ensure();
    let sql = 'SELECT * FROM design_anchors';
    const conditions = [];
    const params = {};
    if (filters.style) { conditions.push('style = @style'); params.style = filters.style; }
    if (filters.promptLike) { conditions.push('prompt LIKE @promptLike'); params.promptLike = `%${filters.promptLike}%`; }
    if (filters.since) { conditions.push('created_at >= @since'); params.since = filters.since; }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';
    if (filters.limit) { sql += ' LIMIT @limit'; params.limit = filters.limit; }
    if (filters.offset) { sql += ' OFFSET @offset'; params.offset = filters.offset; }
    return this.db.prepare(sql).all(params).map(r => this._parseAnchor(r));
  }

  getRecentAnchors(limit = 10) {
    this._ensure();
    return this.db.prepare('SELECT * FROM design_anchors ORDER BY created_at DESC LIMIT ?').all(limit).map(r => this._parseAnchor(r));
  }

  _parseAnchor(row) {
    const parsed = { ...row };
    for (const key of ['params', 'feedback_signal']) {
      if (parsed[key]) { try { parsed[key] = JSON.parse(parsed[key]); } catch {} }
    }
    return parsed;
  }

  setPreference(dimension, value, confidence = 0.5) {
    this._ensure();
    const existing = this.db.prepare('SELECT id FROM user_preferences WHERE dimension = ?').get(dimension);
    if (existing) {
      this.db.prepare(`UPDATE user_preferences SET value = @value, confidence = @confidence, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run({ value, confidence, id: existing.id });
      return existing.id;
    } else {
      const result = this.db.prepare(`INSERT INTO user_preferences (dimension, value, confidence, sample_count) VALUES (@dimension, @value, @confidence, 1)`).run({ dimension, value, confidence });
      return result.lastInsertRowid;
    }
  }

  getPreference(dimension) {
    this._ensure();
    return this.db.prepare('SELECT * FROM user_preferences WHERE dimension = ?').get(dimension) || null;
  }

  getAllPreferences() {
    this._ensure();
    return this.db.prepare('SELECT * FROM user_preferences ORDER BY confidence DESC').all();
  }

  updatePreferenceFromFeedback(dimension, feedbackValue) {
    this._ensure();
    const existing = this.db.prepare('SELECT * FROM user_preferences WHERE dimension = ?').get(dimension);
    if (!existing) return this.setPreference(dimension, feedbackValue, 0.3);
    const alpha = 0.3;
    const newValue = alpha * feedbackValue + (1 - alpha) * existing.value;
    const newConfidence = Math.min(1.0, existing.confidence + 0.05);
    const newSampleCount = existing.sample_count + 1;
    this.db.prepare(`UPDATE user_preferences SET value = @value, confidence = @confidence, sample_count = @sample_count, updated_at = CURRENT_TIMESTAMP WHERE id = @id`).run({ value: Math.round(newValue * 1000) / 1000, confidence: Math.round(newConfidence * 1000) / 1000, sample_count: newSampleCount, id: existing.id });
    return existing.id;
  }

  addRule(rule) {
    this._ensure();
    const result = this.db.prepare(`INSERT INTO custom_rules (rule_type, dimension, condition, threshold, action, source) VALUES (@rule_type, @dimension, @condition, @threshold, @action, @source)`).run({ rule_type: rule.rule_type, dimension: rule.dimension, condition: rule.condition, threshold: rule.threshold || null, action: rule.action || 'adjust', source: rule.source || 'local' });
    return result.lastInsertRowid;
  }

  removeRule(id) {
    this._ensure();
    return this.db.prepare('DELETE FROM custom_rules WHERE id = ?').run(id).changes > 0;
  }

  getRules(filters = {}) {
    this._ensure();
    let sql = 'SELECT * FROM custom_rules';
    const conditions = [];
    const params = {};
    if (filters.rule_type) { conditions.push('rule_type = @rule_type'); params.rule_type = filters.rule_type; }
    if (filters.dimension) { conditions.push('dimension = @dimension'); params.dimension = filters.dimension; }
    if (filters.enabled !== undefined) { conditions.push('enabled = @enabled'); params.enabled = filters.enabled ? 1 : 0; }
    if (filters.source) { conditions.push('source = @source'); params.source = filters.source; }
    if (conditions.length > 0) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC';
    return this.db.prepare(sql).all(params);
  }

  toggleRule(id, enabled) {
    this._ensure();
    return this.db.prepare('UPDATE custom_rules SET enabled = ? WHERE id = ?').run(enabled ? 1 : 0, id).changes > 0;
  }

  getStats() {
    this._ensure();
    const ds = this.db.prepare('SELECT COUNT(*) as c FROM design_systems').get().c;
    const an = this.db.prepare('SELECT COUNT(*) as c FROM design_anchors').get().c;
    const pr = this.db.prepare('SELECT COUNT(*) as c FROM user_preferences').get().c;
    const ru = this.db.prepare('SELECT COUNT(*) as c FROM custom_rules').get().c;
    const la = this.db.prepare('SELECT created_at FROM design_anchors ORDER BY created_at DESC LIMIT 1').get();
    const ld = this.db.prepare('SELECT learned_at FROM design_systems ORDER BY learned_at DESC LIMIT 1').get();
    return { design_systems: ds, anchors: an, preferences: pr, rules: ru, last_anchor_at: la ? la.created_at : null, last_design_system_at: ld ? ld.learned_at : null };
  }

  exportAll() {
    this._ensure();
    return { version: 1, exported_at: new Date().toISOString(), design_systems: this.db.prepare('SELECT * FROM design_systems').all(), design_anchors: this.db.prepare('SELECT * FROM design_anchors').all(), user_preferences: this.db.prepare('SELECT * FROM user_preferences').all(), custom_rules: this.db.prepare('SELECT * FROM custom_rules').all() };
  }

  importAll(data) {
    this._ensure();
    const insertAll = this.db.transaction((table, rows) => {
      if (!rows || rows.length === 0) return 0;
      const keys = Object.keys(rows[0]);
      const placeholders = keys.map(k => `@${k}`).join(', ');
      const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
      const stmt = this.db.prepare(sql);
      let count = 0;
      for (const row of rows) { stmt.run(row); count++; }
      return count;
    });
    return { design_systems: insertAll('design_systems', data.design_systems), design_anchors: insertAll('design_anchors', data.design_anchors), user_preferences: insertAll('user_preferences', data.user_preferences), custom_rules: insertAll('custom_rules', data.custom_rules) };
  }


  // ─── 风格预设 ──────────────────────────────────────────────

  savePreset(data) {
    this._ensure();
    const stmt = this.db.prepare('INSERT INTO style_presets (name, description, style_a, style_b, ratio, params) VALUES (@name, @description, @style_a, @style_b, @ratio, @params)');
    const result = stmt.run({ name: data.name, description: data.description || null, style_a: data.styleA, style_b: data.styleB, ratio: data.ratio || 0.5, params: data.params ? JSON.stringify(data.params) : null });
    return result.lastInsertRowid;
  }

  getPreset(name) {
    this._ensure();
    const row = this.db.prepare('SELECT * FROM style_presets WHERE name = ?').get(name);
    return row ? this._parsePreset(row) : null;
  }

  listPresets() {
    this._ensure();
    return this.db.prepare('SELECT * FROM style_presets ORDER BY use_count DESC, created_at DESC').all().map(r => this._parsePreset(r));
  }

  deletePreset(name) {
    this._ensure();
    return this.db.prepare('DELETE FROM style_presets WHERE name = ?').run(name).changes > 0;
  }

  usePreset(name) {
    this._ensure();
    this.db.prepare('UPDATE style_presets SET use_count = use_count + 1, updated_at = CURRENT_TIMESTAMP WHERE name = ?').run(name);
    return this.getPreset(name);
  }

  _parsePreset(row) {
    const parsed = { ...row };
    if (parsed.params) { try { parsed.params = JSON.parse(parsed.params); } catch {} }
    return parsed;
  }

  close() {
    if (this.db) { this.db.close(); this.db = null; }
  }
}

module.exports = DesignMemory;