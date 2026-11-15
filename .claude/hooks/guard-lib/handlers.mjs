import { findProjectRoot, projectStatus, isCodeFile } from './project.mjs';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  pruneSessions, agentKey, hasAgentFlag, setAgentFlag, isDisabled,
  hasSessionFlag, setSessionFlag, bumpDeny, resetDeny, markDirty, takeDirty,
} from './state.mjs';
import { isSearchCommand, isCodegraphRead, isGraphifyRead, projectSkillNames } from './commands.mjs';
import { norm, claudeDir } from './env.mjs';
import { scheduleRefresh } from './refresh.mjs';
import { SELF } from './dedup.mjs';

// Repo that vendors this guard: <repo>/.claude/hooks/guard.mjs -> <repo>
const TOOLING_RULE = `${norm(path.join(path.dirname(SELF), '..', '..'))}/.claude/rules/tooling.md`;

export const ctx = (event, text) => ({ hookSpecificOutput: { hookEventName: event, additionalContext: text } });

export const deny = (reason) => ({
  hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: reason },
});

const DECLINE_CMD = (root) => `node "${SELF}" decline "${root}"`;
const DECLINE_NOTE = '(append codegraph and/or graphify to decline only those; omit both to decline all)';

const SPAWN_TOOLS = new Set(['Agent', 'Task']);
const EDIT_TOOLS = new Set(['Edit', 'Write', 'MultiEdit', 'NotebookEdit']);
const BRAINSTORM_SKILLS = new Set([
  'brainstorming', 'writing-plans', 'executing-plans', 'systematic-debugging', 'subagent-driven-development',
]);
const LOOP_LIMIT = 3;

export function targetPath(input) {
  const ti = input.tool_input || {};
  const raw = ti.file_path || ti.notebook_path || ti.path || ti.projectPath || input.cwd;
  return raw ? norm(raw, input.cwd) : null;
}

function setupGate(root, st) {
  return {
    key: 'setup',
    reason:
      `[guard] Project ${root} is not set up: ${st.missing.join('; ')}. ` +
      `Ask the user via AskUserQuestion (multiSelect) which to install: ` +
      `\`codegraph init -y "${root}"\`; \`graphify extract "${root}" --code-only\`; ` +
      `\`graphify install --platform claude\`; \`graphify hook install\` (run inside the project); ` +
      `add graphify-out/ and .codegraph/ to .gitignore. ` +
      `If the user declines some items: \`${DECLINE_CMD(root)}\` ${DECLINE_NOTE}.`,
  };
}

function graphifyHint(root) {
  return `\`graphify query "<question>" --budget 1500 --graph "${root}/graphify-out/graph.json"\``;
}

function exploreGate(tool, ti, codegraphCall, root, agent) {
  const nonCodeRead = tool === 'Read' && !isCodeFile(ti.file_path);
  const st = projectStatus(root);
  if (st.status === 'missing') return nonCodeRead ? null : setupGate(root, st);
  if (st.status !== 'ready') return null;
  if (SPAWN_TOOLS.has(tool)) return null;
  if (codegraphCall) {
    if (!st.has.graphify || agent.graphify) return null;
    return { key: 'order', reason: `[guard] Use graphify before codegraph: run ${graphifyHint(root)} (or \`graphify explain "<symbol>"\`), then retry.` };
  }
  if (nonCodeRead) return null;
  if (st.has.graphify && !agent.graphify) {
    return { key: 'graphify', reason: `[guard] Get the code map first: run ${graphifyHint(root)}, then use codegraph_explore before raw reads.` };
  }
  if (st.has.codegraph && !agent.codegraph) {
    return { key: 'codegraph', reason: `[guard] Use codegraph_explore (MCP, projectPath="${root}") or \`codegraph explore "<symbols>"\` before raw Read/Grep/Glob.` };
  }
  return null;
}

function onSessionStart(input) {
  pruneSessions();
  const root = findProjectRoot(input.cwd);
  if (!root) return null;
  const st = projectStatus(root);
  if (st.status === 'missing') {
    return ctx('SessionStart',
      `[guard] Project ${root} is missing tooling: ${st.missing.join('; ')}. ` +
      `Before exploring, ask the user via AskUserQuestion which items to install ` +
      `(see ${TOOLING_RULE}), install the approved ones, ` +
      `or for declined ones run \`${DECLINE_CMD(root)}\` ${DECLINE_NOTE}.`);
  }
  if (st.status === 'ready') {
    const steps = [];
    if (st.has.graphify) steps.push('graphify query/explain (map)');
    if (st.has.codegraph) steps.push('codegraph_explore (symbols)');
    steps.push('raw reads');
    return ctx('SessionStart', `[guard] Project ${root} is indexed. Explore in order: ${steps.join(' -> ')}.`);
  }
  return null;
}

function brainstormGate(input) {
  if (agentKey(input) !== 'main') return null;
  if (hasSessionFlag(input.session_id, 'brainstormed') || hasSessionFlag(input.session_id, 'quick')) return null;
  const p = String(targetPath(input) || '').replace(/\\/g, '/');
  if (/\/docs\/superpowers\//i.test(p) || /\/\.claude\/superpowers\//i.test(p) || /(?:^|\/)\.gitignore$/i.test(p)) return null;
  return {
    key: 'brainstorm',
    reason:
      '[guard] Before editing project files, invoke superpowers:brainstorming ' +
      '(or writing-plans / systematic-debugging / executing-plans). ' +
      'For a trivial edit, ask the user to resend the request with #quick.',
  };
}

// Third identical deny for the same agent+gate is allowed with a warning.
// Persistence failures must never prevent a result: fall back to the plain deny.
// Only repeats of the same call count: the counter is keyed by gate + call fingerprint.
function callFingerprint(input) {
  const tool = String(input.tool_name || '');
  return crypto.createHash('sha1')
    .update(`${tool}\0${JSON.stringify(input.tool_input ?? {})}`)
    .digest('hex').slice(0, 12);
}

function applyLoopBreaker(input, result) {
  try {
    const sid = input.session_id;
    const key = agentKey(input);
    const gateKey = `${result.key}.${callFingerprint(input)}`;
    if (bumpDeny(sid, key, gateKey) >= LOOP_LIMIT) {
      resetDeny(sid, key, gateKey);
      return ctx('PreToolUse',
        `[guard] Gate "${result.key}" denied ${LOOP_LIMIT - 1} times; allowing this call. ` +
        `Follow the rule on the next call: ${result.reason}`);
    }
  } catch {
    /* fall through to a plain deny */
  }
  return deny(result.reason);
}

function onPreToolUse(input) {
  if (isDisabled()) return null;
  const tool = String(input.tool_name || '');
  const ti = input.tool_input || {};
  const cmd = tool === 'Bash' ? String(ti.command || '') : '';
  const codegraphCall = tool.startsWith('mcp__codegraph__') || isCodegraphRead(cmd);
  const explore =
    ['Read', 'Grep', 'Glob'].includes(tool) || SPAWN_TOOLS.has(tool) || codegraphCall ||
    (tool === 'Bash' && isSearchCommand(cmd));
  const edit = EDIT_TOOLS.has(tool);
  if (!explore && !edit) return null;
  const root = findProjectRoot(targetPath(input));
  if (!root) return null;
  let result;
  if (explore) {
    const key = agentKey(input);
    const agent = {
      graphify: hasAgentFlag(input.session_id, key, 'graphify'),
      codegraph: hasAgentFlag(input.session_id, key, 'codegraph'),
    };
    result = exploreGate(tool, ti, codegraphCall, root, agent);
  } else {
    result = brainstormGate(input);
  }
  return result ? applyLoopBreaker(input, result) : null;
}

function onPostToolUse(input) {
  const tool = String(input.tool_name || '');
  const ti = input.tool_input || {};
  const cmd = tool === 'Bash' ? String(ti.command || '') : '';
  const key = agentKey(input);

  if (isGraphifyRead(cmd) || (tool === 'Read' && /GRAPH_REPORT\.md$/i.test(String(ti.file_path || '')))) {
    setAgentFlag(input.session_id, key, 'graphify');
  }
  if (tool.startsWith('mcp__codegraph__') || isCodegraphRead(cmd)) {
    setAgentFlag(input.session_id, key, 'codegraph');
  }
  if (tool === 'Skill') {
    const name = String(ti.skill || '').split(':').pop();
    if (BRAINSTORM_SKILLS.has(name)) setSessionFlag(input.session_id, 'brainstormed', true);
  }

  const notes = [];
  if (EDIT_TOOLS.has(tool)) {
    const root = findProjectRoot(targetPath(input));
    if (root) markDirty(input.session_id, root);
  }
  const skillText = EDIT_TOOLS.has(tool) ? String(targetPath(input) || '') : cmd;
  for (const name of projectSkillNames(skillText, input.cwd)) {
    if (!fs.existsSync(path.join(claudeDir(), 'skills', name))) {
      notes.push(`[guard] Skill "${name}" was added to the project; also install a copy at ~/.claude/skills/${name} (see ${TOOLING_RULE}).`);
    }
  }
  return notes.length ? ctx('PostToolUse', notes.join(' ')) : null;
}

function onUserPromptSubmit(input) {
  const prompt = String(input.prompt || '');
  const quick = /#quick\b/i.test(prompt);
  setSessionFlag(input.session_id, 'quick', quick);
  const slash = prompt.match(/^\s*\/(?:superpowers:)?([\w-]+)/);
  if (slash && BRAINSTORM_SKILLS.has(slash[1])) setSessionFlag(input.session_id, 'brainstormed', true);
  return ctx('UserPromptSubmit',
    '[guard] Classify this prompt: design / feature / behavior change / architecture / trade-off -> ' +
    'invoke superpowers:brainstorming before implementing. Hard task or missing capability -> ' +
    'research skills/plugins and report candidates to the user.' +
    (quick ? ' (#quick: brainstorm gate bypassed this turn)' : ''));
}

const SUBAGENT_RULES =
  '[guard] Rules for this subagent: in an indexed project explore in order graphify query/explain (map) -> ' +
  'codegraph_explore (symbols) -> raw Read/Grep. Prefer compact CLI output; do not dump whole files when a symbol query suffices.';

function onSubagentStart() {
  return ctx('SubagentStart', SUBAGENT_RULES);
}

function onStop(input) {
  for (const root of takeDirty(input.session_id)) {
    if (projectStatus(root).status === 'ready') scheduleRefresh(root);
  }
  return null;
}

export const HANDLERS = {
  SessionStart: onSessionStart,
  UserPromptSubmit: onUserPromptSubmit,
  PreToolUse: onPreToolUse,
  PostToolUse: onPostToolUse,
  SubagentStart: onSubagentStart,
  Stop: onStop,
};
