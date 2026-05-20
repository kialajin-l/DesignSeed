'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const cove = path.join(__dirname, '..', 'cove-protocol.js');

function load() {
  // Fresh require
  const mod = require(cove);
  return mod;
}

describe('COVE protocol smoke', () => {
  it('getProtocolInfo — returns version and capabilities', () => {
    const proto = load();
    const r = proto.getProtocolInfo();
    assert.strictEqual(r.protocol, 'COVE-CANVAS-PROTOCOL');
    assert.ok(r.engineVersion, 'should have engineVersion');
    assert.ok(Array.isArray(r.capabilities), 'capabilities should be array');
    assert.ok(r.capabilities.includes('generatePreview'));
    assert.ok(r.capabilities.includes('listStyles'));
  });

  it('listStyles — returns 12 styles with required fields', () => {
    const proto = load();
    const r = proto.listStyles();
    assert.strictEqual(r.success, true);
    assert.ok(Array.isArray(r.data.styles));
    assert.ok(r.data.styles.length >= 12, 'should have at least 12 styles');
    const first = r.data.styles[0];
    assert.ok(first.id, 'style should have id');
    assert.ok(first.name, 'style should have name');
    assert.ok(first.nameEn, 'style should have nameEn');
    assert.ok(first.tone, 'style should have tone');
  });

  it('generatePreview — produces html + tree + meta', () => {
    const proto = load();
    const r = proto.generatePreview({ prompt: 'a login page', style: 'minimalism' });
    assert.strictEqual(r.success, true);
    assert.ok(r.data.html, 'should have html');
    assert.ok(r.data.tree, 'should have tree');
    assert.ok(r.data.meta, 'should have meta');
    assert.ok(r.data.html.includes('<'), 'html should contain tags');
    assert.strictEqual(r.data.meta.style, 'minimalism');
    assert.ok(r.data.meta.nodeCount > 0, 'nodeCount should be positive');
  });

  it('generateTree — produces tree without html', () => {
    const proto = load();
    const r = proto.generateTree({ prompt: 'a pricing page', style: 'cyberpunk' });
    assert.strictEqual(r.success, true);
    assert.ok(r.data.tree, 'should have tree');
    assert.ok(r.data.intent, 'should have intent');
  });

  it('getNodeById — retrieves a node from generated tree', () => {
    const proto = load();
    const gen = proto.generateTree({ prompt: 'test', style: 'minimalism' });
    const tree = gen.data.tree;
    // Find root node id
    const rootId = tree.root?.id || tree.root?.nodeId;
    if (rootId) {
      const r = proto.getNodeById({ tree, nodeId: rootId });
      assert.strictEqual(r.success, true);
      assert.ok(r.data.node, 'should return node');
    }
  });

  it('listNodes — returns nodes from a tree', () => {
    const proto = load();
    const gen = proto.generateTree({ prompt: 'test', style: 'minimalism' });
    const r = proto.listNodes({ tree: gen.data.tree });
    assert.strictEqual(r.success, true);
    assert.ok(Array.isArray(r.data.nodes), 'nodes should be array');
    assert.ok(r.data.nodes.length > 0, 'should have at least one node');
  });

  it('exportTree / importTree — roundtrip', () => {
    const proto = load();
    const gen = proto.generateTree({ prompt: 'test', style: 'minimalism' });
    const tree = gen.data.tree;
    const exported = proto.exportTree({ tree });
    assert.strictEqual(exported.success, true);
    assert.ok(exported.data, 'should have exported data');

    const imported = proto.importTree({ json: exported.data });
    assert.strictEqual(imported.success, true);
    assert.ok(imported.data.tree, 'should have tree after import');
  });

  it('generatePreview — unknown style returns error', () => {
    const proto = load();
    const r = proto.generatePreview({ prompt: 'test', style: 'totally_fake_xyz' });
    assert.strictEqual(r.success, false);
    assert.ok(r.error, 'should have error message');
    assert.ok(r.error.includes('STYLE_NOT_FOUND') || r.error.includes('Unknown style'));
  });

  it('generateFragment — produces HTML fragment', () => {
    const proto = load();
    const gen = proto.generateTree({ prompt: 'test', style: 'minimalism' });
    const r = proto.generateFragment({ tree: gen.data.tree });
    assert.strictEqual(r.success, true);
    assert.ok(r.data.html, 'should have html');
  });
});
