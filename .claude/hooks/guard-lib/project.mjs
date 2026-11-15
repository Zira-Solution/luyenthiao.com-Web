import fs from 'node:fs';
import path from 'node:path';
import { norm, samePath, isInside, homeDir, claudeDir } from './env.mjs';
import { declinedItems } from './state.mjs';

export { isCodeFile } from './files.mjs';

export function findProjectRoot(target) {
  if (!target) return null;
  const start = norm(target);
  if (isInside(start, claudeDir())) return null;
  let dir = start;
  for (;;) {
    if (fs.existsSync(path.join(dir, '.git'))) {
      if (samePath(dir, homeDir())) return null;
      return norm(dir);
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

// An item counts as satisfied when it is present OR declined.
export function projectStatus(root) {
  const declined = declinedItems(root);
  const has = {
    codegraph: fs.existsSync(path.join(root, '.codegraph')),
    graphify: fs.existsSync(path.join(root, 'graphify-out', 'graph.json')),
  };
  const cgOk = has.codegraph || declined.includes('codegraph');
  const gfOk = has.graphify || declined.includes('graphify');
  if (cgOk && gfOk) {
    return { status: has.codegraph || has.graphify ? 'ready' : 'declined', missing: [], has };
  }
  const missing = [];
  if (!cgOk) missing.push('codegraph index (.codegraph/)');
  if (!gfOk) missing.push('graphify graph (graphify-out/graph.json)');
  const graphifySkill =
    fs.existsSync(path.join(claudeDir(), 'skills', 'graphify')) ||
    fs.existsSync(path.join(root, '.claude', 'skills', 'graphify'));
  if (!declined.includes('graphify') && !graphifySkill) {
    missing.push('global graphify skill (~/.claude/skills/graphify)');
  }
  return { status: 'missing', missing, has };
}
