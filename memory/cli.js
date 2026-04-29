#!/usr/bin/env node
/**
 * DesignSeed Memory CLI — 调试与管理工具
 *
 * Usage:
 *   node memory/cli.js stats                          查看数据库统计
 *   node memory/cli.js export                         导出所有数据为 JSON
 *   node memory/cli.js import --file "data.json"      导入数据
 *   node memory/cli.js anchors [--limit N]            列出最近的锚点
 *   node memory/cli.js prefs                          列出用户偏好
 *   node memory/cli.js search <query>                 搜索设计系统
 *   node memory/cli.js rules [--enabled]              列出自定义规则
 */

const path = require('path');
const fs = require('fs');
const { DesignMemory } = require('./index');

// ─── 参数解析 ───────────────────────────────────────────────
function parseArgs(argv) {
  const args = argv.slice(2);
  const command = args[0] || null;
  const flags = {};
  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--file' && args[i + 1]) {
      flags.file = args[++i];
    } else if (args[i] === '--limit' && args[i + 1]) {
      flags.limit = parseInt(args[++i], 10);
    } else if (args[i] === '--enabled') {
      flags.enabled = true;
    } else if (args[i] === '--db' && args[i + 1]) {
      flags.db = args[++i];
    } else if (!args[i].startsWith('--')) {
      // positional arg after command
      if (!flags.positional) flags.positional = args[i];
    }
  }
  return { command, flags };
}

// ─── 格式化输出 ─────────────────────────────────────────────
function printTable(rows, columns) {
  if (!rows || rows.length === 0) {
    console.log('  (empty)');
    return;
  }
  // 计算列宽
  const widths = {};
  for (const col of columns) {
    widths[col] = col.length;
  }
  for (const row of rows) {
    for (const col of columns) {
      const val = row[col] !== null && row[col] !== undefined ? String(row[col]) : '';
      widths[col] = Math.max(widths[col], val.length);
    }
  }

  // header
  const header = columns.map(c => c.padEnd(widths[c])).join('  ');
  console.log(header);
  console.log(columns.map(c => '─'.repeat(widths[c])).join('──'));

  // rows
  for (const row of rows) {
    const line = columns.map(c => {
      const val = row[c] !== null && row[c] !== undefined ? String(row[c]) : '';
      return val.length > widths[c] ? val.substring(0, widths[c] - 1) + '…' : val.padEnd(widths[c]);
    }).join('  ');
    console.log(line);
  }
  console.log(`\n  (${rows.length} rows)`);
}

// ─── 主逻辑 ─────────────────────────────────────────────────
function main() {
  const { command, flags } = parseArgs(process.argv);

  if (!command) {
    console.log(`
DesignSeed Memory CLI

Commands:
  stats                           查看数据库统计
  export [--file output.json]     导出所有数据
  import --file data.json         导入数据
  anchors [--limit N]             列出最近的锚点
  prefs                           列出用户偏好
  search <query>                  搜索设计系统
  rules [--enabled]               列出自定义规则

Options:
  --db <path>                     指定数据库路径（默认 memory/designseed.db）
  --file <path>                   输入/输出文件路径
  --limit <N>                     限制返回数量
  --enabled                       仅显示启用的规则
`);
    process.exit(0);
  }

  // 初始化
  const mem = new DesignMemory(flags.db);
  try {
    mem.init();
  } catch (err) {
    console.error(`Failed to initialize database: ${err.message}`);
    process.exit(1);
  }

  try {
    switch (command) {
      case 'stats': {
        const stats = mem.getStats();
        console.log('\n📊 DesignSeed Memory Stats\n');
        console.log(`  Design Systems:  ${stats.design_systems}`);
        console.log(`  Anchors:         ${stats.anchors}`);
        console.log(`  Preferences:     ${stats.preferences}`);
        console.log(`  Rules:           ${stats.rules}`);
        console.log(`  Last anchor:     ${stats.last_anchor_at || 'never'}`);
        console.log(`  Last design sys: ${stats.last_design_system_at || 'never'}`);
        console.log();
        break;
      }

      case 'export': {
        const data = mem.exportAll();
        const outPath = flags.file || path.join(__dirname, 'export.json');
        fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
        console.log(`✅ Exported to ${outPath}`);
        console.log(`   ${data.design_systems.length} systems, ${data.design_anchors.length} anchors, ${data.user_preferences.length} prefs, ${data.custom_rules.length} rules`);
        break;
      }

      case 'import': {
        if (!flags.file) {
          console.error('❌ --file is required for import');
          process.exit(1);
        }
        if (!fs.existsSync(flags.file)) {
          console.error(`❌ File not found: ${flags.file}`);
          process.exit(1);
        }
        const data = JSON.parse(fs.readFileSync(flags.file, 'utf8'));
        const counts = mem.importAll(data);
        console.log('✅ Import complete:');
        for (const [table, count] of Object.entries(counts)) {
          console.log(`   ${table}: ${count} rows`);
        }
        break;
      }

      case 'anchors': {
        const limit = flags.limit || 20;
        const anchors = mem.getRecentAnchors(limit);
        console.log(`\n🔗 Recent Anchors (limit: ${limit})\n`);
        printTable(anchors.map(a => ({
          id: a.id,
          prompt: (a.prompt || '').substring(0, 50),
          style: a.style || '-',
          mods: a.user_modifications,
          created: a.created_at,
        })), ['id', 'prompt', 'style', 'mods', 'created']);
        break;
      }

      case 'prefs': {
        const prefs = mem.getAllPreferences();
        console.log('\n⚙️  User Preferences\n');
        printTable(prefs.map(p => ({
          dimension: p.dimension,
          value: p.value,
          confidence: p.confidence,
          samples: p.sample_count,
          updated: p.updated_at,
        })), ['dimension', 'value', 'confidence', 'samples', 'updated']);
        break;
      }

      case 'search': {
        const query = flags.positional;
        if (!query) {
          console.error('❌ Usage: cli.js search <query>');
          process.exit(1);
        }
        const results = mem.searchDesignSystems(query);
        console.log(`\n🔍 Search: "${query}"\n`);
        printTable(results.map(r => ({
          id: r.id,
          company: r.company,
          score: r.quality_score,
          source: r.source || '-',
          learned: r.learned_at,
        })), ['id', 'company', 'score', 'source', 'learned']);
        break;
      }

      case 'rules': {
        const filter = {};
        if (flags.enabled) filter.enabled = true;
        const rules = mem.getRules(filter);
        console.log('\n📏 Custom Rules\n');
        printTable(rules.map(r => ({
          id: r.id,
          type: r.rule_type,
          dimension: r.dimension,
          condition: (r.condition || '').substring(0, 40),
          action: r.action,
          enabled: r.enabled ? '✓' : '✗',
          source: r.source,
        })), ['id', 'type', 'dimension', 'condition', 'action', 'enabled', 'source']);
        break;
      }

      default:
        console.error(`❌ Unknown command: ${command}`);
        console.error('   Run without arguments to see usage.');
        process.exit(1);
    }
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  } finally {
    mem.close();
  }
}

main();
