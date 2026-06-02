const fs = require('fs');
const path = require('path');
const renderer = require('./renderer');
const mixer = require('./mixer');
const { DesignMemory } = require('../memory/index');

function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0] || null;
  const positional = [command];
  const flags = {};
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.replace(/^--/, '');
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const key = arg[1];
      const next = args[i + 1];
      if (next && !next.startsWith('-')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(arg);
    }
  }
  return { command, args: flags, positional };
}

// ─── Generate command ──────────────────────────────────────

async function cmdGenerate(opts) {
  const prompt = opts.prompt || opts.p;
  const style = opts.style || opts.s || 'minimalism';
  const output = opts.output || opts.o || 'output.html';
  const title = opts.title || opts.t || prompt;
  const doScreenshot = opts.screenshot || opts.ss;

  if (!prompt) {
    console.error('Error: --prompt is required');
    console.error('Usage: node engine/cli.js generate --prompt "..." --style "..." [--output ./out.html]');
    process.exit(1);
  }

  const renderer = require('./renderer');
  const fs = require('fs');
  const path = require('path');

  const html = renderer.render(prompt, { style, title });
  const outPath = path.resolve(output);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log('Generated: ' + outPath + ' (' + html.length + ' chars, style: ' + style + ')');

  if (doScreenshot) {
    const screenshotPath = typeof doScreenshot === 'string' ? doScreenshot : outPath.replace(/\.html$/, '.png');
    try {
      const { execSync } = require('child_process');
      execSync('node engine/cli.js screenshot --input "' + outPath + '" --output "' + screenshotPath + '"', { stdio: 'inherit' });
    } catch (e) {
      console.error('Screenshot failed:', e.message);
    }
  }
}

// ─── Screenshot commands ──────────────────────────────────────

async function cmdScreenshot(opts) {
  const input = opts.input;
  const output = opts.output || opts.o;
  const width = parseInt(opts.width || '1440');
  const height = parseInt(opts.height || '900');
  const scale = parseInt(opts.scale || '2');
  const format = opts.format || 'png';

  if (!input) {
    console.error('Error: --input is required');
    console.error('Usage: node engine/cli.js screenshot --input page.html --output page.png');
    process.exit(1);
  }

  const fs = require('fs');
  const path = require('path');
  const { execSync } = require('child_process');

  const inputPath = path.resolve(input);
  const outputPath = output ? path.resolve(output) : inputPath.replace(/\.html$/, '.' + format);

  if (!fs.existsSync(inputPath)) {
    console.error('Error: input file not found: ' + inputPath);
    process.exit(1);
  }

  console.log('Screenshotting: ' + inputPath);
  try {
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: scale });
    await page.goto('file://' + inputPath, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: outputPath, fullPage: true });
    await browser.close();
    console.log('Screenshot saved: ' + outputPath);
  } catch (e) {
    // Fallback: try using playwright or other tools
    console.error('Puppeteer not available, trying alternative...');
    try {
      execSync('npx playwright screenshot --viewport-size="' + width + ',' + height + '" "' + inputPath + '" "' + outputPath + '"', { stdio: 'inherit' });
    } catch (e2) {
      console.error('Screenshot failed. Install puppeteer or playwright:');
      console.error('  npm install puppeteer');
      console.error('  or: npm install playwright');
      process.exit(1);
    }
  }
}

async function cmdScreenshotAll(opts) {
  const inputDir = opts.input;
  const outputDir = opts.output || opts.o || './screenshots';

  if (!inputDir) {
    console.error('Error: --input directory is required');
    console.error('Usage: node engine/cli.js screenshot-all --input ./demo/ --output ./screenshots/');
    process.exit(1);
  }

  const fs = require('fs');
  const path = require('path');

  const dir = path.resolve(inputDir);
  if (!fs.existsSync(dir)) {
    console.error('Error: directory not found: ' + dir);
    process.exit(1);
  }

  const outDir = path.resolve(outputDir);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  console.log('Found ' + files.length + ' HTML files to screenshot');

  for (const file of files) {
    const inputPath = path.join(dir, file);
    const outputPath = path.join(outDir, file.replace(/\.html$/, '.png'));
    try {
      await cmdScreenshot({ input: inputPath, output: outputPath, width: opts.width, height: opts.height, scale: opts.scale, format: opts.format });
    } catch (e) {
      console.error('Failed to screenshot ' + file + ': ' + e.message);
    }
  }
  console.log('Done! Screenshots saved to: ' + outDir);
}

// ─── Demo command ──────────────────────────────────────

async function cmdDemo(opts) {
  const output = opts.output || opts.o || require('path').join(require('path').join(__dirname, '..'), 'designseed-demo.html');
  const style = opts.style || opts.s;

  const renderer = require('./renderer');
  const fs = require('fs');
  const path = require('path');

  let html;
  if (style) {
    html = renderer.render('DesignSeed Demo — ' + style + ' 风格预览', { style, title: 'DesignSeed Demo' });
  } else {
    html = renderer.generateDemo();
  }

  const outPath = path.resolve(output);
  fs.writeFileSync(outPath, html, 'utf-8');
  console.log('Demo generated: ' + outPath + ' (' + html.length + ' chars)');
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

  const target = renderer.getStyle(styleId);
  if (!target) {
    console.error('Error: Unknown style "' + styleId + '"');
    console.error('Available: ' + renderer.listStyles().map(s => s.id).join(', '));
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
  console.log('  Style Mix Pairs (top 15 of ' + pairs.length + '):');
  console.log('  ' + '-'.repeat(60));
  for (const p of pairs.slice(0, 15)) {
    console.log('  ' + p.a + ' x ' + p.b + ' -> ratio=' + p.ratio);
  }
  console.log('');
}


async function cmdCard(opts) {
  const templateId = opts.template;
  const title = opts.title || 'DesignSeed Card';
  const output = opts.output || opts.o || './designseed-card.html';
  const style = opts.style || opts.s || 'minimalism';

  const cardRenderer = require('./card-templates/renderer');
  const cardIndex = require('./card-templates');

  if (!templateId) {
    console.log('');
    console.log('  Available card templates:');
    const list = cardIndex.listTemplates();
    list.forEach(function(t) {
      const size = t.canvas ? t.canvas.width + 'x' + t.canvas.height : 'custom';
      console.log('    ' + t.id + ' — ' + t.name + ' (' + size + ')');
    });
    console.log('');
    console.log('  Usage: node engine/cli.js card --template xiaohongshu-note --title ... --output card.html');
    console.log('');
    return;
  }

  const resolved = cardIndex.matchTemplate(templateId);
  if (!resolved) {
    console.error('Error: Unknown template "' + templateId + '"');
    process.exit(1);
  }

  const html = cardRenderer.renderCard(title, { template: templateId, style: style });

  const fs = require('fs');
  fs.writeFileSync(output, html, 'utf8');
  console.log('Card generated: ' + output + ' (' + html.length + ' chars, template: ' + (resolved.name || templateId) + ')');
}

async function cmdPacks(opts) {
  const renderer = require('./renderer');
  const packs = renderer.listStylePacks();
  console.log('');
  console.log('  Available Style Packs (' + packs.length + '):');
  console.log('  ' + '-'.repeat(60));
  packs.forEach(function(p) {
    if (p.error) {
      console.log('  ' + p.id + ' \u2014 ERROR: ' + p.error);
    } else {
      console.log('  ' + p.id + ' \u2014 ' + p.name);
      if (p.description) console.log('    ' + p.description);
      if (p.tags) console.log('    Tags: ' + p.tags.join(', '));
    }
  });
  console.log('');
  console.log('  Usage: node engine/cli.js generate --prompt "..." --style guochao');
  console.log('');
}

async function cmdAudit(opts) {
  const { audit, formatReport } = require('./audit');
  const input = opts.input || opts.i;
  if (!input) {
    console.error('Error: --input is required');
    console.error('Usage: node engine/cli.js audit --input page.html [--output report.txt]');
    process.exit(1);
  }
  const html = fs.readFileSync(input, 'utf8');
  const result = await audit(html);
  const report = formatReport(result);
  console.log(report);
  if (opts.output || opts.o) {
    const outPath = opts.output || opts.o;
    fs.writeFileSync(outPath, report, 'utf8');
    console.log('Report saved: ' + outPath);
  }
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
  card: cmdCard,
  packs: cmdPacks,
  audit: cmdAudit,
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
  node engine/cli.js card --template xiaohongshu-note --title "..." [--style guochao] [--output card.html]
  node engine/cli.js packs
  node engine/cli.js audit --input ./page.html [--output report.txt]

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
  card              Generate a card from template (xiaohongshu-note, wechat-cover)
  packs             List available style packs
  audit              Audit HTML design quality (5 dimensions + anti-patterns)

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
