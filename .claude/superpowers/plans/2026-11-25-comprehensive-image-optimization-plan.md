# Comprehensive Image Optimization Execution Plan

- **Date:** 2026-11-25
- **Spec:** `../specs/2026-11-25-comprehensive-image-optimization-spec.md`
- **Goal:** Optimize all project image assets to achieve 40% - 70% size reduction with zero perceptible visual loss.

---

## Phases & Tasks

### Phase 1: Pre-Optimization Baseline & Backup
- [x] Run image audit across `src/public/` (291 images, 50.03 MB).
- [x] Run baseline verification (`tsc`, `vitest`, `next build`).
- [ ] Create a complete, immutable backup of `src/public/` in `.backup-images/` (safely outside `src/` to prevent bloating production builds).

### Phase 2: Design & Build the Multi-Candidate Optimizer & Quality Verifier
- [ ] Implement `scratch/optimize_engine.mjs` using `sharp`:
  - For each image, generate candidates:
    - Candidate 1: Lossless WebP (`effort: 6`)
    - Candidate 2: Near-lossless WebP (`nearLossless: true`, `quality: 90`, `effort: 6`)
    - Candidate 3: High-Q Lossy WebP (`quality: 88`, `alphaQuality: 100`, `effort: 6`)
    - Candidate 4: Moderate-High-Q Lossy WebP (`quality: 82`, `alphaQuality: 100`, `effort: 6`)
    - Candidate 5: Optimized PNG (`compressionLevel: 9`, `adaptiveFiltering: true`)
    - For oversized images (> 2560px), generate Lanczos-downsampled versions at 2560px / 2048px.
- [ ] Implement perceptual quality evaluator (`scratch/verify_quality.py`):
  - Multi-background compositing (white, slate dark `#0f172a`, navy `#1e1b4b`).
  - SSIM >= 0.985, PSNR >= 40 dB.
  - Transparent border halo check (delta E < 2.0).
  - Automatically discard any candidate failing the quality threshold.
  - Pick candidate with minimum bytes among passing candidates.

### Phase 3: Batch Optimization & Asset Replacement
- [ ] Run candidate generation and quality evaluation on all categories:
  1. `public/assets/planets/` (3D islands)
  2. `public/clone-assets/media/` (planets, backgrounds)
  3. `public/clone-assets/mascot/` (3D lions)
  4. `public/clone-assets/exam-media/` (exam illustrations, resizing 8K to 2560px)
  5. `public/clone-assets/exam/`, `speaking/`, `writing/`, `topbar/`, `homepage/`
- [ ] Deploy optimal files into `src/public/`.
- [ ] Where extensions change (`.png` -> `.webp`), keep a mapping table.

### Phase 4: Codebase Reference Updates & Loading Optimization
- [ ] Update references in:
  - `src/schemas/__fixtures__/planets.json`
  - Components rendering planets, backgrounds, mascots (`app/(dashboard)/page.tsx`, `components/auth/login-form.tsx`, etc.)
  - CSS / style files if background images are referenced.
  - `src/mocks/` if any exam mocks reference old file paths.
- [ ] Verify image loading attributes:
  - Critical above-the-fold assets (first planet, hero mascot, login background) use `priority` / eager loading.
  - Below-the-fold / carousel / quiz assets use standard lazy loading.

### Phase 5: Verification & Testing
- [ ] Run `npx tsc --noEmit` (0 errors).
- [ ] Run `npm test` (all 43 test files / 306 tests pass).
- [ ] Run `npm run build` (Next.js build succeeds with static pages generated).
- [ ] Run visual screenshot inspection via browser automation or canvas inspection.

### Phase 6: Performance Report & Reusable Automation Script
- [ ] Generate detailed before-and-after table:
  - Original size vs optimized size.
  - MB saved & percentage reduction.
  - SSIM / quality scores for key assets.
- [ ] Provide rollback instructions and reusable CLI script for future assets.
