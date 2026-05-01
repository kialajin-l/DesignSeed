'use strict';

const fs = require('fs');
const path = require('path');
const { DesignFetcher, DesignParser, sources } = require('./index');

// ─── 颜色输出辅助 ────────────────────────────────────────────

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function log(color, ...args) {
  console.log(`${color}${args.join(' ')}${C.reset}`);
}

function logBold(...args) {
  log(C.bold, ...args);
}

function logDim(...args) {
  log(C.dim, ...args);
}

function logSuccess(...args) {
  log(C.green, '\u2713', ...args);
}

function logError(...args) {
  log(C.red, '\u2717', ...args);
}

function logInfo(...args) {
  log(C.cyan, '\u2139', ...args);
}

// ─── 命令实现 ────────────────────────────────────────────────

/**
 * 批量采集指定数据源
 */
async function cmdCrawl(sourceName) {
  const fetcher = new DesignFetcher();
  const parser = new DesignParser();

  let sourcesToFetch;

  if (sourceName === 'all') {
    // 构建完整源列表
    sourcesToFetch = [
      {
        type: 'github',
        name: sources.awesomeDesignMd.name,
        repo: sources.awesomeDesignMd.repo,
        pattern: sources.awesomeDesignMd.pattern,
      },
      ...sources.companyDesignSystems.map((s) => ({
        type: 'url',
        name: s.name,
        url: s.url,
      })),
      ...sources.communityBlogs.map((s) => ({
        type: 'url',
        name: s.name,
        url: s.url,
      })),
    ];
  } else if (sourceName === 'awesome-design-md') {
    sourcesToFetch = [
      {
        type: 'github',
        name: sources.awesomeDesignMd.name,
        repo: sources.awesomeDesignMd.repo,
        pattern: sources.awesomeDesignMd.pattern,
      },
    ];
  } else if (sourceName === 'companies') {
    sourcesToFetch = sources.companyDesignSystems.map((s) => ({
      type: 'url',
      name: s.name,
      url: s.url,
    }));
  } else if (sourceName === 'blogs') {
    sourcesToFetch = sources.communityBlogs.map((s) => ({
      type: 'url',
      name: s.name,
      url: s.url,
    }));
  } else {
    // 尝试按名称匹配
    const found =
      sources.companyDesignSystems.find(
        (s) => s.name.toLowerCase().includes(sourceName.toLowerCase())
      ) ||
      sources.communityBlogs.find(
        (s) => s.name.toLowerCase().includes(sourceName.toLowerCase())
      );

    if (found) {
      sourcesToFetch = [{ type: 'url', name: found.name, url: found.url }];
    } else {
      logError(`Unknown source: ${sourceName}`);
      logInfo('Available sources: awesome-design-md, companies, blogs, all');
      process.exit(1);
    }
  }

  logBold(`\n\u{1F50D} Crawling ${sourcesToFetch.length} source(s)...\n`);

  const results = await fetcher.fetchAll(sourcesToFetch);

  logSuccess(`Fetched ${results.length} document(s)\n`);

  // 解析每个文档
  const parsed = [];
  for (const item of results) {
    logInfo(`Parsing: ${item.metadata.filePath || item.url}`);
    try {
      const features = await parser.parse(item.content, item.url);
      parsed.push({ source: item.url, features });
      logSuccess(`  \u2192 ${features.colors.palette.length} colors, ${features.typography.fontFamily || 'no font info'}`);
    } catch (err) {
      logError(`  \u2192 Parse failed: ${err.message}`);
    }
  }

  // 保存结果
  const outputDir = path.join(__dirname, '..', 'memory');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, 'design-systems.json');
  let existing = [];
  if (fs.existsSync(outputFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
    } catch {
      existing = [];
    }
  }

  // 合并（按 URL 去重）
  const urlSet = new Set(existing.map((e) => e.source));
  for (const item of parsed) {
    if (!urlSet.has(item.source)) {
      existing.push(item);
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(existing, null, 2), 'utf-8');
  logSuccess(`\n\u{1F4BE} Saved ${parsed.length} new design system(s) to ${outputFile}`);
  logDim(`   Total: ${existing.length} design system(s) in memory`);
}

/**
 * 从单个 URL 学习
 */
async function cmdLearn(url) {
  const fetcher = new DesignFetcher();
  const parser = new DesignParser();

  logBold(`\n\u{1F4D6} Learning from: ${url}\n`);

  logInfo('Fetching...');
  const item = await fetcher.fetchUrl(url);

  logInfo('Parsing...');
  const features = await parser.parse(item.content, url);

  // 也用文本关键词分析调性
  const toneFromText = parser.analyzeToneFromText(item.content);
  features.tone = {
    ...features.tone,
    _fromKeywords: toneFromText,
  };

  logSuccess('Parsed features:');
  console.log(JSON.stringify(features, null, 2));

  // 保存
  const outputDir = path.join(__dirname, '..', 'memory');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, 'design-systems.json');
  let existing = [];
  if (fs.existsSync(outputFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
    } catch {
      existing = [];
    }
  }

  // 去重
  const idx = existing.findIndex((e) => e.source === url);
  const entry = { source: url, features, learnedAt: new Date().toISOString() };
  if (idx >= 0) {
    existing[idx] = entry;
    logInfo('Updated existing entry');
  } else {
    existing.push(entry);
    logInfo('Added new entry');
  }

  fs.writeFileSync(outputFile, JSON.stringify(existing, null, 2), 'utf-8');
  logSuccess(`\n\u{1F4BE} Saved to ${outputFile}`);
  logDim(`   Total: ${existing.length} design system(s) in memory`);
}

/**
 * 列出已学习的设计系统
 */
function inferName(source) {
  try {
    const u = source.startsWith('file://')
      ? new URL(source.replace(/\\\\/g, '/'))
      : new URL(source);
    const host = u.hostname || '';
    const map = {
      'atlassian.design': 'Atlassian Design',
      'carbondesignsystem.com': 'IBM Carbon',
      'polaris.shopify.com': 'Shopify Polaris',
      'm3.material.io': 'Material Design',
      'ant.design': 'Ant Design',
      'js.design': 'JS Design Community',
    };
    for (const [domain, name] of Object.entries(map)) {
      if (host.includes(domain)) return name;
    }
    return host.replace(/^www\./, '').split('.')[0] || '(unknown)';
  } catch {
    return '(unknown)';
  }
}

function cmdList() {
  const outputFile = path.join(__dirname, '..', 'memory', 'design-systems.json');

  if (!fs.existsSync(outputFile)) {
    logInfo('No design systems learned yet.');
    logDim(`Run: node crawler/cli.js crawl --source awesome-design-md`);
    return;
  }

  let data;
  try {
    data = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
  } catch {
    logError('Failed to parse design-systems.json');
    return;
  }

  if (data.length === 0) {
    logInfo('No design systems learned yet.');
    return;
  }

  logBold(`\n\u{1F4DA} Learned Design Systems (${data.length})\n`);

  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    const f = item.features;
    const company = f.meta?.company || inferName(item.source || '');
    const colors = f.colors?.palette?.length || 0;
    const font = f.typography?.fontFamily || '-';
    const learned = item.learnedAt
      ? new Date(item.learnedAt).toLocaleDateString()
      : '-';

    console.log(
      `  ${C.bold}${i + 1}. ${company}${C.reset}` +
        `\n     ${C.dim}Source:${C.reset} ${item.source}` +
        `\n     ${C.dim}Colors:${C.reset} ${colors}  ` +
        `${C.dim}Font:${C.reset} ${font}  ` +
        `${C.dim}Learned:${C.reset} ${learned}`
    );
    console.log();
  }
}

/**
 * 解析本地文件
 */
async function cmdParse(filePath) {
  const fetcher = new DesignFetcher();
  const parser = new DesignParser();

  logBold(`\n\u{1F4C4} Parsing local file: ${filePath}\n`);

  const item = await fetcher.fetchLocalFile(filePath);
  const features = await parser.parse(item.content, item.url);

  // 增强调性分析
  const toneFromText = parser.analyzeToneFromText(item.content);
  features.tone = {
    ...features.tone,
    _fromKeywords: toneFromText,
  };

  logSuccess('Parsed features:\n');
  console.log(JSON.stringify(features, null, 2));

  // 保存
  const outputDir = path.join(__dirname, '..', 'memory');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputFile = path.join(outputDir, 'design-systems.json');
  let existing = [];
  if (fs.existsSync(outputFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(outputFile, 'utf-8'));
    } catch {
      existing = [];
    }
  }

  const entry = {
    source: item.url,
    features,
    learnedAt: new Date().toISOString(),
  };

  const idx = existing.findIndex((e) => e.source === item.url);
  if (idx >= 0) {
    existing[idx] = entry;
  } else {
    existing.push(entry);
  }

  fs.writeFileSync(outputFile, JSON.stringify(existing, null, 2), 'utf-8');
  logSuccess(`\n\u{1F4BE} Saved to ${outputFile}`);
  logDim(`   Total: ${existing.length} design system(s) in memory`);
}

// ─── CLI 解析 ────────────────────────────────────────────────

function printUsage() {
  console.log(`
${C.bold}DesignSeed Crawler CLI${C.reset}

${C.cyan}Usage:${C.reset}
  node crawler/cli.js <command> [options]

${C.cyan}Commands:${C.reset}
  ${C.green}crawl${C.reset}   --source <name>    批量采集指定数据源
  ${C.green}learn${C.reset}   --url <url>         从单个 URL 学习设计系统
  ${C.green}list${C.reset}                         列出已学习的设计系统
  ${C.green}parse${C.reset}  --file <path>       解析本地文件

${C.cyan}Source names:${C.reset}
  awesome-design-md   知名公司的设计系统文档集合 (GitHub)
  companies           公司设计系统网站
  blogs               社区博客
  all                 所有数据源

${C.cyan}Examples:${C.reset}
  node crawler/cli.js crawl --source awesome-design-md
  node crawler/cli.js crawl --source companies
  node crawler/cli.js crawl --source all
  node crawler/cli.js learn --url "https://atlassian.design"
  node crawler/cli.js list
  node crawler/cli.js parse --file "path/to/DESIGN.md"
`);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  // 解析 --key value 参数
  function getArg(name) {
    const idx = args.indexOf(`--${name}`);
    if (idx >= 0 && idx + 1 < args.length) {
      return args[idx + 1];
    }
    return null;
  }

  try {
    switch (command) {
      case 'crawl': {
        const source = getArg('source');
        if (!source) {
          logError('Missing --source argument');
          logInfo('Available: awesome-design-md, companies, blogs, all');
          process.exit(1);
        }
        await cmdCrawl(source);
        break;
      }

      case 'learn': {
        const url = getArg('url');
        if (!url) {
          logError('Missing --url argument');
          process.exit(1);
        }
        await cmdLearn(url);
        break;
      }

      case 'list': {
        cmdList();
        break;
      }

      case 'parse': {
        const file = getArg('file');
        if (!file) {
          logError('Missing --file argument');
          process.exit(1);
        }
        await cmdParse(file);
        break;
      }

      default:
        logError(`Unknown command: ${command}`);
        printUsage();
        process.exit(1);
    }
  } catch (err) {
    logError(`Error: ${err.message}`);
    if (process.env.DEBUG) {
      console.error(err.stack);
    }
    process.exit(1);
  }
}

main();
