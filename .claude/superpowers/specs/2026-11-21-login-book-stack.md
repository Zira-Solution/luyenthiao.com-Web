# Specification: Position Compact Book Stack to Cover Mascot Tail

## 1. Context & Motivation
The user requested:
- Move the 3D book stack snugly right next to the lion ("xịch sát vào con sư tử").
- Layer the book stack in front so it covers the tail of the mascot ("che mấy cái đuôi của nó luôn").
- Make the book stack compact and small ("nhỏ gọn thôi").

## 2. Technical Solution
1. **Layer Order**:
   - In DOM order inside `AuthBrandShowcase`:
     Render the Lion mascot first (`z-0`), then render the Book stack second (`relative z-10`), ensuring the books sit in front of the lion and completely occlude the lion's tail.
2. **Compact Dimensions**:
   - Width reduced from `19.5%` to `15%` (approx 131px on 875px base container).
   - Aspect ratio: `aspect-[476/369]`.
3. **Snug Coordinates**:
   - `left: 23.5%` (snugly overlapping the lion's left boundary at `29%`, covering the tail from x:23.5% to x:38.5%).
   - `top: 50%` (grounding the bottom of the books at ~63.9%, perfectly aligned with the lion's seated base at ~63.8%).
4. **No Artificial Floating Shadow**:
   - Both lion and books rest directly on the grassy plane without detached shadow ovals.

## 3. Verification Criteria
- Tail is occluded by the book stack.
- The books sit firmly on the island grass beside the lion.
- TypeScript, lint, and vitest pass.
