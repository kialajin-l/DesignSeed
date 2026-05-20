/**
 * DesignSeed - Iconify crawler
 */
const https = require('https');
const fs2 = require('fs');
const path = require('path');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'DesignSeed/0.1' } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) return reject(new Error('HTTP ' + res.statusCode));
        try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function searchIcons(query, limit) {
  const r = await fetch('https://api.iconify.design/search?query=' + encodeURIComponent(query) + '&limit=' + limit);
  return r.icons || [];
}

async function fetchBatch(names) {
  const groups = {};
  for (const n of names) {
    const i = n.indexOf(':');
    const prefix = n.substring(0, i);
    const icon = n.substring(i + 1);
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(icon);
  }
  const results = {};
  for (const [prefix, icons] of Object.entries(groups)) {
    for (let i = 0; i < icons.length; i += 100) {
      const batch = icons.slice(i, i + 100);
      const url = 'https://api.iconify.design/' + prefix + '.json?icons=' + batch.join(',');
      try {
        const data = await fetch(url);
        if (data.icons) {
          for (const [name, svg] of Object.entries(data.icons)) {
            results[prefix + ':' + name] = svg;
          }
        }
      } catch (e) { console.error('  warn:', e.message); }
      await sleep(200);
    }
  }
  return results;
}

function saveSvg(svgData, name, dir) {
  const safe = name.replace(/[:/]/g, '_');
  const body = svgData.body || '';
  const w = svgData.width || 24;
  const h = svgData.height || 24;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' + body + '</svg>';
  fs2.writeFileSync(path.join(dir, safe + '.svg'), svg, 'utf8');
  return { id: name, file: safe + '.svg', width: w, height: h, source: 'iconify', tags: [] };
}

async function crawl(packId, tags, maxPerTag) {
  const packDir = path.join(__dirname, '../../style-packs', packId);
  const stickersDir = path.join(packDir, 'assets/stickers');
  const indexPath = path.join(packDir, 'assets/index.json');
  fs2.mkdirSync(stickersDir, { recursive: true });

  let index = { version: '0.1.0', sources: [{ id: 'iconify', name: 'Iconify', url: 'https://iconify.design', license: 'Apache-2.0' }], assets: [], tagIndex: {} };
  if (fs2.existsSync(indexPath)) index = JSON.parse(fs2.readFileSync(indexPath, 'utf8'));

  const existing = new Set(index.assets.map(a => a.id));
  let totalNew = 0;

  for (const tag of tags) {
    console.log('search:', tag);
    const names = await searchIcons(tag, maxPerTag);
    console.log('  found:', names.length);
    const fresh = names.filter(n => !existing.has(n));
    if (!fresh.length) { console.log('  skip (all exist)'); continue; }

    const svgs = await fetchBatch(fresh);
    const count = Object.keys(svgs).length;
    console.log('  fetched:', count);

    for (const [name, svg] of Object.entries(svgs)) {
      const meta = saveSvg(svg, name, stickersDir);
      meta.tags = [tag];
      index.assets.push(meta);
      existing.add(name);
    }
    if (!index.tagIndex[tag]) index.tagIndex[tag] = [];
    for (const name of Object.keys(svgs)) index.tagIndex[tag].push(name);

    totalNew += count;
    console.log('  saved:', count);
    await sleep(500);
  }

  fs2.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
  console.log('done! +' + totalNew + ' total=' + index.assets.length);
}

const args = process.argv.slice(2);
const get = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
crawl(
  get('--pack', 'xiaohongshu-cute'),
  get('--tags', 'cute,love,star,decoration,step,check,arrow,note,heart,sparkle').split(','),
  parseInt(get('--limit', '15'))
).catch(e => { console.error('error:', e.message); process.exit(1); });
