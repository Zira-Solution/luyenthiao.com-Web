import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { sandbox, makeRepo, run, hook, ctxOf, decisionOf, reasonOf, GUARD } from './helpers.mjs';

const pre = (sb, tool, tool_input, extra = {}) =>
  hook(sb, 'PreToolUse', { tool_name: tool, tool_input, cwd: extra.cwd, ...extra });

function writeUserSettings(sb, file, command) {
  fs.mkdirSync(sb.claude, { recursive: true });
  const hooks = { PreToolUse: [{ matcher: 'Read', hooks: [{ type: 'command', command }] }] };
  fs.writeFileSync(path.join(sb.claude, file), JSON.stringify({ hooks }));
}

function missingRead(sb) {
  const repo = makeRepo(sb);
  return pre(sb, 'Read', { file_path: path.join(repo, 'src', 'app.ts') }, { cwd: repo });
}

test('dedup: no user-level guard -> project guard enforces', () => {
  const sb = sandbox();
  assert.equal(decisionOf(missingRead(sb)), 'deny');
});

test('dedup: user-level guard in settings.json -> project guard is silent', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', `node "${path.join(sb.claude, 'hooks', 'guard.mjs')}" PreToolUse`);
  const r = missingRead(sb);
  assert.equal(r.code, 0);
  assert.equal(r.stdout, '');
});

test('dedup: user-level guard in settings.local.json -> project guard is silent', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.local.json', 'node ~/.claude/hooks/guard.mjs PreToolUse');
  assert.equal(missingRead(sb).stdout, '');
});

test('dedup: a user settings entry pointing at this vendored file does not count', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', `node "${GUARD}" PreToolUse`);
  assert.equal(decisionOf(missingRead(sb)), 'deny');
});

test('dedup: CLAUDE_PROJECT_DIR commands do not count as user-level', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', 'node "${CLAUDE_PROJECT_DIR}/.claude/hooks/guard.mjs" PreToolUse');
  assert.equal(decisionOf(missingRead(sb)), 'deny');
});

test('dedup: malformed user settings -> project guard enforces', () => {
  const sb = sandbox();
  fs.writeFileSync(path.join(sb.claude, 'settings.json'), '{oops');
  assert.equal(decisionOf(missingRead(sb)), 'deny');
});

test('dedup: GUARD_PROJECT=0 silences the project guard', () => {
  const sb = sandbox();
  sb.env.GUARD_PROJECT = '0';
  assert.equal(missingRead(sb).stdout, '');
});

test('dedup: CLI commands still work when a user-level guard exists', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', 'node ~/.claude/hooks/guard.mjs PreToolUse');
  const repo = makeRepo(sb);
  const r = run(sb, ['status', repo]);
  assert.equal(r.code, 0);
  assert.match(r.stdout, /"status": "missing"/);
});

test('adapted: decline hint points at the vendored guard file', () => {
  const sb = sandbox();
  const reason = reasonOf(missingRead(sb));
  assert.ok(reason.includes(`node "${GUARD.replace(/\\/g, '/')}" decline`), reason);
  assert.doesNotMatch(reason, /~\/\.claude\/hooks\/guard\.mjs/);
});

test('adapted: SessionStart points at the project tooling rule', () => {
  const sb = sandbox();
  const repo = makeRepo(sb);
  const c = ctxOf(hook(sb, 'SessionStart', { cwd: repo, source: 'startup' }));
  assert.match(c, /\.claude\/rules\/tooling\.md/);
  assert.doesNotMatch(c, /tooling-and-skills/);
});

test('adapted: a project-level graphify skill satisfies the skill check', () => {
  const sb = sandbox();
  const repo = makeRepo(sb);
  fs.mkdirSync(path.join(repo, '.claude', 'skills', 'graphify'), { recursive: true });
  const c = ctxOf(hook(sb, 'SessionStart', { cwd: repo, source: 'startup' }));
  assert.doesNotMatch(c, /global graphify skill/);
});

test('adapted: .claude/superpowers files are exempt from the brainstorm gate', () => {
  const sb = sandbox();
  const repo = makeRepo(sb, { codegraph: true, graphify: true });
  const r = pre(sb, 'Write', { file_path: path.join(repo, '.claude', 'superpowers', 'specs', 'a.md') }, { cwd: repo });
  assert.equal(r.stdout, '');
});

test('adapted: skill mirror reminder points at the project tooling rule', () => {
  const sb = sandbox();
  const repo = makeRepo(sb, { codegraph: true, graphify: true });
  const r = hook(sb, 'PostToolUse', {
    tool_name: 'Write',
    tool_input: { file_path: path.join(repo, '.claude', 'skills', 'demo', 'SKILL.md'), content: 'x' },
    cwd: repo,
  });
  assert.match(ctxOf(r), /\.claude\/rules\/tooling\.md/);
});

test('dedup: a file merely ending in guard.mjs does not count', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', 'node ~/.claude/hooks/myguard.mjs PreToolUse');
  assert.equal(decisionOf(missingRead(sb)), 'deny');
});

test('dedup: guard.mjsx does not count', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', 'node ~/tools/guard.mjsx PreToolUse');
  assert.equal(decisionOf(missingRead(sb)), 'deny');
});

test('dedup: unrelated user hooks only -> project guard enforces', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', 'codegraph.cmd prompt-hook');
  assert.equal(decisionOf(missingRead(sb)), 'deny');
});

test('dedup: %USERPROFILE% backslash path counts as user-level', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', 'node "%USERPROFILE%\\.claude\\hooks\\guard.mjs" PreToolUse');
  assert.equal(missingRead(sb).stdout, '');
});

test('dedup: guard inside a bash -c string counts as user-level', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', 'bash -c "node ~/.claude/hooks/guard.mjs PreToolUse; echo ok"');
  assert.equal(missingRead(sb).stdout, '');
});

test('dedup: CLAUDE_PROJECT_DIR argument does not hide a user-level guard', () => {
  const sb = sandbox();
  writeUserSettings(sb, 'settings.json', 'node ~/.claude/hooks/guard.mjs PreToolUse "${CLAUDE_PROJECT_DIR}"');
  assert.equal(missingRead(sb).stdout, '');
});

test('dedup: large stdin is drained when standing down', () => {
  const sb = sandbox();
  sb.env.GUARD_PROJECT = '0';
  const big = JSON.stringify({ session_id: 's1', hook_event_name: 'PreToolUse', tool_name: 'Write',
    tool_input: { file_path: 'x', content: 'a'.repeat(5 * 1024 * 1024) } });
  const r = spawnSync(process.execPath, [GUARD, 'PreToolUse'], { input: big, env: sb.env, encoding: 'utf8' });
  assert.equal(r.error, undefined);
  assert.equal(r.status, 0);
  assert.equal(r.stdout, '');
});
