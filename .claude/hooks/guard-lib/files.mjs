import path from 'node:path';

export const CODE_EXT = new Set([
  '.js', '.mjs', '.cjs', '.jsx', '.ts', '.tsx', '.mts', '.cts', '.vue', '.svelte', '.astro',
  '.py', '.java', '.kt', '.kts', '.scala', '.groovy', '.go', '.rs', '.rb', '.php', '.cs',
  '.c', '.h', '.cc', '.cpp', '.hpp', '.m', '.mm', '.swift', '.dart', '.lua', '.sh', '.ps1', '.sql',
  '.r', '.ex', '.exs', '.hs', '.ml', '.fs', '.zig', '.pl', '.clj', '.erl', '.vb',
]);

export function isCodeFile(filePath) {
  if (!filePath) return false;
  return CODE_EXT.has(path.extname(String(filePath)).toLowerCase());
}
