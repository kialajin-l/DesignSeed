'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { execFile } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const RULES_CLI = path.join(__dirname, '..', '..', 'rules', 'cli.js');
const ENGINE_CLI = path.join(__dirname, '..', 'cli.js');
const node = process.execPath;

function run(cmd, args) {
  return new Promise((resolve) => {
    execFile(node, args, { cwd: path.join(__dirname, '..', '..'), timeout: 30_000 }, (err, stdout, stderr) => {
      resolve({ code: err ? err.code : 0, stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
}

describe('Rules smoke', () => {
  it('rules list — exits 0 and lists rules', async () => {
    const r = await run('rules', [RULES_CLI, 'list']);
    assert.strictEqual(r.code, 0);
    assert.ok(r.stdout.includes('rule') || r.stdout.includes('Rule') || r.stdout.includes('['), 'should list rules');
  });

  it('rules check — validates a generated HTML file', async () => {
    // First generate a file
    const htmlFile = path.join(os.tmpdir(), 'ds-rules-test.html');
    try { fs.unlinkSync(htmlFile); } catch {}
    const gen = await run('gen', [ENGINE_CLI, 'generate', '--prompt', 'a simple page', '--style', 'minimalism', '--output', htmlFile]);
    assert.strictEqual(gen.code, 0);
    assert.ok(fs.existsSync(htmlFile));

    // Then check it
    const r = await run('check', [RULES_CLI, 'check', '--file', htmlFile]);
    assert.strictEqual(r.code, 0);
    // Should output JSON result
    assert.ok(r.stdout.includes('{'), 'should output JSON');
    try { fs.unlinkSync(htmlFile); } catch {}
  });

  it('rules validate — validates an HTML string', async () => {
    const r = await run('validate', [RULES_CLI, 'validate', '--html', '<html><body><h1>Test</h1></body></html>']);
    assert.strictEqual(r.code, 0);
    assert.ok(r.stdout.includes('{'), 'should output JSON');
  });
});
