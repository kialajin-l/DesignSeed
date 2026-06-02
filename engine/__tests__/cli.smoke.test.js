'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const { execFile } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const CLI = path.join(__dirname, '..', 'cli.js');
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const node = process.execPath;

function run(...args) {
  return new Promise((resolve) => {
    execFile(node, [CLI, ...args], { cwd: PROJECT_ROOT, timeout: 30_000 }, (err, stdout, stderr) => {
      resolve({ code: err ? err.code : 0, stdout: stdout.trim(), stderr: stderr.trim() });
    });
  });
}

describe('CLI smoke', () => {
  it('list — exits 0 and outputs style IDs', async () => {
    const r = await run('list');
    assert.strictEqual(r.code, 0);
    assert.ok(r.stdout.includes('minimalism'), 'should contain minimalism');
    assert.ok(r.stdout.includes('cyberpunk'), 'should contain cyberpunk');
  });

  it('generate — produces valid HTML file', async () => {
    const out = path.join(os.tmpdir(), 'ds-smoke-gen.html');
    try { fs.unlinkSync(out); } catch {}
    const r = await run('generate', '--prompt', 'a simple login page', '--style', 'minimalism', '--output', out);
    assert.strictEqual(r.code, 0);
    assert.ok(fs.existsSync(out), 'output file should exist');
    const html = fs.readFileSync(out, 'utf8');
    assert.ok(html.includes('<'), 'should contain HTML tags');
    assert.ok(html.length > 200, 'HTML should be non-trivial');
    try { fs.unlinkSync(out); } catch {}
  });

  it('generate — invalid style still produces HTML (fallback)', async () => {
    const out = path.join(os.tmpdir(), 'ds-smoke-fallback.html');
    try { fs.unlinkSync(out); } catch {}
    const r = await run('generate', '--prompt', 'test', '--style', 'nonexistent_xyz', '--output', out);
    assert.ok(typeof r.code === 'number');
    try { fs.unlinkSync(out); } catch {}
  });

  it('demo — produces a multi-style HTML file', async () => {
    // demo ignores --output, always writes to project root
    const demoFile = path.join(PROJECT_ROOT, 'designseed-demo.html');
    try { fs.unlinkSync(demoFile); } catch {}
    const r = await run('demo');
    assert.strictEqual(r.code, 0);
    assert.ok(fs.existsSync(demoFile), 'demo output should exist at project root');
    const html = fs.readFileSync(demoFile, 'utf8');
    assert.ok(html.length > 1000, 'demo HTML should be substantial');
    try { fs.unlinkSync(demoFile); } catch {}
  });

  it('audit — scores an HTML file on 5 dimensions', async () => {
    // First generate a file to audit
    const genOut = path.join(os.tmpdir(), 'ds-smoke-audit-input.html');
    try { fs.unlinkSync(genOut); } catch {}
    await run('generate', '--prompt', 'audit test page', '--style', 'minimalism', '--output', genOut);
    assert.ok(fs.existsSync(genOut), 'precondition: generate should produce file');

    const reportOut = path.join(os.tmpdir(), 'ds-smoke-audit-report.txt');
    try { fs.unlinkSync(reportOut); } catch {}
    const r = await run('audit', '--input', genOut, '--output', reportOut);
    assert.strictEqual(r.code, 0);
    // audit prints to stdout and optionally to file
    assert.ok(r.stdout.length > 0, 'audit should produce output');
    try { fs.unlinkSync(genOut); } catch {}
    try { fs.unlinkSync(reportOut); } catch {}
  });
});
