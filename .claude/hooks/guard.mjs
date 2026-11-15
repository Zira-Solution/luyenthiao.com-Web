#!/usr/bin/env node

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

async function safeLog(err) {
  try {
    const { logError } = await import('./guard-lib/state.mjs');
    logError(err);
  } catch {
    /* nothing left to do */
  }
}

async function main() {
  const [cmd, ...args] = process.argv.slice(2);
  const hookMode = /^[A-Z]/.test(cmd || '');
  try {
    if (hookMode) {
      const { shouldStandDown } = await import('./guard-lib/dedup.mjs');
      if (shouldStandDown()) return;
      const { HANDLERS } = await import('./guard-lib/handlers.mjs');
      const input = JSON.parse((await readStdin()) || '{}');
      const handler = HANDLERS[cmd];
      if (!handler) return;
      const out = handler(input);
      if (out) process.stdout.write(JSON.stringify(out));
      return;
    }
    const { runCli } = await import('./guard-lib/cli.mjs');
    runCli(cmd, args);
  } catch (err) {
    if (hookMode) {
      await safeLog(err); // hooks fail open: exit 0
    } else {
      process.stderr.write(`guard: ${(err && err.message) || err}\n`);
      process.exitCode = 1;
    }
  }
}

await main();
