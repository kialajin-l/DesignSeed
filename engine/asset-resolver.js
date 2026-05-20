/**
 * DesignSeed - Asset Resolver
 * Resolves decorative icons from style-pack assets by tag/keyword.
 * Returns inline SVG strings ready for HTML embedding.
 */
const fs = require('fs');
const path = require('path');

/**
 * Create an asset resolver from a loaded style-pack.
 * @param {object} pack - result from style-pack-loader.loadPack()
 * @returns {object} resolver with pick(tag, opts) and pickMany(tags, count, opts)
 */
function createResolver(pack) {
  const assets = (pack.assets && pack.assets.assets) || [];
  const packDir = path.join(__dirname, '../style-packs', pack.meta.id, 'assets/stickers');

  // Build tag -> asset[] index
  const tagIndex = {};
  for (const a of assets) {
    for (const t of (a.tags || [])) {
      if (!tagIndex[t]) tagIndex[t] = [];
      tagIndex[t].push(a);
    }
  }

  // Cache loaded SVGs
  const svgCache = {};
  function loadSvg(file) {
    if (svgCache[file]) return svgCache[file];
    const fp = path.join(packDir, file);
    if (!fs.existsSync(fp)) return null;
    svgCache[file] = fs.readFileSync(fp, 'utf8');
    return svgCache[file];
  }

  /**
   * Pick a random icon matching a tag.
   * @param {string} tag - e.g. "heart", "star", "sparkle"
   * @param {object} opts - { size: 20, color: "#FF6B6B", opacity: 0.3 }
   * @returns {string|null} inline SVG string
   */
  function pick(tag, opts) {
    const candidates = tagIndex[tag] || [];
    if (candidates.length === 0) return null;
    const a = candidates[Math.floor(Math.random() * candidates.length)];
    const svg = loadSvg(a.file);
    if (!svg) return null;

    const size = (opts && opts.size) || 24;
    const color = (opts && opts.color) || 'currentColor';
    const opacity = (opts && opts.opacity != null) ? opts.opacity : 1;

    return svg.replace(/<svg/,
      '<svg width="' + size + '" height="' + size + '" style="color:' + color + ';opacity:' + opacity + ';display:inline-block;vertical-align:middle"'
    );
  }

  /**
   * Pick multiple icons for a section.
   * @param {string[]} tags - e.g. ["heart", "star"]
   * @param {number} count - how many icons to return
   * @param {object} opts - same as pick()
   * @returns {string[]} array of inline SVG strings
   */
  function pickMany(tags, count, opts) {
    const result = [];
    for (let i = 0; i < count; i++) {
      const tag = tags[i % tags.length];
      const svg = pick(tag, opts);
      if (svg) result.push(svg);
    }
    return result;
  }

  /**
   * Get available tags in this pack.
   * @returns {string[]}
   */
  function tags() {
    return Object.keys(tagIndex);
  }

  /**
   * Count assets for a tag.
   * @param {string} tag
   * @returns {number}
   */
  function count(tag) {
    return (tagIndex[tag] || []).length;
  }

  return { pick, pickMany, tags, count, tagIndex };
}

module.exports = { createResolver };

// CLI test
if (require.main === module) {
  const loader = require('./style-pack-loader');
  const pack = loader.loadPack('xiaohongshu-cute');
  const r = createResolver(pack);
  console.log('Available tags:', r.tags().join(', '));
  console.log('heart count:', r.count('heart'));
  console.log('star count:', r.count('star'));
  const icon = r.pick('heart', { size: 32, color: '#FF6B6B', opacity: 0.4 });
  console.log('Picked heart icon:', icon ? icon.slice(0, 80) + '...' : 'null');
  const icons = r.pickMany(['heart', 'star', 'sparkle'], 3, { size: 16, opacity: 0.25 });
  console.log('pickMany 3 icons:', icons.length, 'returned');
  console.log('');
  console.log('AssetResolver OK');
}
