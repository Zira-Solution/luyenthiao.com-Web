# Blueprint: Learning Garden Login Page Composition & Art Direction (Phase 1 — Revision 2)

- **Date:** 2026-11-21
- **Status:** Phase 1 Approved with Final Corrections Applied
- **Target Resolution:** Desktop 1920×1080 baseline with fluid responsive scaling down to mobile
- **Visual Preview Artifact:** `scratch/composition_preview_phase1.png`
- **Public Asset Directory Verified:** `src/public/` (accessible in web browser as root `/`)

---

## 1. Corrections Applied (Phase 1 Final Review)

1. **Mascot Scale (+18%):**
   - Scaled up the lion mascot relative visual size by ~18% (within the 15-20% target).
   - The lion is established as the primary hero character, commanding clear focal attention without being visually diminished by the tree.
   - Positioned seated slightly back on the grass, body and paws naturally grounded on turf.
2. **Asymmetric Organic Island Silhouette:**
   - Replaced flat/oval tray appearance with an asymmetric organic contour: dimensional undulating grass lobes, multi-tiered mounds, embedded rounded rocks, and craggy faceted rock strata beneath with varying hanging vines.
3. **Yellow Aura Removed:**
   - Completely eliminated the large yellow oval/circular halo behind the island.
   - Depth and separation are achieved purely through illustrated sky atmosphere, directional lighting, and natural depth of field.
4. **Left Composition Cohesion:**
   - Reduced dead space between the bottom of the island rock strata, the "LUYỆN THI ẢO" 3D extruded title, the adventure subtitle badge, and the informational badges.
   - The entire left stage functions as one tightly integrated floating game diorama.
5. **Speech Bubble Optimization:**
   - Shifted closer to the lion mascot, with the pointer tail aiming directly down-left toward the lion's head.
   - Zero collision or visual competition with tree foliage.
6. **Preserved Original Login Panel:**
   - 100% unchanged layout, 420px card width, rounded 28px card, input fields, 3D GameButton CTA, Google button, forgot password and register links.
   - Heading text color updated to `#6534B5` (Harmonious Royal Purple).
7. **Environment Restrictions:**
   - Strictly NO rivers, waterfalls, streams, ponds, wooden houses, cloud walls, or cloud ceilings.
8. **Art Style Standard:**
   - Premium Stylized 3D Fantasy Diorama, adhering to Flyer homepage visual fidelity (`planet_ioe.png`, `planet_movers.png`, `planet_flyers.png`).

---

## 2. Spatial Hierarchy & Relative Coordinate System (1920×1080)

- **Split Ratio:** Left ~56% (0 to 1075px) / Right ~44% (1075 to 1920px).
- **Left Stage Center:** `cx = 530px, cy = 475px`.
- **Island Underside:** Asymmetric craggy rock strata (`x: 205px .. 855px`, `y: 495px .. 710px`).
- **Island Meadow:** Layered green terrain with rounded perimeter rocks (`x: 195px .. 865px`, `y: 385px .. 525px`).
- **Magical Tree:** Left-rear (`x: 230px .. 450px`, `y: 170px .. 490px`).
- **Hero Lion Mascot:** Center-right (`x: 520px .. 730px`, `y: 350px .. 585px`), hero scale `190×230px`.
- **Pastel Book Stack:** Left-front of mascot (`x: 450px .. 515px`, `y: 470px .. 535px`).
- **Speech Bubble:** Above lion (`x: 650px .. 920px`, `y: 215px .. 291px`), tail to lion's head.
- **Title & Badges Stack:** Snug under rock crag (`y: 723px .. 850px`).
- **Right Login Card:** Centered in right column (`x: 1287px .. 1707px`, `y: 250px .. 830px`, width 420px).

---

## 3. Transition to Phase 2 (Background Artwork ONLY)

- Scope: Illustrated sky environment ONLY.
- Island, lion, books, contact shadow, and UI components remain completely untouched during Phase 2.
- Verified background production asset: `src/public/assets/learning-garden/background/sky_daytime_illustrated.webp` (2560×1440 WebP, 200 KB).
