import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const GUARD = path.join(here, '..', 'guard.mjs');

export function sandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'guard-'));
  const home = path.join(root, 'home');
  const claude = path.join(home, '.claude');
  const state = path.join(claude, 'state', 'guard');
  fs.mkdirSync(state, { recursive: true });
  const env = { ...process.env, GUARD_HOME: home, GUARD_STATE_DIR: state, GUARD_DRY_REFRESH: '1' };
  return { root, home, claude, state, env };
}

export function makeRepo(sb, { codegraph = false, graphify = false } = {}) {
  const repo = path.join(sb.root, 'work', 'repo');
  fs.mkdirSync(path.join(repo, '.git'), { recursive: true });
  fs.mkdirSync(path.join(repo, 'src'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'src', 'app.ts'), 'export const x = 1;\n');
  fs.writeFileSync(path.join(repo, 'README.md'), '# repo\n');
  if (codegraph) fs.mkdirSync(path.join(repo, '.codegraph'), { recursive: true });
  if (graphify) {
    fs.mkdirSync(path.join(repo, 'graphify-out'), { recursive: true });
    fs.writeFileSync(path.join(repo, 'graphify-out', 'graph.json'), '{}');
  }
  return repo;
}

export function run(sb, args, payload) {
  const input = payload === undefined ? '' : typeof payload === 'string' ? payload : JSON.stringify(payload);
  const r = spawnSync(process.execPath, [GUARD, ...args], { input, env: sb.env, encoding: 'utf8' });
  let out = null;
  if (r.stdout && r.stdout.trim().startsWith('{')) out = JSON.parse(r.stdout);
  return { code: r.status, stdout: r.stdout, stderr: r.stderr, out };
}

export function hook(sb, event, payload) {
  return run(sb, [event], { session_id: 's1', hook_event_name: event, ...payload });
}

export const ctxOf = (r) => r.out?.hookSpecificOutput?.additionalContext ?? '';
export const decisionOf = (r) => r.out?.hookSpecificOutput?.permissionDecision ?? null;
export const reasonOf = (r) => r.out?.hookSpecificOutput?.permissionDecisionReason ?? '';

export function runAsync(sb, args, payload) {
  return new Promise((resolve) => {
    const input = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const child = spawn(process.execPath, [GUARD, ...args], { env: sb.env });
    let stdout = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.on('close', (code) => {
      let out = null;
      if (stdout.trim().startsWith('{')) out = JSON.parse(stdout);
      resolve({ code, stdout, out });
    });
    child.stdin.end(input);
  });
}

export function hookAsync(sb, event, payload) {
  return runAsync(sb, [event], { session_id: 's1', hook_event_name: event, ...payload });
}
