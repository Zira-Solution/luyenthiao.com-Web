# Specification: Adjust Mascot Depth Perspective Farther Back on Island

## 1. Context & Goals
The user requested repositioning the lion mascot so it appears to sit physically farther back on the island's grassy meadow, closer to the tree and farther from the front cliff rim:
- Push the lion backward into depth by ~8–12% of the island's visible depth.
- In perspective projection, moving backward elevates screen position (higher Y on screen, lower CSS `top` coordinate).
- Reduce scale by ~3–5% (`w-[34%]` down from `w-[35.5%]`) to naturally reinforce distance and foreshortening.
- Adjust horizontal placement slightly toward the tree trunk (`left: 28%` down from `29%`).
- Ensure the lion's bottom and both paws rest snugly on the grassy plane.
- Add an integrated soft contact shadow directly underneath its body and paws, perfectly aligned with the grass plane without any detached floating gap.
- Maintain the book stack compact (`w-[14%]`), aligned to the new contact plane (`top: 47%`, `left: 22.5%`), still covering the tail in front (`z-10`).

## 2. Geometric Coordinates & Proportions
- Parent island container: `aspect-[875/734]`
- Lion Mascot:
  - Width: `w-[34%]` (was `35.5%`, ~4.2% reduction for depth)
  - Aspect ratio: `aspect-[436/498]`
  - Position: `top-[13.8%]` `left-[28%]`
  - Contact plane (bottom): `13.8% + 34% * (498/436) * (875/734) = 13.8% + 46.3% = 60.1%` (was 63.8%, shifted back by ~3.7% of island height / ~11.5% of visible grass depth).
- Soft Contact Shadow:
  - Snug ellipse positioned at `top-[59.2%] left-[45%] h-[2%] w-[26%] -translate-x-1/2`
  - Subtle dark green occlusion (`bg-[#0c2405]/35 blur-[2px] sm:blur-[3px]`) touching the paws without gap.
- Book Stack:
  - Width: `w-[14%]`
  - Position: `top-[47.2%] left-[22.5%] z-10`
  - Contact plane (bottom): `47.2% + 14% * (369/476) * (875/734) = 47.2% + 12.9% = 60.1%`.

## 3. Verification Criteria
- Perspective reads naturally: mascot sits solidly on the grass farther back near the tree.
- Paws and bottom seamlessly contact the grass with soft occlusion.
- Tailwind classes responsive on desktop; hidden on mobile.
- `npx tsc --noEmit` and `npm test` pass.
