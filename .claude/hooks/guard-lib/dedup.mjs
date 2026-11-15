import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { norm, samePath, claudeDir } from './env.mjs';

// The vendored guard entry file (this repo's .claude/hooks/guard.mjs).
export const SELF = norm(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'guard.mjs'));
const GUARD_TOKEN = /[^\s"'`]*guard\.mjs/g;
const PROJECT_VAR = /\$\{?CLAUDE_PROJECT_DIR\}?/;

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
      if (PROJECT_VAR.test(command)) continue;
      for (const token of command.match(GUARD_TOKEN) || []) {
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
