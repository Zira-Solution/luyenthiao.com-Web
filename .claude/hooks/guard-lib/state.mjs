import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { stateDir, norm, samePath } from './env.mjs';

const WEEK_MS = 7 * 24 * 3600 * 1000;
const RETRY_CODES = new Set(['EPERM', 'EBUSY', 'EACCES']);
export const DECLINE_ITEMS = ['codegraph', 'graphify'];

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function withRetry(fn) {
  for (let i = 0; ; i++) {
    try {
      return fn();
    } catch (err) {
      if (i >= 4 || !RETRY_CODES.has(err && err.code)) throw err;
      sleep(15);
    }
  }
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  try {
    withRetry(() => {
      fs.writeFileSync(tmp, JSON.stringify(data));
      fs.renameSync(tmp, file);
    });
  } catch (err) {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
    throw err;
  }
}

function writeMarker(sessionId, file, content = '') {
  withRetry(() => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  });
  // Writes into subfolders do not bump the session dir mtime; prune relies on it.
  try {
    const now = new Date();
    fs.utimesSync(sessionDir(sessionId), now, now);
  } catch {
    /* best effort */
  }
}

const safe = (s) => String(s || 'unknown').replace(/[^\w.-]/g, '_');

function sessionDir(sessionId) {
  return path.join(stateDir(), 'sessions', safe(sessionId));
}

export function agentKey(input) {
  return input.agent_id ? String(input.agent_id) : 'main';
}

export function hasAgentFlag(sessionId, agent, name) {
  return fs.existsSync(path.join(sessionDir(sessionId), 'agents', safe(agent), name));
}

export function setAgentFlag(sessionId, agent, name) {
  writeMarker(sessionId, path.join(sessionDir(sessionId), 'agents', safe(agent), name));
}

export function hasSessionFlag(sessionId, name) {
  return fs.existsSync(path.join(sessionDir(sessionId), 'flags', name));
}

export function setSessionFlag(sessionId, name, on) {
  const file = path.join(sessionDir(sessionId), 'flags', name);
  if (on) {
    writeMarker(sessionId, file);
    return;
  }
  try {
    withRetry(() => fs.rmSync(file, { force: true }));
  } catch {
    /* ignore */
  }
}

function denyFile(sessionId, agent, gateKey) {
  return path.join(sessionDir(sessionId), 'denies', `${safe(agent)}.${safe(gateKey)}`);
}

export function bumpDeny(sessionId, agent, gateKey) {
  const file = denyFile(sessionId, agent, gateKey);
  let n = 0;
  try {
    n = parseInt(fs.readFileSync(file, 'utf8'), 10) || 0;
  } catch {
    /* no counter yet */
  }
  n += 1;
  writeMarker(sessionId, file, String(n));
  return n;
}

export function resetDeny(sessionId, agent, gateKey) {
  try {
    withRetry(() => fs.rmSync(denyFile(sessionId, agent, gateKey), { force: true }));
  } catch {
    /* ignore */
  }
}

function dirtyKey(root) {
  return crypto.createHash('sha1').update(norm(root).toLowerCase()).digest('hex').slice(0, 12);
}

export function markDirty(sessionId, root) {
  writeMarker(sessionId, path.join(sessionDir(sessionId), 'dirty', dirtyKey(root)), norm(root));
}

export function takeDirty(sessionId) {
  const dir = path.join(sessionDir(sessionId), 'dirty');
  let names = [];
  try {
    names = fs.readdirSync(dir);
  } catch {
    return [];
  }
  const roots = [];
  for (const name of names) {
    const file = path.join(dir, name);
    try {
      const root = fs.readFileSync(file, 'utf8');
      if (root) roots.push(root);
      fs.rmSync(file, { force: true });
    } catch {
      /* ignore */
    }
  }
  return roots;
}

function workspacesFile() {
  return path.join(stateDir(), 'workspaces.json');
}

// Shape: { declined: { "<normRoot>": ["codegraph", "graphify"] } }. Old array shape is migrated on read.
function readDeclined() {
  const ws = readJson(workspacesFile(), {});
  let d = ws.declined;
  if (Array.isArray(d)) {
    const migrated = {};
    for (const r of d) migrated[norm(r)] = [...DECLINE_ITEMS];
    d = migrated;
  }
  return d && typeof d === 'object' ? d : {};
}

export function declinedItems(root) {
  for (const [key, items] of Object.entries(readDeclined())) {
    if (samePath(key, root)) return Array.isArray(items) ? items : [];
  }
  return [];
}

export function declineWorkspace(root, items) {
  const wanted = items && items.length ? items : DECLINE_ITEMS;
  const declined = readDeclined();
  const key = Object.keys(declined).find((k) => samePath(k, root)) || norm(root);
  declined[key] = [...new Set([...(declined[key] || []), ...wanted])];
  writeJson(workspacesFile(), { declined });
}

export function isDisabled() {
  return fs.existsSync(path.join(stateDir(), 'disabled'));
}

export function pruneSessions(maxAgeMs = WEEK_MS) {
  const dir = path.join(stateDir(), 'sessions');
  let names = [];
  try {
    names = fs.readdirSync(dir);
  } catch {
    return;
  }
  const now = Date.now();
  for (const name of names) {
    const entry = path.join(dir, name);
    try {
      if (now - fs.statSync(entry).mtimeMs > maxAgeMs) fs.rmSync(entry, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

export function logError(err) {
  try {
    fs.mkdirSync(stateDir(), { recursive: true });
    const line = `[${new Date().toISOString()}] ${(err && err.stack) || err}\n`;
    fs.appendFileSync(path.join(stateDir(), 'errors.log'), line);
  } catch {
    /* never throw from the logger */
  }
}
