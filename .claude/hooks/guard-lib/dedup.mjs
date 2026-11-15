import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { norm, samePath, claudeDir } from './env.mjs';

// The vendored guard entry file (this repo's .claude/hooks/guard.mjs).
export const SELF = norm(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'guard.mjs'));

// Quoted strings are kept whole (paths with spaces); unquoted words split on whitespace.
const TOKEN = /"([^"]*)"|'([^']*)'|([^\s"'`]+)/g;
const GUARD_NAME = /(?:^|[\\/])guard\.mjs$/;
const PROJECT_VAR = /^(?:\$\{?CLAUDE_PROJECT_DIR\}?|%CLAUDE_PROJECT_DIR%)/;

function clean(token) {
  return token.replace(/[;&|)]+$/, '');
}

// Candidate paths in a hook command. A quoted string that is itself a guard path stays whole;
// any other quoted string (e.g. `bash -c "node ~/.claude/hooks/guard.mjs; echo"`) is split into words.
function guardTokens(command) {
  const out = [];
  for (const m of command.matchAll(TOKEN)) {
    const quoted = m[1] ?? m[2];
    if (quoted !== undefined) {
      const whole = clean(quoted.trim());
      if (GUARD_NAME.test(whole)) out.push(whole);
      else for (const word of quoted.split(/\s+/)) out.push(clean(word));
    } else {
      out.push(clean(m[3]));
    }
  }
  return out.filter((t) => GUARD_NAME.test(t) && !PROJECT_VAR.test(t));
}

function hookCommands(file) {
  let data;
  try {
    data = JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return [];
  }
  const out = [];
  for (const groups of Object.values((data && data.hooks) || {})) {
    if (!Array.isArray(groups)) continue;
    for (const group of groups) {
      for (const h of (group && group.hooks) || []) {
        if (h && typeof h.command === 'string') out.push(h.command);
      }
    }
  }
  return out;
}

// True when the user-level settings register a guard.mjs other than this vendored file.
export function userGuardRegistered() {
  for (const name of ['settings.json', 'settings.local.json']) {
    for (const command of hookCommands(path.join(claudeDir(), name))) {
      for (const token of guardTokens(command)) {
        if (!samePath(norm(token), SELF)) return true;
      }
    }
  }
  return false;
}

// The project guard stays silent when disabled explicitly or when a user-level guard is active.
export function shouldStandDown() {
  if (process.env.GUARD_PROJECT === '0') return true;
  try {
    return userGuardRegistered();
  } catch {
    return false;
  }
}
