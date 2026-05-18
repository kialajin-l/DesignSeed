'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

describe('Package entry smoke', () => {
  it('default package entry exposes COVE protocol surface', () => {
    const pkg = require(path.join(__dirname, '..', '..'));
    assert.strictEqual(typeof pkg.generatePreview, 'function');
    assert.strictEqual(typeof pkg.generateTree, 'function');
    assert.strictEqual(typeof pkg.listStyles, 'function');
    assert.strictEqual(typeof pkg.getProtocolInfo, 'function');
  });
});
