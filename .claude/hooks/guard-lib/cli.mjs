import { findProjectRoot, projectStatus } from './project.mjs';
import { declineWorkspace, DECLINE_ITEMS, logError } from './state.mjs';
import { norm } from './env.mjs';
import { refreshNow } from './refresh.mjs';

const USAGE = 'usage: guard.mjs <HookEvent> | decline <path> [codegraph|graphify ...] | status [path] | refresh <root>\n';

function fail(message) {
  process.stderr.write(message);
  process.exitCode = 1;
}

export function runCli(cmd, args) {
  if (cmd === 'decline') {
    const [target, ...items] = args;
    if (!target || items.some((i) => !DECLINE_ITEMS.includes(i))) return fail(USAGE);
    const root = findProjectRoot(target) || norm(target);
    declineWorkspace(root, items);
    process.stdout.write(`declined ${root} ${items.length ? items.join(',') : DECLINE_ITEMS.join(',')}\n`);
    return;
  }
  if (cmd === 'status') {
    const root = findProjectRoot(args[0] || process.cwd());
    const info = root ? { root, ...projectStatus(root) } : { root: null, status: 'not-a-project', missing: [] };
    process.stdout.write(JSON.stringify(info, null, 2) + '\n');
    return;
  }
  if (cmd === 'refresh') {
    if (args[0]) {
      try {
        refreshNow(norm(args[0]));
      } catch (err) {
        logError(err);
      }
    }
    return;
  }
  fail(`unknown command: ${cmd}\n${USAGE}`);
}
