'use strict';

// No dependencies: run with Node.js from any directory.
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'source-manifest.json'), 'utf8'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="\.\/([^"\n]+)"[^>]*>/g)].map(match => match[1]);
const styles = [...html.matchAll(/<link\b[^>]*\bhref="\.\/([^"\n]+\.css)"[^>]*>/g)].map(match => match[1]);

assert.deepEqual(scripts, manifest.scripts, 'Unexpected script order');
assert.deepEqual(styles, manifest.styles, 'Unexpected stylesheet order');
assert.equal(new Set([...scripts, ...styles]).size, scripts.length + styles.length, 'Duplicate source reference');
for (const relative of [...scripts, ...styles, 'assets/guide-to-freedom.png']) {
  const file = path.join(root, relative);
  assert.ok(fs.statSync(file).isFile(), `Missing file: ${relative}`);
}
for (const relative of scripts) {
  const result = spawnSync(process.execPath, ['--check', path.join(root, relative)], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || `Syntax error: ${relative}`);
}
for (const id of ['coach-pick-grid', 'weapon-pick-grid', 'reminder-enabled', 'reminder-spam', 'reminder-save', 'farm-form', 'planner-roster']) {
  assert.ok(html.includes(`id="${id}"`), `Missing required element: ${id}`);
}
console.log(`PASS: ${scripts.length} scripts, ${styles.length} stylesheets, local artwork, loading order, required UI elements and JavaScript syntax.`);
