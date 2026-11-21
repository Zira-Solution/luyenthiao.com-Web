# Specification: Re-render High-Definition Sky Background (WebP) for Login Page

## 1. Context & Motivation
The existing login background (`login_sky_sunrise.jpg`) was a low-resolution JPEG (1024x571, 92.8 KB) that suffered from compression banding, artifacting, and noticeable blurriness when stretched across modern high-DPI full-screen viewports (1920x1080, 1440x900, 2K/4K).
The user requested:
- Re-draw / re-render the background preserving all artistic elements and color palette (sunrise glow, pastel clouds, floating castles, serene morning blue).
- Razor-sharp, high-definition visual fidelity.
- Lightweight file size using modern WebP format for optimal performance and fast load times.

## 2. Image Asset Details
1. **Recreated Artwork**:
   - Resolution: 1920 x 1080 (16:9 full HD).
   - Format: WebP (Lossy with high perceptual quality index 88, method 6 effort).
   - File Size: ~80 KB (Smaller than the original 92.8 KB JPEG while offering 4x more pixel density and zero artifacts).
2. **Asset Path**:
   - `src/public/clone-assets/media/login_sky_sunrise.webp`

## 3. Component Updates
- `src/components/auth/auth-page-shell.tsx`:
  - Update background image source from `/clone-assets/media/login_sky_sunrise.jpg` to `/clone-assets/media/login_sky_sunrise.webp`.
  - Maintain `fill`, `priority`, and `sizes="100vw"` for immediate LCP rendering.

## 4. Verification Requirements
- `npx tsc --noEmit` passes with 0 errors.
- Vitest passes: `npm test -- components/auth/login-form.test.tsx`.
- Visual comparison against original to verify color harmony and clarity.
