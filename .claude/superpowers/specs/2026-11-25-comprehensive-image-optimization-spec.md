# Comprehensive Image Optimization Specification

- **Date:** 2026-11-25
- **Author:** Senior Frontend Performance Engineer & Image Optimization Specialist
- **Scope:** All static image assets under `src/public/` (planets, mascot, backgrounds, exam media, UI icons, media library)
- **Status:** In Progress / Approved for Execution

---

## 1. Problem Statement & Audit Findings

The project currently contains **291 static image assets** in `src/public/` with a total uncompressed size of **50.03 MB** (52,462,973 bytes).

### Category Breakdown
1. **3D Planets & Floating Islands** (`public/assets/planets/` & `public/clone-assets/media/`):
   - 10 main planets plus sub-assets, totaling over **12 MB**.
   - Examples: `planet_time_oasis.png` (2,804 KB, 1254x1254 RGBA), `planet_candy_wonderland.png` (1,666 KB, 1254x1254 RGBA), `planet_toefl_primary.png` (1,313 KB), `planet_ioe.png` (1,278 KB).
   - Rendered with transparency, complex lighting, soft glows, and shadows.
2. **Oversized Exam Media** (`public/clone-assets/exam-media/`):
   - Extreme resolutions: `read3_bus.webp` (7973x7973, 2,576 KB), `read1_a_bowl.webp` (8333x8333, 2,167 KB), `read3_book.webp` (7973x6378, 2,011 KB).
   - Rendered in quiz containers with max CSS widths of 600px - 800px. An 8K image provides zero perceptual benefit while severely degrading mobile memory, decoding time, and network bandwidth.
3. **Mascots & Characters** (`public/clone-assets/mascot/`):
   - 19 high-resolution 3D lion renders with transparent background, soft mane alpha gradients, and drop shadows (~3.93 MB).
4. **Panoramic Backgrounds** (`public/clone-assets/bg.1e17df80.png`, `public/clone-assets/media/login_panoramic_*.png`):
   - Large PNG files up to 2.65 MB each for 1080p backgrounds.
5. **UI & Exam Graphics** (`public/clone-assets/exam/`, `public/clone-assets/speaking/`, `public/clone-assets/writing/`):
   - Hundreds of PNG buttons, badges, frames, and icons that can be converted to optimal WebP or losslessly compressed.

---

## 2. Optimization Goals & Non-Negotiable Constraints

1. **Strict Visual Fidelity (Perceptually Lossless):**
   - No visible blur, edge ringing, or loss of fine 3D detail.
   - Zero color shifts (RGB delta within imperceptible threshold).
   - No color banding on sky backgrounds and gradients.
   - **No dark/white halos** around alpha transparent borders on light, dark, or website background.
   - Preserve exact alpha channel semi-transparency and drop shadows.
2. **Multi-Variant Candidate Generation:**
   - For every image, generate multiple compression candidates:
     - Candidate A: Lossless WebP (`lossless: true`, `effort: 6`)
     - Candidate B: Near-lossless WebP (`nearLossless: true`, `quality: 85-95`, `effort: 6`)
     - Candidate C: High-fidelity Lossy WebP with alpha preservation (`quality: 80-92`, `alphaQuality: 100`, `effort: 6`)
     - Candidate D: Optimized PNG (via oxipng/sharp png) as fallback if WebP provides no gain or causes visual artifact.
3. **Automated Quality Gate:**
   - Composite transparent images onto 3 test backgrounds: `#ffffff` (white), `#0f172a` (dark blue/slate), and `#1e1b4b` (universe background navy).
   - Compute **SSIM** (Structural Similarity Index) >= 0.985 (or >= 0.99 for 3D islands).
   - Compute **PSNR** >= 40 dB.
   - Check max delta E / border alpha difference to ensure zero halo effect.
   - Only accept candidate if quality gates pass and file size decreases.
4. **Resolution Normalization:**
   - For grossly oversized illustrations (> 3000px intended for standard web containers), downsample with high-quality Lanczos3 kernel to 2x retina display max resolution (e.g., 2048px or 2560px), preserving extreme clarity while cutting 70-90% of useless byte overhead.
5. **Codebase Integration:**
   - Update all references in `src/schemas/__fixtures__/planets.json`, components, mocks, and CSS.
   - Backup original files to `.backup-images/` (git-ignored, strictly outside production bundle).
   - Ensure all build checks (`tsc`, `lint`, `vitest`, `next build`) pass with 0 errors.

---

## 3. Tooling & Pipeline Architecture

- Engine: Node.js with native `sharp` (v0.35.5, libvips 8.18.7, libwebp 1.6.0) for multi-threaded candidate compression.
- Quality Verifier: Python 3.12 with `scikit-image` (SSIM), `OpenCV`, `Pillow`, and `numpy`.
- Automation Runner: Orchestrated python/node script that benchmarks before/after, performs rollback if needed, and produces a comprehensive report.
