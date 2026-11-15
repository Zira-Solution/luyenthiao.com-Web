import { isCodeFile } from './files.mjs';
import { norm, isInside, claudeDir } from './env.mjs';

const HEREDOC = /(?<!<)<<(?!<)-?\s*['"]?(\w+)['"]?/;
const ARITHMETIC = /\$\(\([^)]*\)\)/g;
const PREFIX = /^\s*(?:sudo\s+|[A-Za-z_]\w*=\S*\s+)/;
const GRAPHIFY_READ = /^(?:\S*[\\/])?graphify(?:\.exe)?\s+(?:query|explain|path|god-nodes|affected)\b/;
const CODEGRAPH_READ = /^(?:\S*[\\/])?codegraph(?:\.cmd)?\s+(?:explore|query|node|context|callers|callees|impact|files)\b/;
const SKILL_TOKEN = /(?:^|[\s"'`=])([^\s"'`]*?\.claude[\\/]skills[\\/][\w.-]+)/g;
const NULL_REDIRECTS = /&>>?\s*\/dev\/null|\d*>>?\s*\/dev\/null|\d*>&\d+/g;
const SEPARATORS = new Set([';', '&', '|', '<', '>', '\n']);

function stripHeredocs(cmd) {
  const out = [];
  let delim = null;
  for (const line of String(cmd || '').split('\n')) {
    if (delim) {
      if (line.trim() === delim) delim = null;
      continue;
    }
    out.push(line);
    const m = line.replace(ARITHMETIC, '').match(HEREDOC);
    if (m) delim = m[1];
  }
  return out.join('\n');
}

// Keep quoted content (file names inside quotes still matter) but turn shell
// separators inside quotes into spaces so they cannot split or start a command.
function neutralizeQuoted(text) {
  let out = '';
  let quote = null;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === '\\' && quote === '"' && i + 1 < text.length) {
        out += ch + text[++i];
      } else if (ch === quote) {
        quote = null;
        out += ch;
      } else {
        out += SEPARATORS.has(ch) ? ' ' : ch;
      }
    } else if (ch === '\\' && i + 1 < text.length) {
      out += ch + text[++i];
    } else {
      if (ch === "'" || ch === '"') quote = ch;
      out += ch;
    }
  }
  return out;
}

// Split into command segments with leading env assignments and sudo stripped.
// Pipes stay inside a segment.
function segments(cmd) {
  return neutralizeQuoted(stripHeredocs(cmd))
    .split(/&&|\|\||;|\n/)
    .map((s) => {
      let seg = s;
      while (PREFIX.test(seg)) seg = seg.replace(PREFIX, '');
      return seg.trim();
    })
    .filter(Boolean);
}

const unquote = (tok) => tok.replace(/^['"]+|['"]+$/g, '');

function isSearchSegment(seg) {
  if (/^(?:rg|grep|egrep|fgrep|find)\b/.test(seg)) return true;
  if (/^(?:cat|head|tail|sed|awk)\b/.test(seg)) {
    const tokens = seg.split(/\s+/).slice(1);
    if (/^sed\b/.test(seg) && tokens.some((t) => /^-[A-Za-z]*i/.test(t) || t.startsWith('--in-place'))) {
      return false;
    }
    if (/<<(?!<)|>/.test(seg.replace(NULL_REDIRECTS, ''))) return false;
    return tokens.some((tok) => isCodeFile(unquote(tok)));
  }
  return false;
}

export function isSearchCommand(cmd) {
  return segments(cmd).some(isSearchSegment);
}

export function isGraphifyRead(cmd) {
  return segments(cmd).some((s) => GRAPHIFY_READ.test(s));
}

export function isCodegraphRead(cmd) {
  return segments(cmd).some((s) => CODEGRAPH_READ.test(s));
}

// Skill names written under a project's .claude/skills/<name>, resolved against cwd.
// Anything inside the user's ~/.claude is ignored.
export function projectSkillNames(text, cwd) {
  const names = new Set();
  for (const m of String(text || '').matchAll(SKILL_TOKEN)) {
    const resolved = norm(m[1], cwd);
    if (isInside(resolved, claudeDir())) continue;
    const name = resolved.match(/\/skills\/([\w.-]+)$/);
    if (name) names.add(name[1]);
  }
  return [...names];
}
