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

  if (!styles[style]) {
    console.error(`Error: Unknown style "${style}"`);
    console.error(`Available styles: ${Object.keys(styles).filter(k => !k.startsWith('_')).join(', ')}`);
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

function cmdDemo() {
  console.log('Generating demo page with all 12 styles...');
  const html = renderer.generateDemo();
  const outPath = path.resolve('./designseed-demo.html');
  fs.writeFileSync(outPath, html, 'utf8');
  console.log(`Done! Output: ${outPath} (${html.length} bytes)`);
}

function cmdList() {
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

// Main
const { command, args } = parseArgs(process.argv);

const commands = {
  generate: cmdGenerate,
  gen: cmdGenerate,
  screenshot: cmdScreenshot,
  ss: cmdScreenshot,
  'screenshot-all': cmdScreenshotAll,
  demo: cmdDemo,
  list: cmdList,
  ls: cmdList,
};

const fn = commands[command];
if (fn) {
  fn(args).catch(err => { console.error(err); process.exit(1); });
} else {
  console.log(`
DesignSeed CLI — Design-to-HTML Engine

Usage:
  node engine/cli.js generate --prompt "..." --style "..." [--output ./out.html] [--screenshot]
  node engine/cli.js screenshot --input ./page.html --output ./page.png
  node engine/cli.js screenshot-all --input ./demo/ --output ./demo/
  node engine/cli.js demo
  node engine/cli.js list

Commands:
  generate, gen     Generate an HTML page from a prompt
  screenshot, ss    Screenshot an HTML file to PNG
  screenshot-all    Screenshot all HTML files in a directory
  demo              Generate a demo page showcasing all 12 styles
  list, ls          List all available styles

Options:
  --prompt, -p      The design prompt (required for generate)
  --style, -s       Style ID (default: minimalism)
  --output, -o      Output file path
  --title, -t       Page title (defaults to prompt text)
  --screenshot, --ss [path]  Also generate screenshot (for generate command)
  --width           Screenshot viewport width (default: 1440)
  --height          Screenshot viewport height (default: 900)
  --scale           Device scale factor (default: 2)
  --format          Screenshot format: png/jpeg (default: png)
`);
}
