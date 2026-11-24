# Specification: Fix Grounding & Eliminate Floating Appearance for Mascot and Books

## 1. Root Cause Analysis
1. **Asset Inspection**:
   - Both `mascot_waving_lion.png` (436x498) and `login_book_stack.png` (476x369) were inspected across RGB and Alpha channels.
   - **Result**: Neither asset contains baked-in floor shadows or white fringes. Both have clean alpha cutoffs at the base.
2. **Defects in Previous Implementation**:
   - **Detached blurred ovals**: Previous attempts used generic rounded HTML `div`s with `blur-[2px..5px]`. Because the divs were generic ovals centered below the elements, they created a visible floating gap between the object's actual contact boundary and the shadow, creating the classic "levitating saucer" optical illusion.
   - **Footprint Mismatch**:
     - The bottom pink book has a perspective V-shaped footprint (left corner at y=417, center vertex at y=440, right corner at y=421.5). A horizontal oval shadow under y=440 left the left and right corners hovering in thin air.
     - The lion has discrete contact points: central sitting rump at (376, 441) and extended right paw pad at (486, 429). A single generic oval did not align with these points.
   - **Lack of Foreground Occlusion**: In 3D illustration and nature, soft grass blades slightly overlap the base of seated objects, anchoring them physically into the ground.

## 2. Solution Design
1. **Zero CSS Halos & No Floating Divs**:
   - Remove the separate blurred oval `div`s entirely.
2. **Precise Footprint Contact Shadow (SVG Layer in ViewBox `0 0 875 734`)**:
   - An SVG overlay layer sharing the exact `0 0 875 734` coordinate space of the island:
     - **Book Shadow**: A dark green ambient occlusion polygon following the exact V-profile of the book base `[ (202.5, 417) -> (269.5, 440) -> (317.9, 421.5) ]`, tight and narrow (2–4px vertical spread, fading quickly).
     - **Lion Shadow**: Direct contact creases under the sitting rump `cx=376, cy=441, rx=24, ry=5` and foot pad `cx=486, cy=429, rx=26, ry=4`, plus a soft connecting ambient bridge.
     - Darkest occlusion: `#061a03` with 65% opacity directly touching the pixels of the objects with 0px gap.
3. **Subtle Foreground Grass Blades (Ground Integration)**:
   - Small stylized grass blades drawn in SVG in front of the bottom edges of the book and lion paws (matching the island's grass colors: `#9ecf19`, `#b8e922`, `#7aa612`):
     - 3 blades gently overlapping the front V-apex of the book.
     - 3 blades gently overlapping the front edge of the lion's paws.
   - This provides indisputable visual anchoring: the objects are visibly *nested into* the soft grass meadow.
4. **100% Responsive & Synchronized**:
   - Because the SVG uses `viewBox="0 0 875 734"` and `w-full h-full absolute inset-0`, it scales mathematically with the island, lion, and books, and floats synchronously with the parent diorama animation.

## 3. Verification Criteria
- Zero visible air gap or floating effect.
- Contact shadow conforms precisely to the book's tilted V-edge and the lion's contact pads.
- Grass blades naturally overlap the bottom edges.
- No regression on mobile or desktop viewports.
- TypeScript, lint, and vitest pass.
