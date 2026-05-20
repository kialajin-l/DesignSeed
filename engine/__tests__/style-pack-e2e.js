/**
 * DesignSeed - Style Pack E2E Test (with asset decoration)
 * Verifies: pack load -> resolver create -> style inject -> render -> HTML with SVG icons
 */
const loader = require('../style-pack-loader');
const { createResolver } = require('../asset-resolver');
const renderer = require('../renderer');
const fs = require('fs');
const path = require('path');

function test() {
  console.log('=== Style Pack E2E Test (with assets) ===');
  console.log('');

  // 1. Load pack
  const pack = loader.loadPack('xiaohongshu-cute');
  console.log('1. Pack loaded:', pack.meta.name);
  console.log('   Palettes:', Object.keys(pack.palettes).join(', '));
  console.log('   Assets:', pack.assets.assets.length, 'icons');

  // 2. Create resolver
  const resolver = createResolver(pack);
  console.log('2. Resolver created');
  console.log('   Tags:', resolver.tags().join(', '));
  console.log('   heart:', resolver.count('heart'), '  star:', resolver.count('star'), '  sparkle:', resolver.count('sparkle'));

  // 3. Convert palette to renderer style and inject resolver
  const style = loader.paletteToRendererStyle(pack.palettes['pink-warm'], pack.fonts);
  style._resolver = resolver;
  console.log('3. Style ready with resolver injected');

  // 4. Render HTML
  const html = renderer.render('小红书可爱风教程', { style: style });
  console.log('4. HTML rendered:', html.length, 'chars');

  // 5. Verify output
  var svgCount = (html.match(/<svg/g) || []).length;
  var checks = [
    ['has DOCTYPE', html.indexOf('<!DOCTYPE html>') >= 0],
    ['has primary color #FF6B6B', html.indexOf('#FF6B6B') >= 0],
    ['has font Noto Sans SC', html.indexOf('Noto Sans SC') >= 0],
    ['has border-radius 20px', html.indexOf('20px') >= 0],
    ['has dashed border', html.indexOf('dashed') >= 0],
    ['has SVG icons (>=5)', svgCount >= 5],
    ['hero has decorative icons', html.indexOf('position:absolute') >= 0 && html.indexOf('pointer-events:none') >= 0],
    ['nav has logo icon', html.indexOf('<nav') >= 0 && html.indexOf('<svg') >= 0],
  ];
  console.log('5. Checks (' + svgCount + ' SVGs found):');
  var allPass = true;
  for (var i = 0; i < checks.length; i++) {
    var label = checks[i][0];
    var ok = checks[i][1];
    console.log('   ' + (ok ? 'PASS' : 'FAIL') + ' ' + label);
    if (!ok) allPass = false;
  }

  // 6. Save sample output
  var outDir = path.join(__dirname, '../../output');
  fs.mkdirSync(outDir, { recursive: true });
  var outPath = path.join(outDir, 'xiaohongshu-cute-sample.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log('6. Sample saved:', outPath);

  console.log('');
  console.log(allPass ? 'ALL PASSED' : 'SOME FAILED');
  process.exit(allPass ? 0 : 1);
}

test();
