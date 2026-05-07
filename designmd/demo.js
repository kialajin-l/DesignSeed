'use strict';

/**
 * DesignSeed — 端到端 Demo
 * 
 * 用法:
 *   node demo.js <prompt> [--style <style-id>] [--output <path>]
 * 
 * 示例:
 *   node demo.js "一个AI助手的落地页" --style stripe --output ./output.html
 *   node demo.js "极简风格的咖啡店官网" --style minimalism
 *   node demo.js "赛博朋克风格的游戏网站" --style cyberpunk
 *   node demo.js "温暖的旅行平台" --style airbnb
 * 
 * 支持的 style-id:
 *   - 内置风格: minimalism, neumorphism, glassmorphism, memphis, cyberpunk, ink_wash 等 12 种
 *   - 混合风格: "minimalism:glassmorphism:0.5"（A:B:比例）
 *   - 种子设计系统: stripe, vercel, linear, apple, notion, figma, spotify, airbnb 等 17 个
 */

const fs = require('fs');
const path = require('path');

// 引擎核心
const { render, listStyles } = require('../engine/renderer');
const { styleFromSeed, styleFromDesignMd, fullPipeline } = require('./bridge');
const { DesignMdGenerator } = require('./generator');
const { DesignMdValidator } = require('./validator');

// ─── 参数解析 ───

const args = process.argv.slice(2);
const flags = {};
const positional = [];

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--style' && args[i + 1]) {
    flags.style = args[++i];
  } else if (args[i] === '--output' && args[i + 1]) {
    flags.output = args[++i];
  } else if (args[i] === '--list') {
    flags.list = true;
  } else if (args[i] === '--help' || args[i] === '-h') {
    flags.help = true;
  } else if (!args[i].startsWith('--')) {
    positional.push(args[i]);
  }
}

// ─── 帮助信息 ───

function printHelp() {
  console.log(`
🎨 DesignSeed 端到端 Demo

用法:
  node demo.js <prompt> [--style <id>] [--output <path>]

选项:
  --style <id>    设计风格（默认: minimalism）
  --output <path> 输出文件路径（默认: ./designseed-output.html）
  --list          列出所有可用风格
  --help          显示帮助

风格类型:
  1. 内置风格（12种）: minimalism, neumorphism, glassmorphism, memphis, cyberpunk, ink_wash, ...
  2. 混合风格: "styleA:styleB:ratio"（如 "minimalism:glassmorphism:0.5"）
  3. 种子设计系统（17个）: stripe, vercel, linear, apple, notion, figma, spotify, airbnb, ...

示例:
  node demo.js "一个AI助手的落地页" --style stripe
  node demo.js "极简风格的咖啡店官网" --style minimalism
  node demo.js "赛博朋克风格的游戏网站" --style cyberpunk
  node demo.js "温暖的旅行平台" --style airbnb
  node demo.js "科技感的SaaS产品页" --style "glassmorphism:cyberpunk:0.3"
  `);
}

// ─── 列出风格 ───

function printStyles() {
  console.log('\n📋 可用风格:\n');

  // 内置风格
  console.log('  🎨 内置风格 (12种):');
  const builtin = listStyles();
  if (Array.isArray(builtin)) {
    for (const s of builtin) {
      console.log(`    ${(s.id || '').padEnd(18)} ${s.name || ''} (${s.nameEn || ''})`);
    }
  } else if (typeof builtin === 'object') {
    for (const [id, s] of Object.entries(builtin)) {
      console.log(`    ${id.padEnd(18)} ${s.name || ''} (${s.nameEn || ''})`);
    }
  }

  // 种子设计系统
  console.log('\n  🌱 种子设计系统 (17个):');
  const seedIds = DesignMdGenerator.getSeedIds();
  for (const id of seedIds) {
    const sys = DesignMdGenerator.findSeed(id);
    const tags = (sys?.tags || []).slice(0, 3).join(', ');
    console.log(`    ${id.padEnd(18)} ${sys?.name || id}  [${tags}]`);
  }

  console.log('\n  💡 混合风格: "styleA:styleB:ratio"（如 "minimalism:glassmorphism:0.5"）\n');
}

// ─── 生成页面 ───

function generate(prompt, styleId, outputPath) {
  const startTime = Date.now();
  let style = null;
  let source = '';

  // 判断 styleId 类型
  if (!styleId || styleId === 'minimalism' || styleId === 'neumorphism' || 
      styleId === 'glassmorphism' || styleId === 'memphis' || styleId === 'cyberpunk' ||
      styleId === 'ink_wash' || styleId === 'brutalism' || styleId === 'organic' ||
      styleId === 'retro' || styleId === 'vaporwave' || styleId === 'nordic' ||
      styleId === 'material') {
    // 内置风格，直接用 renderer
    source = `内置风格: ${styleId || 'minimalism'}`;
  } else if (styleId && styleId.includes(':')) {
    // 混合风格，直接用 renderer
    source = `混合风格: ${styleId}`;
  } else if (styleId) {
    // 种子设计系统，通过桥接器
    try {
      const pipeline = fullPipeline(styleId);
      style = pipeline.style;
      source = `种子设计系统: ${styleId} (验证得分: ${pipeline.validation.score}/100)`;
    } catch (err) {
      console.error(`❌ 未知的风格: ${styleId}`);
      console.log('   使用 --list 查看可用风格');
      process.exit(1);
    }
  }

  // 生成 HTML
  let html;
  if (style) {
    // 使用 design.md 桥接的 style
    html = render(prompt, { style: undefined, title: prompt });
    // 手动替换 style
    const { buildHead, buildContent } = require('../engine/renderer');
    // 由于 renderer 内部函数不导出，我们直接用 style 对象
    // 通过注册为临时风格来使用
    const styles = require('../engine/templates/styles');
    const bridgeStyleKey = `__bridge_${Date.now()}`;
    styles[bridgeStyleKey] = style;
    html = render(prompt, { style: bridgeStyleKey, title: prompt });
    delete styles[bridgeStyleKey];
  } else {
    html = render(prompt, { style: styleId || 'minimalism', title: prompt });
  }

  // 写入文件
  const finalPath = outputPath || './designseed-output.html';
  fs.writeFileSync(finalPath, html, 'utf8');

  const elapsed = Date.now() - startTime;
  const size = Buffer.byteLength(html, 'utf8');

  console.log(`\n✅ 页面已生成\n`);
  console.log(`   📄 文件: ${path.resolve(finalPath)}`);
  console.log(`   🎨 风格: ${source}`);
  console.log(`   📝 提示: ${prompt}`);
  console.log(`   📦 大小: ${(size / 1024).toFixed(1)} KB`);
  console.log(`   ⏱️  耗时: ${elapsed}ms`);
  console.log(`\n   用浏览器打开即可预览\n`);
}

// ─── 主入口 ───

if (flags.help) {
  printHelp();
} else if (flags.list) {
  printStyles();
} else if (positional.length === 0) {
  printHelp();
} else {
  const prompt = positional.join(' ');
  generate(prompt, flags.style, flags.output);
}
