'use strict';

/**
 * design.md CLI
 * 
 * 用法:
 *   node designmd-cli.js generate <system-id> [--output <path>]
 *   node designmd-cli.js validate <file>
 *   node designmd-cli.js import <file>
 *   node designmd-cli.js list
 */

const fs = require('fs');
const path = require('path');
const { DesignMdGenerator } = require('./generator');
const { DesignMdValidator } = require('./validator');
const { DesignMdImporter } = require('./importer');
const { DesignMdGenerator: _DMG } = require('./generator');

const args = process.argv.slice(2);
const command = args[0];

function printUsage() {
  console.log(`
🎨 design.md CLI

用法:
  node designmd-cli.js generate <system-id> [--output <path>]   从种子数据生成 design.md
  node designmd-cli.js validate <file>                          验证 design.md 文件
  node designmd-cli.js import <file>                            导入 design.md 并显示解析结果
  node designmd-cli.js list                                     列出可用的种子设计系统

示例:
  node designmd-cli.js generate stripe --output ./stripe.design.md
  node designmd-cli.js validate ./my-design.design.md
  node designmd-cli.js import ./stripe.design.md
  node designmd-cli.js list
  `);
}

function listSystems() {
  console.log('\n📋 可用的种子设计系统:\n');
  const ids = _DMG.getSeedIds();
  for (const id of ids) {
    const sys = _DMG.findSeed(id);
    const tags = (sys?.tags || []).join(', ');
    console.log(`  ${id.padEnd(20)} ${sys?.name || id}  [${tags}]`);
  }
  console.log(`\n共 ${ids.length} 个系统\n`);
}

function generate(systemId, outputPath) {
  try {
    const content = DesignMdGenerator.fromSeed(systemId);

    if (outputPath) {
      fs.writeFileSync(outputPath, content, 'utf8');
      console.log(`✅ 已生成: ${outputPath}`);
      console.log(`   设计系统: ${systemId}`);
      console.log(`   大小: ${Buffer.byteLength(content)} bytes`);
    } else {
      // 输出到 stdout
      process.stdout.write(content);
    }
  } catch (err) {
    console.error(`❌ 生成失败: ${err.message}`);
    process.exit(1);
  }
}

function validate(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const validator = new DesignMdValidator();
    const result = validator.validate(content);

    console.log(DesignMdValidator.formatReport(result));
    console.log(`\n文件: ${filePath}`);

    process.exit(result.valid ? 0 : 1);
  } catch (err) {
    console.error(`❌ 验证失败: ${err.message}`);
    process.exit(1);
  }
}

function importFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imported = DesignMdImporter.import(content);

    console.log('\n📥 导入结果:\n');
    console.log(JSON.stringify(imported, null, 2));

    console.log('\n📝 Prompt 片段:');
    console.log(DesignMdImporter.toPromptFragment(imported));
  } catch (err) {
    console.error(`❌ 导入失败: ${err.message}`);
    process.exit(1);
  }
}

// 主入口
switch (command) {
  case 'generate': {
    const systemId = args[1];
    if (!systemId) {
      console.error('❌ 请指定设计系统 ID');
      console.log('   使用 "node designmd-cli.js list" 查看可用系统');
      process.exit(1);
    }
    const outputIdx = args.indexOf('--output');
    const outputPath = outputIdx >= 0 ? args[outputIdx + 1] : null;
    generate(systemId, outputPath);
    break;
  }

  case 'validate': {
    const filePath = args[1];
    if (!filePath) {
      console.error('❌ 请指定文件路径');
      process.exit(1);
    }
    validate(filePath);
    break;
  }

  case 'import': {
    const filePath = args[1];
    if (!filePath) {
      console.error('❌ 请指定文件路径');
      process.exit(1);
    }
    importFile(filePath);
    break;
  }

  case 'list':
    listSystems();
    break;

  default:
    printUsage();
    break;
}
