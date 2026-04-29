#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { RuleEngine, defaults } = require('./index');

const args = process.argv.slice(2);
const command = args[0];

function getArg(name) {
  const idx = args.indexOf('--' + name);
  if (idx === -1 || idx + 1 >= args.length) return null;
  return args[idx + 1];
}

function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
  if (!result.valid) {
    console.log('\n❌ Validation FAILED');
    process.exit(1);
  } else {
    console.log('\n✅ Validation PASSED');
  }
}

switch (command) {
  case 'check': {
    const filePath = getArg('file');
    if (!filePath) {
      console.error('Usage: node cli.js check --file <path>');
      process.exit(1);
    }
    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
      console.error('File not found:', absPath);
      process.exit(1);
    }
    const html = fs.readFileSync(absPath, 'utf8');
    const engine = new RuleEngine();
    engine.loadDefaults();
    const result = engine.validate({ html, css: {}, metadata: { source: absPath } });
    printResult(result);
    break;
  }

  case 'validate': {
    const htmlStr = getArg('html');
    if (!htmlStr) {
      console.error('Usage: node cli.js validate --html "<html_string>"');
      process.exit(1);
    }
    const engine = new RuleEngine();
    engine.loadDefaults();
    const result = engine.validate({ html: htmlStr, css: {}, metadata: {} });
    printResult(result);
    break;
  }

  case 'list': {
    const engine = new RuleEngine();
    engine.loadDefaults();
    const rules = engine.getAllRules();
    console.log('Loaded rules (' + rules.length + '):');
    console.log('\u2500'.repeat(60));
    for (const rule of rules) {
      const typeTag = rule.type === 'hard_limit' ? '\u{1F534}' : '\u{1F7E1}';
      console.log(typeTag + ' ' + rule.id + ' [' + rule.type + ']');
      console.log('   ' + rule.name + ' \u2014 ' + rule.message);
      console.log('   dimension=' + rule.dimension + ' condition=' + rule.condition + ' threshold=' + (rule.threshold || 'N/A') + ' action=' + rule.action);
      console.log('');
    }
    break;
  }

  case 'add': {
    const ruleType = getArg('type');
    const dimension = getArg('dimension');
    const condition = getArg('condition');
    const threshold = getArg('threshold');
    const action = getArg('action') || 'warn';
    const message = getArg('message') || 'Custom rule';

    if (!ruleType || !dimension || !condition) {
      console.error('Usage: node cli.js add --type <hard_limit|soft_preference> --dimension <dim> --condition <cond> --threshold <num> [--action <act>]');
      process.exit(1);
    }

    const customRule = {
      id: 'custom_' + Date.now(),
      name: 'Custom Rule',
      type: ruleType,
      dimension: dimension,
      condition: condition,
      threshold: threshold ? Number(threshold) : undefined,
      action: action,
      message: message,
      source: 'custom',
    };

    const engine = new RuleEngine();
    engine.loadDefaults();
    const added = engine.addCustomRule(customRule);
    if (added) {
      console.log('\u2705 Added custom rule:', customRule.id);
      console.log(JSON.stringify(customRule, null, 2));
    } else {
      console.error('\u274C Failed to add rule (duplicate ID?)');
      process.exit(1);
    }
    break;
  }

  case 'remove': {
    const ruleId = getArg('id');
    if (!ruleId) {
      console.error('Usage: node cli.js remove --id <ruleId>');
      process.exit(1);
    }
    const engine = new RuleEngine();
    engine.loadDefaults();
    const removed = engine.removeCustomRule(ruleId);
    if (removed) {
      console.log('\u2705 Removed rule:', ruleId);
    } else {
      console.error('\u274C Rule not found:', ruleId);
      process.exit(1);
    }
    break;
  }

  default:
    console.log('DesignSeed Rule Engine CLI');
    console.log('');
    console.log('Commands:');
    console.log('  check     --file <path>              Validate an HTML file');
    console.log('  validate  --html "<html_string>"      Validate an HTML string');
    console.log('  list                                 List all loaded rules');
    console.log('  add       --type ... --dimension ...  Add a custom rule');
    console.log('  remove    --id <ruleId>              Remove a custom rule');
    break;
}
