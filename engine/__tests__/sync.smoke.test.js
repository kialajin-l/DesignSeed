'use strict';

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const DesignMemory = require('../../memory/store');
const { DataExporter } = require('../../sync/exporter');
const { DataImporter } = require('../../sync/importer');

const TEST_DB = path.join(os.tmpdir(), 'ds-sync-test-' + Date.now() + '.db');

describe('Sync smoke', () => {
  let mem, exporter, importer;

  before(() => {
    mem = new DesignMemory(TEST_DB);
    mem.init();
    exporter = new DataExporter(mem);
    importer = new DataImporter(mem);
  });

  after(() => {
    mem.close();
    try { fs.unlinkSync(TEST_DB); } catch {}
    try { fs.unlinkSync(TEST_DB + '-wal'); } catch {}
    try { fs.unlinkSync(TEST_DB + '-shm'); } catch {}
  });

  it('exportAll — returns structured data', () => {
    const data = exporter.exportAll();
    assert.ok(data.version, 'should have version');
    assert.ok(data.exportedAt, 'should have exportedAt');
    assert.ok(data.deviceId, 'should have deviceId');
    assert.ok(Array.isArray(data.design_systems), 'should have design_systems array');
    assert.ok(Array.isArray(data.design_anchors), 'should have design_anchors array');
    assert.ok(Array.isArray(data.user_preferences), 'should have user_preferences array');
    assert.ok(Array.isArray(data.custom_rules), 'should have custom_rules array');
  });

  it('export → import roundtrip — imported > 0', () => {
    // Seed some data
    mem.setPreference('warmth', 0.7, 0.6);
    mem.saveAnchor({ prompt: 'test login page', style: 'minimalism' });
    mem.addRule({ rule_type: 'aesthetic', dimension: 'contrast', condition: 'min_ratio', threshold: 4.5, action: 'adjust' });

    // Export
    const exported = exporter.exportAll();
    assert.ok(exported.user_preferences.length > 0, 'should have preferences after seed');
    assert.ok(exported.design_anchors.length > 0, 'should have anchors after seed');

    // Import into fresh memory
    const mem2 = new DesignMemory(path.join(os.tmpdir(), 'ds-sync-test2-' + Date.now() + '.db'));
    mem2.init();
    const importer2 = new DataImporter(mem2);
    const result = importer2.importFull(exported);

    assert.ok(result.imported > 0, 'should import at least 1 record, got ' + result.imported);
    assert.strictEqual(result.conflicts.length, 0, 'should have no conflicts');

    // Verify data survived the roundtrip
    const prefs = mem2.getAllPreferences();
    assert.ok(prefs.length > 0, 'preferences should survive roundtrip');

    mem2.close();
    try { fs.unlinkSync(mem2.dbPath); } catch {}
    try { fs.unlinkSync(mem2.dbPath + '-wal'); } catch {}
    try { fs.unlinkSync(mem2.dbPath + '-shm'); } catch {}
  });

  it('export → file → import — file-based roundtrip', () => {
    const tmpFile = path.join(os.tmpdir(), 'ds-sync-export-' + Date.now() + '.json');
    exporter.exportAll(tmpFile);
    assert.ok(fs.existsSync(tmpFile));

    const raw = JSON.parse(fs.readFileSync(tmpFile, 'utf8'));
    assert.ok(raw.design_systems !== undefined, 'file should contain design_systems');

    const mem3 = new DesignMemory(path.join(os.tmpdir(), 'ds-sync-test3-' + Date.now() + '.db'));
    mem3.init();
    const importer3 = new DataImporter(mem3);
    const result = importer3.importFull(raw);
    assert.ok(result.imported > 0);

    mem3.close();
    try { fs.unlinkSync(tmpFile); } catch {}
    try { fs.unlinkSync(mem3.dbPath); } catch {}
    try { fs.unlinkSync(mem3.dbPath + '-wal'); } catch {}
    try { fs.unlinkSync(mem3.dbPath + '-shm'); } catch {}
  });
  it('exportKnowledgePack includes anchors, rules and learned designs', () => {
    mem.saveAnchor({ prompt: 'kp test', style: 'minimalism' });
    mem.addRule({ rule_type: 'aesthetic', dimension: 'spacing', condition: 'multiple_of', threshold: 8, action: 'adjust' });
    mem.saveDesignSystem({ company: 'Acme', content: 'demo design system' });

    const pack = exporter.exportKnowledgePack();
    assert.ok(Array.isArray(pack.anchors), 'should have anchors array');
    assert.ok(Array.isArray(pack.rules), 'should have rules array');
    assert.ok(Array.isArray(pack.learnedDesigns), 'should have learnedDesigns array');
    assert.ok(pack.anchors.length > 0, 'knowledge pack should include anchors');
    assert.ok(pack.rules.length > 0, 'knowledge pack should include rules');
    assert.ok(pack.learnedDesigns.length > 0, 'knowledge pack should include learned designs');
  });

  it('sync CLI export/import creates file and reports result', () => {
    const cwd = path.join(__dirname, '..', '..');
    const outFile = path.join(os.tmpdir(), 'ds-sync-cli-' + Date.now() + '.json');

    const exportRun = spawnSync(process.execPath, ['sync/exporter.js', '--output', outFile], {
      cwd,
      encoding: 'utf8',
    });
    assert.strictEqual(exportRun.status, 0, exportRun.stderr || exportRun.stdout);
    assert.ok(fs.existsSync(outFile), 'sync export CLI should create output file');

    const importRun = spawnSync(process.execPath, ['sync/importer.js', '--input', outFile], {
      cwd,
      encoding: 'utf8',
    });
    assert.strictEqual(importRun.status, 0, importRun.stderr || importRun.stdout);
    assert.ok(/imported|success|done/i.test(importRun.stdout), 'sync import CLI should report result');

    try { fs.unlinkSync(outFile); } catch {}
  });
});
