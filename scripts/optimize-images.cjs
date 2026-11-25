#!/usr/bin/env node

/**
 * Reusable Image Optimization Script for luyenthiao.com-Web
 *
 * Usage:
 *   node scripts/optimize-images.cjs [options] [target_path]
 *
 * Options:
 *   --replace        Delete source PNG/JPG after generating optimized WebP
 *   --dry-run        Calculate savings without writing any files
 *   --max-dim <n>    Downsample oversized illustrations to max dimension (default: 2048)
 *   --effort <1-6>   WebP compression effort (default: 6 - maximum compression)
 *
 * Examples:
 *   node scripts/optimize-images.cjs
 *   node scripts/optimize-images.cjs src/public/assets/planets
 *   node scripts/optimize-images.cjs --dry-run src/public/assets
 */

const fs = require('fs');
const path = require('path');

// Resolve Sharp from src/node_modules or workspace
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  try {
    sharp = require(path.resolve(__dirname, '../src/node_modules/sharp'));
  } catch (err) {
    console.error('Error: "sharp" is required. Please run "npm install sharp" in src/');
    process.exit(1);
  }
}

// Parse CLI Arguments
const args = process.argv.slice(2);
let targetPath = path.resolve(__dirname, '../src/public/assets');
let replaceOriginal = false;
let dryRun = false;
let maxDimension = 2048;
let compressionEffort = 6;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--replace') {
    replaceOriginal = true;
  } else if (arg === '--dry-run') {
    dryRun = true;
  } else if (arg === '--max-dim' && args[i + 1]) {
    maxDimension = parseInt(args[++i], 10);
  } else if (arg === '--effort' && args[i + 1]) {
    compressionEffort = parseInt(args[++i], 10);
  } else if (!arg.startsWith('--')) {
    targetPath = path.resolve(process.cwd(), arg);
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function collectFiles(dirPath) {
  let results = [];
  const list = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(collectFiles(fullPath));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function optimizeFile(filePath) {
  const origStats = fs.statSync(filePath);
  const origSize = origStats.size;
  const ext = path.extname(filePath).toLowerCase();

  let image = sharp(filePath);
  const metadata = await image.metadata();

  const hasAlpha = metadata.hasAlpha || metadata.channels === 4;
  const origWidth = metadata.width || 0;
  const origHeight = metadata.height || 0;

  // Determine optimal candidate strategy
  let candidates = [];

  // Downsample if drastically oversized (e.g., > 2048px on illustrations)
  let needsDownsample = false;
  let targetWidth = origWidth;
  let targetHeight = origHeight;

  if (Math.max(origWidth, origHeight) > maxDimension && !hasAlpha) {
    needsDownsample = true;
    if (origWidth >= origHeight) {
      targetWidth = maxDimension;
      targetHeight = Math.round((origHeight * maxDimension) / origWidth);
    } else {
      targetHeight = maxDimension;
      targetWidth = Math.round((origWidth * maxDimension) / origHeight);
    }
  }

  if (hasAlpha) {
    // Transparent cutouts (3D islands, mascots, badges):
    // Use Near-Lossless WebP (Q92-95) to strictly avoid halo/fringing at alpha borders
    candidates.push({
      name: 'near-lossless-q95',
      fn: async () => sharp(filePath).webp({ nearLossless: true, quality: 95, effort: compressionEffort }).toBuffer(),
    });
    candidates.push({
      name: 'near-lossless-q90',
      fn: async () => sharp(filePath).webp({ nearLossless: true, quality: 90, effort: compressionEffort }).toBuffer(),
    });
    candidates.push({
      name: 'lossless',
      fn: async () => sharp(filePath).webp({ lossless: true, effort: compressionEffort }).toBuffer(),
    });
  } else {
    // Opaque images (illustrations, backgrounds, photos):
    // Standard high-efficiency lossy WebP
    if (needsDownsample) {
      candidates.push({
        name: `lanczos-${maxDimension}-q85`,
        fn: async () =>
          sharp(filePath)
            .resize(targetWidth, targetHeight, { kernel: sharp.kernel.lanczos3 })
            .webp({ quality: 85, effort: compressionEffort })
            .toBuffer(),
      });
      candidates.push({
        name: `lanczos-${maxDimension}-q80`,
        fn: async () =>
          sharp(filePath)
            .resize(targetWidth, targetHeight, { kernel: sharp.kernel.lanczos3 })
            .webp({ quality: 80, effort: compressionEffort })
            .toBuffer(),
      });
    } else {
      candidates.push({
        name: 'lossy-q85',
        fn: async () => sharp(filePath).webp({ quality: 85, effort: compressionEffort }).toBuffer(),
      });
      candidates.push({
        name: 'lossy-q80',
        fn: async () => sharp(filePath).webp({ quality: 80, effort: compressionEffort }).toBuffer(),
      });
      candidates.push({
        name: 'lossless',
        fn: async () => sharp(filePath).webp({ lossless: true, effort: compressionEffort }).toBuffer(),
      });
    }
  }

  let bestBuffer = null;
  let bestSize = origSize;
  let bestStrategy = 'kept_original';

  for (const cand of candidates) {
    try {
      const buf = await cand.fn();
      if (buf.length < bestSize) {
        bestSize = buf.length;
        bestBuffer = buf;
        bestStrategy = cand.name;
      }
    } catch (e) {
      // Ignore individual candidate encoding errors
    }
  }

  const savedBytes = origSize - bestSize;
  const percentSaved = origSize > 0 ? ((savedBytes / origSize) * 100).toFixed(1) : '0.0';

  const outPath = ext === '.webp' ? filePath : filePath.replace(new RegExp(`\\${ext}$`, 'i'), '.webp');

  if (bestBuffer && savedBytes > 0) {
    if (!dryRun) {
      fs.writeFileSync(outPath, bestBuffer);
      if (replaceOriginal && ext !== '.webp' && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    return {
      filePath,
      outPath,
      origSize,
      newSize: bestSize,
      savedBytes,
      percentSaved,
      strategy: bestStrategy,
      action: 'optimized',
    };
  } else {
    return {
      filePath,
      outPath: filePath,
      origSize,
      newSize: origSize,
      savedBytes: 0,
      percentSaved: '0.0',
      strategy: 'already_optimal',
      action: 'skipped',
    };
  }
}

async function main() {
  console.log('='.repeat(70));
  console.log('🖼️  LuyenThiAo Image Optimization Engine');
  console.log(`Target: ${targetPath}`);
  console.log(`Mode:   ${dryRun ? 'DRY-RUN (no files will be written)' : 'LIVE OPTIMIZATION'}`);
  console.log(`Action: ${replaceOriginal ? 'Replace original' : 'Create .webp alongside original'}`);
  console.log('='.repeat(70));

  let filesToProcess = [];
  if (fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      filesToProcess = collectFiles(targetPath);
    } else if (stat.isFile()) {
      filesToProcess = [targetPath];
    }
  } else {
    console.error(`Target path does not exist: ${targetPath}`);
    process.exit(1);
  }

  console.log(`Found ${filesToProcess.length} candidate image(s) to analyze.\n`);

  let totalOrigBytes = 0;
  let totalNewBytes = 0;
  let optimizedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < filesToProcess.length; i++) {
    const file = filesToProcess[i];
    const rel = path.relative(process.cwd(), file);
    try {
      const res = await optimizeFile(file);
      totalOrigBytes += res.origSize;
      totalNewBytes += res.newSize;

      if (res.action === 'optimized') {
        optimizedCount++;
        console.log(
          `[${i + 1}/${filesToProcess.length}] ✅ ${rel} | ${formatBytes(res.origSize)} -> ${formatBytes(res.newSize)} (-${res.percentSaved}%) [${res.strategy}]`
        );
      } else {
        skippedCount++;
        console.log(
          `[${i + 1}/${filesToProcess.length}] ⏭️  ${rel} | ${formatBytes(res.origSize)} [already optimal]`
        );
      }
    } catch (err) {
      console.error(`[${i + 1}/${filesToProcess.length}] ❌ Error processing ${rel}:`, err.message);
    }
  }

  const totalSavedBytes = totalOrigBytes - totalNewBytes;
  const totalPercent = totalOrigBytes > 0 ? ((totalSavedBytes / totalOrigBytes) * 100).toFixed(1) : '0.0';

  console.log('\n' + '='.repeat(70));
  console.log('📊 OPTIMIZATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`Total images analyzed:  ${filesToProcess.length}`);
  console.log(`Images optimized:        ${optimizedCount}`);
  console.log(`Images already optimal:  ${skippedCount}`);
  console.log(`Original total size:     ${formatBytes(totalOrigBytes)}`);
  console.log(`Optimized total size:    ${formatBytes(totalNewBytes)}`);
  console.log(`Bandwidth saved:         ${formatBytes(totalSavedBytes)} (-${totalPercent}%)`);
  console.log('='.repeat(70));
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
