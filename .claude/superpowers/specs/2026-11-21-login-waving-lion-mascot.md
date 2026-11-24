# Specification: Replace Login Mascot with Seated Waving Lion

## 1. Context & Motivation
The user wants to replace the current seated mascot reading an open storybook on the login page (`/login`) with the newly provided baby lion mascot character:
- 3D stylized baby lion with fluffy orange mane and brown leather shoulder satchel.
- Pose: Sitting cheerfully on the ground, raising one paw to wave a friendly "hello" to the user.
- Expression: Joyful open-mouth smile, large glossy eyes, rosy cheeks.
- Synergy with UI: This waving pose aligns naturally with the welcoming speech bubble ("Xin chào bạn nhỏ! Cùng tớ khám phá các hành tinh luyện thi tiếng Anh kỳ thú nhé!").

## 2. Asset Preparation & Pipeline
1. **Source Image**: `media_1795226285660_e8d84c85.jpg` (RGB, 1024x571).
2. **Cutout Processing**:
   - Alpha channel mask generated with AI background removal (`rembg`).
   - Defringed and tightly cropped to bounding box `(436, 498)`.
   - Saved with lossless PNG compression to `src/public/clone-assets/mascot/mascot_waving_lion.png`.
3. **Aspect Ratio & Sizing**:
   - Original reading lion: aspect ratio `455/531` (~0.857), width `35.5%`.
   - Waving lion: aspect ratio `436/498` (~0.875), width `35.5%`.
   - Position coordinates on floating island:
     - `top: 17%` -> `top: 18%`
     - `left: 28%` -> `left: 29%`
     - Contact shadow: centered below the lion's sitting base (`top: 64%`, `left: 46%`, `width: 28%`).

## 3. Scope of Changes
1. **Visual Asset**:
   - Ensure `src/public/clone-assets/mascot/mascot_waving_lion.png` is populated with the high-resolution, defringed PNG cutout.
2. **Component Integration**:
   - `src/components/auth/auth-brand-showcase.tsx`:
     - Update image source from `mascot_reading_lion.png` to `mascot_waving_lion.png`.
     - Update alt text to `Linh vật Sư tử vẫy tay chào`.
     - Adjust container aspect ratio to `[436/498]` and fine-tune placement coordinates for natural grounding on the grassy meadow.
3. **Mascot Constants** (optional reference):
   - Check `src/constants/mascot.ts` to ensure clean naming consistency if needed.

## 4. Non-Functional & Verification Requirements
- Zero TypeScript compile errors (`npx tsc --noEmit`).
- Zero ESLint regressions (`npm run lint`).
- Existing tests continue to pass (`npm test`).
- Responsive visual verification across breakpoints:
  - Desktop (1920x1080, 1440x900)
  - Tablet (1024x768, 768x1024)
  - Mobile (390x844, 320x568)
