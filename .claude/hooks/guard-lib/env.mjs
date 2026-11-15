import os from 'node:os';
import path from 'node:path';

const IS_WIN = process.platform === 'win32';
const CASE_INSENSITIVE = IS_WIN;

function rawHome() {
  return path.resolve(process.env.GUARD_HOME || os.homedir()).replace(/\\/g, '/');
}

// Normalize a path: expand ~/$HOME/${HOME}/%USERPROFILE%, map Git-Bash /x/... to X:/...
// on win32, resolve relative paths against `base` (default: process.cwd()), use forward slashes.
export function norm(p, base) {
  let s = String(p);
  s = s.replace(/^(?:~|\$HOME|\$\{HOME\}|%USERPROFILE%)(?=[\\/]|$)/i, rawHome());
  if (IS_WIN) {
    const m = s.match(/^\/([a-zA-Z])(\/|$)/);
    if (m) s = `${m[1].toUpperCase()}:/${s.slice(m[0].length)}`;
  }
  const resolved = base ? path.resolve(String(base), s) : path.resolve(s);
  return resolved.replace(/\\/g, '/');
}

function cmpKey(p) {
  const n = norm(p).replace(/\/+$/, '');
  return CASE_INSENSITIVE ? n.toLowerCase() : n;
}

export function samePath(a, b) {
  return cmpKey(a) === cmpKey(b);
}

export function isInside(child, parent) {
  const c = cmpKey(child);
  const p = cmpKey(parent);
  return c === p || c.startsWith(p + '/');
}

export function homeDir() {
  return norm(process.env.GUARD_HOME || os.homedir());
}

export function claudeDir() {
  return norm(path.join(homeDir(), '.claude'));
}

export function stateDir() {
  return norm(process.env.GUARD_STATE_DIR || path.join(claudeDir(), 'state', 'guard'));
}
