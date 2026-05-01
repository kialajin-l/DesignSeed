#!/usr/bin/env node
/**
 * DesignSeed — CLI 入口
 *
 * Usage:
 *   node engine/cli.js generate --prompt "做一个金融App首页" --style "minimalism" --output ./output.html --screenshot
 *   node engine/cli.js screenshot --input ./output.html --output ./output.png
 *   node engine/cli.js screenshot-all --input ./demo/ --output ./demo/
 *   node engine/cli.js demo
 *   node engine/cli.js list
 */

const fs = require('fs');
const path = require('path');
const renderer = require('./renderer');
const styles = require('./templates/styles');
const mixer = require('./mixer');
const { DesignMemory } = require('../memory');

function parseArgs(argv) {
  const args = {};
  const positional = [];
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  return { command: positional[0], args, positional };
}

async function cmdGenerate(opts) {
  const prompt = opts.prompt || opts.p;
  const style = opts.style || opts.s || 'minimalism';
  const output = opts.output || opts.o || './designseed-output.html';
  const title = opts.title || opts.t;
  const doScreenshot = opts.screenshot || opts.ss;

  if (!prompt) {
    console.error('Error: --prompt is required for generate command');
    console.error('Usage: node engine/cli.js generate --prompt "Your prompt here" --style "minimalism"');
    process.exit(1);
  }

  // Validate style (supports mix syntax)
  const mixCheck = mixer.parseMixString(style);
  if (mixCheck) {
    if (!styles[mixCheck.styleA] || !styles[mixCheck.styleB]) {
      console.error(`Error: Mixed style "${style}" has unknown component`);
      process.exit(1);
    }
  } else if (!styles[style]) {
    console.error(`Error: Unknown style "${style}"`);
    console.error(`Available styles: ${Object.keys(styles).filter(k => !k.startsWith('_') && k !== 'STYLE_INDEX').join(', ')}`);
    process.exit(1);
  }

  console.log(`Generating page with style: ${style}...`);
  const html = renderer.render(prompt, { style, title: title || prompt });
  const outPath = path.resolve(output);
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`Done! Output: ${outPath} (${html.length} bytes)`);

  // Screenshot if requested
  if (doScreenshot) {
    const { Screenshotter } = require('./screenshot');
    const ssPath = typeof doScreenshot === 'string'
      ? path.resolve(doScreenshot)
      : outPath.replace(/\.html$/i, '.png');
    const s = new Screenshotter();
    try {
      console.log('Taking screenshot...');
      const result = await s.screenshotFile(outPath, ssPath);
      const sizeKB = (result.size / 1024).toFixed(1);
      console.log(`Screenshot: ${result.width}x${result.height} (${sizeKB}KB) → ${result.path}`);
    } catch (err) {
      console.error('Screenshot failed:', err.message);
    } finally {
      await s.close();
    }
  }
}

async function cmdScreenshot(opts) {
  const input = opts.input || opts.html;
  const output = opts.output || opts.out;

  if (!input || !output) {
    console.error('Error: --input and --output are required');
    console.error('Usage: node engine/cli.js screenshot --input page.html --output page.png');
    process.exit(1);
  }

  const { Screenshotter } = require('./screenshot');
  const s = new Screenshotter({
    viewport: { width: parseInt(opts.width || '1440'), height: parseInt(opts.height || '900') },
    deviceScaleFactor: parseFloat(opts.scale || '2'),
    format: opts.format || 'png',
    fullPage: opts.fullpage !== 'false',
  });

  try {
    console.log('Taking screenshot...');
    const result = await s.screenshotFile(input, output);
    const sizeKB = (result.size / 1024).toFixed(1);
    console.log(`Done! ${result.width}x${result.height} (${sizeKB}KB) → ${result.path}`);
  } catch (err) {
    console.error('Screenshot failed:', err.message);
    process.exit(1);
  } finally {
    await s.close();
  }
}

async function cmdScreenshotAll(opts) {
  const inputDir = opts.input || './demo/';
  const outputDir = opts.output || opts.out || inputDir;

  const { Screenshotter } = require('./screenshot');
  const s = new Screenshotter({
    viewport: { width: parseInt(opts.width || '1440'), height: parseInt(opts.height || '900') },
    deviceScaleFactor: parseFloat(opts.scale || '2'),
  });

  try {
    const absDir = path.resolve(inputDir);
    const htmlFiles = fs.readdirSync(absDir).filter(f => f.endsWith('.html'));
    if (htmlFiles.length === 0) {
      console.log('No HTML files found in', absDir);
      return;
    }

    console.log(`Found ${htmlFiles.length} HTML files, taking screenshots...`);
    const tasks = htmlFiles.map(f => ({
      html: path.join(absDir, f),
      output: path.join(path.resolve(outputDir), f.replace(/\.html$/i, '.png')),
    }));

    const results = await s.screenshotBatch(tasks);
    for (const r of results) {
      if (r.success) {
        const sizeKB = (r.size / 1024).toFixed(1);
        console.log(`  ✓ ${path.basename(r.output)} (${sizeKB}KB)`);
      } else {
        console.log(`  ✗ ${path.basename(r.html)}: ${r.error}`);
      }
    }
    console.log(`Done! ${results.filter(r => r.success).length}/${results.length} screenshots saved.`);
  } finally {
    await s.close();
  }
}

async function cmdDemo() {
  console.log('Generating demo page with all 12 styles...');
  const html = renderer.generateDemo();
  const outPath = path.resolve('./designseed-demo.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`Done! Output: ${outPath} (${html.length} bytes)`);
}

async function cmdList() {
  const list = renderer.listStyles();
  console.log('\n  Available Styles:\n');
  console.log('  ID              Name              Formality  Warmth  Complexity  Innovation');
  console.log('  ─────────────── ───────────────── ─────────  ──────  ──────────  ──────────');
  for (const s of list) {
    const id = s.id.padEnd(16);
    const name = (s.name + ' (' + s.nameEn + ')').padEnd(17);
    const t = s.tone;
    console.log(`  ${id} ${name} ${String(t.formality).padEnd(9)} ${String(t.warmth).padEnd(7)} ${String(t.complexity).padEnd(11)} ${t.innovation}`);
  }
  console.log('');
}


// ─── v0.2: 风格混合命令 ──────────────────────────────────────

async function cmdMix(opts) {
  const styleA = opts.styleA || opts.a;
  const styleB = opts.styleB || opts.b;
  const ratio = parseFloat(opts.ratio || opts.r || '0.5');
  const output = opts.output || opts.o;
  const prompt = opts.prompt || opts.p || 'Mixed Style Preview';

  if (!styleA || !styleB) {
    console.error('Error: --styleA and --styleB are required');
    console.error('Usage: node engine/cli.js mix --styleA minimalism --styleB cyberpunk --ratio 0.3');
    process.exit(1);
  }

  try {
    const mixed = mixer.blend(styleA, styleB, { ratio });
    console.log('');
    console.log('  Mixed Style: ' + mixed.name + ' (' + mixed.nameEn + ')');
    console.log('');
    console.log('  Tone:');
    for (const [k, v] of Object.entries(mixed.tone)) {
      console.log('    ' + k + ': ' + v);
    }
    console.log('  Colors: primary=' + mixed.colors.primary + ' bg=' + mixed.colors.background);
    console.log('  Layout: borderRadius=' + mixed.layout.borderRadius + ' spacing=' + mixed.layout.spacing);
    console.log('  Typography: lineHeight=' + mixed.typography.lineHeight + ' scale=' + mixed.typography.scale.join('/'));

    if (output) {
      const html = renderer.render(prompt, { style: mixed, title: mixed.name });
      const outPath = require('path').resolve(output);
      fs.writeFileSync(outPath, html, 'utf8');
      console.log('');
      console.log('  HTML output: ' + outPath + ' (' + html.length + ' bytes)');
    }
    console.log('');
  } catch (err) {
    console.error('Error: ' + err.message);
    process.exit(1);
  }
}

async function cmdSimilar(opts) {
  const styleId = opts.style || opts.s;
  const topN = parseInt(opts.top || opts.n || '5');

  if (!styleId) {
    console.error('Error: --style is required');
    console.error('Usage: node engine/cli.js similar --style cyberpunk --top 3');
    process.exit(1);
  }

  const target = styles[styleId];
  if (!target) {
    console.error('Error: Unknown style "' + styleId + '"');
    console.error('Available: ' + Object.keys(styles).filter(k => !k.startsWith('_') && k !== 'STYLE_INDEX').join(', '));
    process.exit(1);
  }

  const results = mixer.findSimilar(styleId, topN);
  console.log('');
  console.log('  Most similar to "' + target.name + '" (' + styleId + '):');
  console.log('  ' + '-'.repeat(50));
  for (const r of results) {
    const pct = (r.similarity * 100).toFixed(1);
    const bar = String.fromCharCode(9608).repeat(Math.round(r.similarity * 20));
    console.log('  ' + r.name.padEnd(10) + ' (' + r.id.padEnd(14) + ') ' + pct + '% ' + bar);
  }
  console.log('');
}


async function cmdPreset(opts) {
  const sub = opts._positional || opts.positional;

  const mem = new DesignMemory();
  mem.init();

  try {
    if (sub === 'save' || sub === 'add') {
      const name = opts.name || opts.n;
      const styleA = opts.styleA || opts.a;
      const styleB = opts.styleB || opts.b;
      const ratio = parseFloat(opts.ratio || opts.r || '0.5');
      const desc = opts.desc || opts.d || '';

      if (!name || !styleA || !styleB) {
        console.error('Error: --name, --styleA, --styleB are required');
        console.error('Usage: node engine/cli.js preset save --name "my-style" --styleA minimalism --styleB cyberpunk --ratio 0.3');
        process.exit(1);
      }

      try {
        const id = mem.savePreset({ name, styleA, styleB, ratio, description: desc });
        console.log('');
        console.log('  Saved preset: ' + name);
        console.log('  ' + styleA + ' × ' + styleB + ' (ratio=' + ratio + ')');
        console.log('  ID: ' + id);
        console.log('');
      } catch (err) {
        if (err.message && err.message.includes('UNIQUE')) {
          console.error('Error: Preset "' + name + '" already exists. Use a different name.');
        } else {
          console.error('Error: ' + err.message);
        }
        process.exit(1);
      }

    } else if (sub === 'load' || sub === 'use') {
      const name = opts.name || opts.n;
      if (!name) {
        console.error('Error: --name is required');
        console.error('Usage: node engine/cli.js preset load --name "my-style"');
        process.exit(1);
      }

      const preset = mem.usePreset(name);
      if (!preset) {
        console.error('Error: Preset "' + name + '" not found');
        process.exit(1);
      }

      console.log('');
      console.log('  Loaded preset: ' + preset.name);
      console.log('  ' + preset.style_a + ' × ' + preset.style_b + ' (ratio=' + preset.ratio + ')');
      console.log('  Used ' + preset.use_count + ' times');
      console.log('');

      // 生成混合风格
      const mixed = mixer.blend(preset.style_a, preset.style_b, { ratio: preset.ratio });
      console.log('  Mixed style: ' + mixed.name + ' (' + mixed.nameEn + ')');
      console.log('  Tone: formality=' + mixed.tone.formality + ' warmth=' + mixed.tone.warmth + ' complexity=' + mixed.tone.complexity + ' innovation=' + mixed.tone.innovation);
      console.log('');

    } else if (sub === 'delete' || sub === 'remove') {
      const name = opts.name || opts.n;
      if (!name) {
        console.error('Error: --name is required');
        process.exit(1);
      }
      const deleted = mem.deletePreset(name);
      if (deleted) {
        console.log('Deleted preset: ' + name);
      } else {
        console.error('Preset "' + name + '" not found');
        process.exit(1);
      }

    } else {
      // 列出所有预设
      const presets = mem.listPresets();
      console.log('');
      console.log('  Style Presets (' + presets.length + '):');
      console.log('  ' + '-'.repeat(55));
      if (presets.length === 0) {
        console.log('  (none)');
        console.log('');
        console.log('  Save a preset:');
        console.log('    node engine/cli.js preset save --name "my-style" --styleA minimalism --styleB cyberpunk --ratio 0.3');
      } else {
        for (const p of presets) {
          console.log('  ' + p.name.padEnd(16) + ' ' + p.style_a + ' × ' + p.style_b + ' @' + p.ratio + '  (used ' + p.use_count + 'x)');
        }
      }
      console.log('');
    }
  } finally {
    mem.close();
  }
}

async function cmdMixPairs() {
  const pairs = renderer.listMixPairs();
  console.log('');
  console.log('  Style Mix Pairs (sorted by similarity, top 15 of ' + pairs.length + '):');
  console.log('  ' + '-'.repeat(60));
  for (const p of pairs.slice(0, 15)) {
    const pct = (p.similarity * 100).toFixed(1);
    console.log('  ' + p.nameA + ' x ' + p.nameB + ': ' + pct + '% -> ' + p.syntax);
  }
  console.log('');
}

// Main
const { command, args, positional } = parseArgs(process.argv);

const commands = {
  generate: cmdGenerate,
  gen: cmdGenerate,
  screenshot: cmdScreenshot,
  ss: cmdScreenshot,
  'screenshot-all': cmdScreenshotAll,
  demo: cmdDemo,
  list: cmdList,
  ls: cmdList,
  mix: cmdMix,
  similar: cmdSimilar,
  'mix-pairs': cmdMixPairs,
  preset: cmdPreset,
};

const fn = commands[command];
if (fn) {
  if (command === 'preset') { args._positional = positional[1]; }
  fn(args).catch(err => { console.error(err); process.exit(1); });
} else {
  console.log(`
DesignSeed CLI — Design-to-HTML Engine

Usage:
  node engine/cli.js generate --prompt "..." --style "..." [--output ./out.html] [--screenshot]
  node engine/cli.js generate --prompt "..." --style "minimalism:cyberpunk:0.3"  (mixed style)
  node engine/cli.js mix --styleA minimalism --styleB cyberpunk --ratio 0.3 [--output ./out.html]
  node engine/cli.js similar --style cyberpunk --top 3
  node engine/cli.js mix-pairs
  node engine/cli.js screenshot --input ./page.html --output ./page.png
  node engine/cli.js screenshot-all --input ./demo/ --output ./demo/
  node engine/cli.js demo
  node engine/cli.js list

Commands:
  generate, gen     Generate an HTML page from a prompt (supports mix syntax)
  mix               Mix two styles and show result
  similar           Find most similar styles by tone vector
  mix-pairs         List all style pairs sorted by similarity
  screenshot, ss    Screenshot an HTML file to PNG
  screenshot-all    Screenshot all HTML files in a directory
  demo              Generate a demo page showcasing all 12 styles
  list, ls          List all available styles
  preset            Manage style presets (save/load/delete)

Options:
  --prompt, -p      The design prompt (required for generate)
  --style, -s       Style ID or mix syntax "A:B:ratio" (default: minimalism)
  --styleA, --a     First style for mix command
  --styleB, --b     Second style for mix command
  --ratio, --r      Mix ratio 0-1 (default: 0.5)
  --top, --n        Number of results for similar (default: 5)
  --output, -o      Output file path
  --title, -t       Page title (defaults to prompt text)
  --screenshot, --ss [path]  Also generate screenshot (for generate command)
  --width           Screenshot viewport width (default: 1440)
  --height          Screenshot viewport height (default: 900)
  --scale           Device scale factor (default: 2)
  --format          Screenshot format: png/jpeg (default: png)
`);
}
