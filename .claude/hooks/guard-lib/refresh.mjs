import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stateDir } from './env.mjs';
import { projectStatus } from './project.mjs';
import { logError } from './state.mjs';

const GUARD = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'guard.mjs');
const STALE_LOCK_MS = 25 * 60 * 1000;
const STEP_TIMEOUT_MS = 10 * 60 * 1000;
const MAX_LOOPS = 3;

function lockBase(root) {
  const id = crypto.createHash('sha1').update(root.toLowerCase()).digest('hex').slice(0, 12);
  return path.join(stateDir(), 'locks', id);
}

function markPending(root) {
  const file = `${lockBase(root)}.pending`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, root);
}

// Called from the Stop hook: never blocks, never waits.
export function scheduleRefresh(root) {
  if (process.env.GUARD_DRY_REFRESH) {
    fs.mkdirSync(stateDir(), { recursive: true });
    fs.appendFileSync(path.join(stateDir(), 'refresh.log'), `${root}\n`);
    return;
  }
  markPending(root);
  const child = spawn(process.execPath, [GUARD, 'refresh', root], {
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  });
  child.on('error', logError);
  child.unref();
}

function step(cmd, root, lock) {
  const r = spawnSync(cmd, { cwd: root, shell: true, windowsHide: true, stdio: 'ignore', timeout: STEP_TIMEOUT_MS });
  if (r.error || r.status !== 0) {
    logError(`refresh step failed: ${cmd} (status ${r.status}${r.error ? `, ${r.error.message}` : ''})`);
  }
  try {
    const now = new Date();
    fs.utimesSync(lock, now, now);
  } catch {
    /* best effort */
  }
}

// Called by `guard.mjs refresh <root>` in the detached child.
export function refreshNow(root) {
  const base = lockBase(root);
  const lock = `${base}.lock`;
  const pending = `${base}.pending`;
  markPending(root);
  try {
    if (Date.now() - fs.statSync(lock).mtimeMs > STALE_LOCK_MS) fs.unlinkSync(lock);
  } catch {
    /* no lock yet */
  }
  let fd;
  try {
    fd = fs.openSync(lock, 'wx');
  } catch {
    return; // another refresh is running; it will see the pending marker
  }
  try {
    for (let i = 0; i < MAX_LOOPS && fs.existsSync(pending); i++) {
      fs.rmSync(pending, { force: true });
      const { has } = projectStatus(root);
      if (has.graphify) step(`graphify update --force "${root}"`, root, lock);
      if (has.codegraph) step(`codegraph sync --quiet "${root}"`, root, lock);
    }
  } finally {
    fs.closeSync(fd);
    fs.rmSync(lock, { force: true });
  }
  // A Stop that arrived in the release window must not be stranded.
  if (fs.existsSync(pending)) scheduleRefresh(root);
}
