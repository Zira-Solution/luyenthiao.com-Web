import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { sandbox, makeRepo, run, hook, hookAsync, ctxOf, decisionOf, reasonOf } from './helpers.mjs';

test('malformed stdin exits 0, prints nothing, logs error', () => {
  const sb = sandbox();
  const r = run(sb, ['PreToolUse'], '{not json');
  assert.equal(r.code, 0);
  assert.equal(r.stdout, '');
  assert.match(fs.readFileSync(path.join(sb.state, 'errors.log'), 'utf8'), /SyntaxError/);
});

test('unknown event exits 0 with no output', () => {
  const sb = sandbox();
  const r = hook(sb, 'Notification', {});
  assert.equal(r.code, 0);
  assert.equal(r.stdout, '');
});

test('SessionStart: missing tooling is reported', () => {
  const sb = sandbox();
  const repo = makeRepo(sb);
  const r = hook(sb, 'SessionStart', { cwd: repo, source: 'startup' });
  const c = ctxOf(r);
  assert.match(c, /missing tooling/);
  assert.match(c, /codegraph index/);
  assert.match(c, /graphify graph/);
  assert.match(c, /global graphify skill/);
  assert.match(c, /AskUserQuestion/);
});

test('SessionStart: ready project gets order reminder', () => {
  const sb = sandbox();
  const repo = makeRepo(sb, { codegraph: true, graphify: true });
  const r = hook(sb, 'SessionStart', { cwd: repo, source: 'startup' });
  assert.match(ctxOf(r), /graphify query\/explain \(map\) -> codegraph_explore/);
});

test('SessionStart: non-project directory produces no output', () => {
  const sb = sandbox();
  const r = hook(sb, 'SessionStart', { cwd: sb.root, source: 'startup' });
  assert.equal(r.stdout, '');
});

test('SessionStart: ~/.claude is never treated as a project', () => {
  const sb = sandbox();
  fs.mkdirSync(path.join(sb.claude, '.git'), { recursive: true });
  const r = hook(sb, 'SessionStart', { cwd: sb.claude, source: 'startup' });
  assert.equal(r.stdout, '');
});

const pre = (sb, tool, tool_input, extra = {}) =>
  hook(sb, 'PreToolUse', { tool_name: tool, tool_input, cwd: extra.cwd, ...extra });

test('setup gate: Read in a missing project is denied with install commands', () => {
  const sb = sandbox();
  const repo = makeRepo(sb);
  const r = pre(sb, 'Read', { file_path: path.join(repo, 'src', 'app.ts') }, { cwd: repo });
  assert.equal(decisionOf(r), 'deny');
  assert.match(reasonOf(r), /not set up/);
  assert.match(reasonOf(r), /codegraph init/);
  assert.match(reasonOf(r), /graphify extract .* --code-only/);
  assert.match(reasonOf(r), /guard\.mjs" decline/);
});

test('setup gate: Agent spawn in a missing project is denied', () => {
  const sb = sandbox();
  const repo = makeRepo(sb);
  const r = pre(sb, 'Agent', { prompt: 'explore' }, { cwd: repo });
  assert.equal(decisionOf(r), 'deny');
});

test('decline CLI disables gates for that workspace', () => {
  const sb = sandbox();
  const repo = makeRepo(sb);
  const d = run(sb, ['decline', repo]);
  assert.equal(d.code, 0);
  const r = pre(sb, 'Read', { file_path: path.join(repo, 'src', 'app.ts') }, { cwd: repo });
  assert.equal(r.stdout, '');
});

test('status CLI prints project status JSON', () => {
  const sb = sandbox();
  const repo = makeRepo(sb, { codegraph: true, graphify: true });
  const r = run(sb, ['status', repo]);
  assert.equal(r.out.status, 'ready');
});

const post = (sb, tool, tool_input, extra = {}) =>
  hook(sb, 'PostToolUse', { tool_name: tool, tool_input, cwd: extra.cwd, ...extra });

function readyRepo() {
  const sb = sandbox();
  const repo = makeRepo(sb, { codegraph: true, graphify: true });
  const appTs = path.join(repo, 'src', 'app.ts');
  return { sb, repo, appTs };
}

test('graph gate: code Read before graphify is denied', () => {
  const { sb, repo, appTs } = readyRepo();
  const r = pre(sb, 'Read', { file_path: appTs }, { cwd: repo });
  assert.equal(decisionOf(r), 'deny');
  assert.match(reasonOf(r), /graphify query/);
});

test('graph gate: non-code Read is always allowed', () => {
  const { sb, repo } = readyRepo();
  const r = pre(sb, 'Read', { file_path: path.join(repo, 'README.md') }, { cwd: repo });
  assert.equal(r.stdout, '');
});

test('order gate: codegraph before graphify is denied', () => {
  const { sb, repo } = readyRepo();
  const r = pre(sb, 'mcp__codegraph__codegraph_explore', { query: 'x', projectPath: repo }, { cwd: repo });
  assert.equal(decisionOf(r), 'deny');
  assert.match(reasonOf(r), /graphify before codegraph/);
});

test('full sequence: graphify -> codegraph -> Read allowed', () => {
  const { sb, repo, appTs } = readyRepo();
  post(sb, 'Bash', { command: 'graphify query "auth flow" --budget 1500' }, { cwd: repo });
  let r = pre(sb, 'Read', { file_path: appTs }, { cwd: repo });
  assert.equal(decisionOf(r), 'deny');
  assert.match(reasonOf(r), /codegraph_explore/);
  r = pre(sb, 'mcp__codegraph__codegraph_explore', { query: 'x', projectPath: repo }, { cwd: repo });
  assert.equal(r.stdout, '');
  post(sb, 'mcp__codegraph__codegraph_explore', { query: 'x', projectPath: repo }, { cwd: repo });
  r = pre(sb, 'Read', { file_path: appTs }, { cwd: repo });
  assert.equal(r.stdout, '');
});

test('reading GRAPH_REPORT.md satisfies the graphify step', () => {
  const { sb, repo } = readyRepo();
  post(sb, 'Read', { file_path: path.join(repo, 'graphify-out', 'GRAPH_REPORT.md') }, { cwd: repo });
  const r = pre(sb, 'mcp__codegraph__codegraph_explore', { query: 'x', projectPath: repo }, { cwd: repo });
  assert.equal(r.stdout, '');
});

test('subagent state is tracked separately from main', () => {
  const { sb, repo, appTs } = readyRepo();
  post(sb, 'Bash', { command: 'graphify query "x"' }, { cwd: repo });
  post(sb, 'mcp__codegraph__codegraph_explore', { query: 'x' }, { cwd: repo });
  const r = pre(sb, 'Read', { file_path: appTs }, { cwd: repo, agent_id: 'sub1', agent_type: 'Explore' });
  assert.equal(decisionOf(r), 'deny');
  assert.match(reasonOf(r), /graphify query/);
});

test('Bash search commands are gated, pipes into head are not', () => {
  const { sb, repo } = readyRepo();
  assert.equal(decisionOf(pre(sb, 'Bash', { command: 'rg "foo" src' }, { cwd: repo })), 'deny');
  assert.equal(decisionOf(pre(sb, 'Bash', { command: 'cd src && grep -n foo app.ts' }, { cwd: repo })), 'deny');
  assert.equal(pre(sb, 'Bash', { command: 'git log --oneline | head -5' }, { cwd: repo }).stdout, '');
});

test('Agent spawn is not graph-gated in a ready project', () => {
  const { sb, repo } = readyRepo();
  assert.equal(pre(sb, 'Agent', { prompt: 'x' }, { cwd: repo }).stdout, '');
});

test('concurrent PostToolUse from 12 agents: no lost updates', async () => {
  const { sb, repo } = readyRepo();
  await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      hookAsync(sb, 'PostToolUse', {
        tool_name: 'Bash', tool_input: { command: 'graphify query "x"' }, cwd: repo, agent_id: `a${i}`,
      })),
  );
  const results = await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      hookAsync(sb, 'PreToolUse', {
        tool_name: 'mcp__codegraph__codegraph_explore', tool_input: { query: 'x', projectPath: repo },
        cwd: repo, agent_id: `a${i}`,
      })),
  );
  results.forEach((r, i) => assert.equal(r.stdout, '', `agent a${i} was wrongly denied`));
});

test('8 concurrent denied Reads are all denied', async () => {
  const { sb, repo, appTs } = readyRepo();
  const results = await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      hookAsync(sb, 'PreToolUse', { tool_name: 'Read', tool_input: { file_path: appTs }, cwd: repo, agent_id: `a${i}` })),
  );
  results.forEach((r) => assert.equal(decisionOf(r), 'deny'));
});

test('Bash classification: writes and quoted text are not searches', () => {
  const { sb, repo } = readyRepo();
  const allowed = [
    "cat > src/new.ts <<'EOF'\nexport const a = 1;\nfind me\nEOF",
    'git commit -m "fix: thing\n\nfind stuff\ncat src/app.ts"',
    "echo 'a; grep b'",
    'cat package.json',
  ];
  for (const command of allowed) {
    assert.equal(pre(sb, 'Bash', { command }, { cwd: repo }).stdout, '', command);
  }
  assert.equal(decisionOf(pre(sb, 'Bash', { command: 'sed -n 1,50p src/app.ts' }, { cwd: repo })), 'deny');
  assert.equal(decisionOf(pre(sb, 'Bash', { command: 'LC_ALL=C grep x src' }, { cwd: repo })), 'deny');
});

test('echoing a graphify command does not satisfy the graphify step', () => {
  const { sb, repo } = readyRepo();
  post(sb, 'Bash', { command: 'echo "graphify query x"' }, { cwd: repo });
  const r = pre(sb, 'mcp__codegraph__codegraph_explore', { query: 'x', projectPath: repo }, { cwd: repo });
  assert.equal(decisionOf(r), 'deny');
});

test('paths: ~ in tool path is expanded and ignored as non-project', () => {
  const { sb, repo } = readyRepo();
  const r = pre(sb, 'Grep', { pattern: 'x', path: '~/.claude/rules' }, { cwd: repo });
  assert.equal(r.stdout, '');
});

test('paths: Git-Bash style /x/... path is treated as in-project', { skip: process.platform !== 'win32' }, () => {
  const { sb, repo, appTs } = readyRepo();
  const bash = '/' + appTs[0].toLowerCase() + appTs.slice(2).split(path.sep).join('/');
  const r = pre(sb, 'Read', { file_path: bash }, { cwd: repo });
  assert.equal(decisionOf(r), 'deny');
});

test('partial decline: declining graphify requires only codegraph', () => {
  const sb = sandbox();
  const repo = makeRepo(sb, { codegraph: true });
  assert.equal(run(sb, ['decline', repo, 'graphify']).code, 0);
  const r = pre(sb, 'Read', { file_path: path.join(repo, 'src', 'app.ts') }, { cwd: repo });
  assert.equal(decisionOf(r), 'deny');
  assert.match(reasonOf(r), /codegraph_explore/);
  assert.doesNotMatch(reasonOf(r), /graphify/);
  const s = run(sb, ['status', repo]);
  assert.equal(s.out.status, 'ready');
  assert.deepEqual(s.out.has, { codegraph: true, graphify: false });
});

test('decline CLI rejects unknown item with exit 1', () => {
  const sb = sandbox();
  const repo = makeRepo(sb);
  const r = run(sb, ['decline', repo, 'bogus']);
  assert.equal(r.code, 1);
  assert.match(r.stderr, /usage/);
});

test('setup gate: non-code Read in a missing project is allowed', () => {
  const sb = sandbox();
  const repo = makeRepo(sb);
  const r = pre(sb, 'Read', { file_path: path.join(repo, 'README.md') }, { cwd: repo });
  assert.equal(r.stdout, '');
});

test('projectSkillNames: project skills only', async () => {
  const sb = sandbox();
  const repo = makeRepo(sb);
  const prev = process.env.GUARD_HOME;
  process.env.GUARD_HOME = sb.home;
  try {
    const { projectSkillNames } = await import('../guard-lib/commands.mjs');
    assert.deepEqual(projectSkillNames('mkdir -p .claude/skills/foo', repo), ['foo']);
    assert.deepEqual(projectSkillNames('mkdir -p ${HOME}/.claude/skills/baz', repo), []);
    assert.deepEqual(projectSkillNames('cp x ~/.claude/skills/x', repo), []);
  } finally {
    if (prev === undefined) delete process.env.GUARD_HOME;
    else process.env.GUARD_HOME = prev;
  }
});

test('Bash classification: quoted file args and separators', () => {
  const { sb, repo } = readyRepo();
  const fwd = repo.split(path.sep).join('/');
  const gated = [
    'cat "src/app.ts"',
    "cat 'src/app.ts'",
    `head -50 "${fwd}/src/app.ts"`,
    'echo "don\'t" && grep x .',
    'cat src/app.ts 2>/dev/null',
    'cat <<< hello\ngrep foo src',
    'echo $((1<<2))\ngrep foo src',
  ];
  // distinct agent per command so the loop breaker does not engage
  gated.forEach((command, i) => {
    assert.equal(decisionOf(pre(sb, 'Bash', { command }, { cwd: repo, agent_id: `g${i}` })), 'deny', command);
  });
  const allowed = ['sed -i s/a/b/ src/app.ts', "sed --in-place 's/a/b/' src/app.ts", "echo 'a; grep b'"];
  for (const command of allowed) {
    assert.equal(pre(sb, 'Bash', { command }, { cwd: repo }).stdout, '', command);
  }
});

test('session dir mtime is refreshed by writes so prune keeps live sessions', () => {
  const { sb, repo } = readyRepo();
  const dir = path.join(sb.state, 'sessions', 's1');
  fs.mkdirSync(path.join(dir, 'agents', 'main'), { recursive: true });
  const old = new Date(Date.now() - 8 * 24 * 3600 * 1000);
  fs.utimesSync(dir, old, old);
  post(sb, 'Bash', { command: 'graphify query "x"' }, { cwd: repo });
  hook(sb, 'SessionStart', { cwd: repo, source: 'startup' });
  assert.ok(fs.existsSync(path.join(dir, 'agents', 'main', 'graphify')));
});

test('decline hint is paste-safe and SessionStart reflects has', () => {
  const sb = sandbox();
  const repo = makeRepo(sb);
  const r = pre(sb, 'Read', { file_path: path.join(repo, 'src', 'app.ts') }, { cwd: repo });
  assert.doesNotMatch(reasonOf(r), /\[codegraph\|graphify\]/);
  assert.match(reasonOf(r), /append codegraph and\/or graphify/);
  const sb2 = sandbox();
  const cgOnly = makeRepo(sb2, { codegraph: true });
  run(sb2, ['decline', cgOnly, 'graphify']);
  const c = ctxOf(hook(sb2, 'SessionStart', { cwd: cgOnly, source: 'startup' }));
  assert.match(c, /codegraph_explore \(symbols\) -> raw reads/);
  assert.doesNotMatch(c, /graphify query/);
});

test('UserPromptSubmit injects classification reminder', () => {
  const sb = sandbox();
  const r = hook(sb, 'UserPromptSubmit', { prompt: 'add a login page', cwd: sb.root });
  assert.match(ctxOf(r), /superpowers:brainstorming/);
  assert.match(ctxOf(r), /skills\/plugins/);
});

test('brainstorm gate: main-agent Edit before brainstorming is denied', () => {
  const { sb, repo, appTs } = readyRepo();
  const r = pre(sb, 'Edit', { file_path: appTs, old_string: 'a', new_string: 'b' }, { cwd: repo });
  assert.equal(decisionOf(r), 'deny');
  assert.match(reasonOf(r), /superpowers:brainstorming/);
});

test('brainstorm gate: satisfied by Skill invocation', () => {
  const { sb, repo, appTs } = readyRepo();
  post(sb, 'Skill', { skill: 'superpowers:brainstorming' }, { cwd: repo });
  const r = pre(sb, 'Edit', { file_path: appTs, old_string: 'a', new_string: 'b' }, { cwd: repo });
  assert.equal(r.stdout, '');
});

test('brainstorm gate: #quick bypasses for the turn only', () => {
  const { sb, repo, appTs } = readyRepo();
  hook(sb, 'UserPromptSubmit', { prompt: 'fix typo #quick', cwd: repo });
  assert.equal(pre(sb, 'Write', { file_path: appTs, content: 'x' }, { cwd: repo }).stdout, '');
  hook(sb, 'UserPromptSubmit', { prompt: 'now add a feature', cwd: repo });
  assert.equal(decisionOf(pre(sb, 'Write', { file_path: appTs, content: 'x' }, { cwd: repo })), 'deny');
});

test('brainstorm gate: subagents and docs/superpowers are exempt', () => {
  const { sb, repo, appTs } = readyRepo();
  const sub = pre(sb, 'Edit', { file_path: appTs }, { cwd: repo, agent_id: 'sub1' });
  assert.equal(sub.stdout, '');
  const spec = pre(sb, 'Write', { file_path: path.join(repo, 'docs', 'superpowers', 'specs', 'a.md') }, { cwd: repo });
  assert.equal(spec.stdout, '');
});

test('brainstorm gate: files outside any project are not gated', () => {
  const sb = sandbox();
  const r = pre(sb, 'Write', { file_path: path.join(sb.claude, 'rules', 'x.md') }, { cwd: sb.claude });
  assert.equal(r.stdout, '');
});

test('loop breaker: third identical deny is allowed with a warning', () => {
  const { sb, repo, appTs } = readyRepo();
  assert.equal(decisionOf(pre(sb, 'Read', { file_path: appTs }, { cwd: repo })), 'deny');
  assert.equal(decisionOf(pre(sb, 'Read', { file_path: appTs }, { cwd: repo })), 'deny');
  const third = pre(sb, 'Read', { file_path: appTs }, { cwd: repo });
  assert.equal(decisionOf(third), null);
  assert.match(ctxOf(third), /allowing this call/);
  assert.equal(decisionOf(pre(sb, 'Read', { file_path: appTs }, { cwd: repo })), 'deny');
});

test('loop breaker applies to the brainstorm gate', () => {
  const { sb, repo, appTs } = readyRepo();
  const edit = () => pre(sb, 'Edit', { file_path: appTs, old_string: 'a', new_string: 'b' }, { cwd: repo });
  assert.equal(decisionOf(edit()), 'deny');
  assert.equal(decisionOf(edit()), 'deny');
  const third = edit();
  assert.equal(decisionOf(third), null);
  assert.match(ctxOf(third), /allowing this call/);
});

test('loop breaker: deny is still returned when state cannot be written', () => {
  const { sb, repo, appTs } = readyRepo();
  fs.rmSync(sb.state, { recursive: true, force: true });
  fs.writeFileSync(sb.state, 'not a directory');
  const r = pre(sb, 'Read', { file_path: appTs }, { cwd: repo });
  assert.equal(decisionOf(r), 'deny');
});

test('kill switch disables all gates', () => {
  const { sb, repo, appTs } = readyRepo();
  fs.writeFileSync(path.join(sb.state, 'disabled'), '');
  assert.equal(pre(sb, 'Read', { file_path: appTs }, { cwd: repo }).stdout, '');
});

test('Stop refreshes dirty ready projects and clears dirty', () => {
  const { sb, repo, appTs } = readyRepo();
  post(sb, 'Edit', { file_path: appTs }, { cwd: repo });
  hook(sb, 'Stop', { cwd: repo });
  const log = fs.readFileSync(path.join(sb.state, 'refresh.log'), 'utf8');
  assert.match(log, /repo/);
  fs.rmSync(path.join(sb.state, 'refresh.log'));
  hook(sb, 'Stop', { cwd: repo });
  assert.equal(fs.existsSync(path.join(sb.state, 'refresh.log')), false);
});

test('Stop does not refresh projects that are not ready', () => {
  const sb = sandbox();
  const repo = makeRepo(sb);
  post(sb, 'Edit', { file_path: path.join(repo, 'src', 'app.ts') }, { cwd: repo });
  hook(sb, 'Stop', { cwd: repo });
  assert.equal(fs.existsSync(path.join(sb.state, 'refresh.log')), false);
});

test('skill written into a project without a local mirror triggers a reminder', () => {
  const { sb, repo } = readyRepo();
  const skillFile = path.join(repo, '.claude', 'skills', 'foo', 'SKILL.md');
  let r = post(sb, 'Write', { file_path: skillFile, content: 'x' }, { cwd: repo });
  assert.match(ctxOf(r), /~\/\.claude\/skills\/foo/);
  fs.mkdirSync(path.join(sb.claude, 'skills', 'foo'), { recursive: true });
  r = post(sb, 'Write', { file_path: skillFile, content: 'x' }, { cwd: repo });
  assert.equal(r.stdout, '');
});

test('SubagentStart injects exploration rules', () => {
  const sb = sandbox();
  const r = hook(sb, 'SubagentStart', { agent_id: 'sub1', agent_type: 'Explore', cwd: sb.root });
  assert.match(ctxOf(r), /graphify query\/explain \(map\) -> codegraph_explore/);
});

test('loop breaker: different calls in one batch are all denied', () => {
  const { sb, repo } = readyRepo();
  for (const name of ['a.ts', 'b.ts', 'c.ts']) {
    fs.writeFileSync(path.join(repo, 'src', name), 'export {};\n');
    assert.equal(decisionOf(pre(sb, 'Read', { file_path: path.join(repo, 'src', name) }, { cwd: repo })), 'deny', name);
  }
  for (const name of ['a.ts', 'b.ts', 'c.ts']) {
    assert.equal(decisionOf(pre(sb, 'Read', { file_path: path.join(repo, 'src', name) }, { cwd: repo })), 'deny', name);
  }
});

test('brainstorm gate: .gitignore edits are exempt', () => {
  const { sb, repo } = readyRepo();
  assert.equal(pre(sb, 'Edit', { file_path: path.join(repo, '.gitignore') }, { cwd: repo }).stdout, '');
});

test('UserPromptSubmit: slash command for a brainstorm skill sets brainstormed', () => {
  const { sb, repo, appTs } = readyRepo();
  hook(sb, 'UserPromptSubmit', { prompt: '/superpowers:brainstorming add x', cwd: repo });
  assert.equal(pre(sb, 'Edit', { file_path: appTs }, { cwd: repo }).stdout, '');
  const o = readyRepo();
  hook(o.sb, 'UserPromptSubmit', { prompt: '/writing-plans', cwd: o.repo });
  assert.equal(pre(o.sb, 'Edit', { file_path: o.appTs }, { cwd: o.repo }).stdout, '');
  const n = readyRepo();
  hook(n.sb, 'UserPromptSubmit', { prompt: '/other thing', cwd: n.repo });
  assert.equal(decisionOf(pre(n.sb, 'Edit', { file_path: n.appTs }, { cwd: n.repo })), 'deny');
});

test('refresh CLI with a missing project does not crash', () => {
  const sb = sandbox();
  const r = run(sb, ['refresh', path.join(sb.root, 'nope')]);
  assert.equal(r.code, 0);
});

test('loop breaker: Greps and Globs with different patterns and no path are all denied', () => {
  const { sb, repo } = readyRepo();
  for (const tool of ['Grep', 'Glob']) {
    for (let i = 0; i < 6; i++) {
      const r = pre(sb, tool, { pattern: `p${i}` }, { cwd: repo });
      assert.equal(decisionOf(r), 'deny', `${tool} ${i}`);
    }
  }
});

test('loop breaker: third identical Grep is allowed with a warning', () => {
  const { sb, repo } = readyRepo();
  const grep = () => pre(sb, 'Grep', { pattern: 'same' }, { cwd: repo });
  assert.equal(decisionOf(grep()), 'deny');
  assert.equal(decisionOf(grep()), 'deny');
  const third = grep();
  assert.equal(decisionOf(third), null);
  assert.match(ctxOf(third), /allowing this call/);
});
