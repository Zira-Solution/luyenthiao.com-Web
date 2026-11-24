# Art Style Lock: Flyer Learning Garden

- **Date:** 2026-11-21
- **Status:** Locked Standard
- **Scope:** Login Page (`/login`), `LearningGardenScene`, `AuthPageShell`, and related miniature floating worlds.
- **Reference Benchmarks:** Flyer Homepage Floating Worlds (`planet_ioe.png`, `planet_movers.png`, `planet_flyers.png`, `PlanetDiorama`).

---

## 1. Core Vision & Pillars

### Primary Style
**Premium Stylized 3D Fantasy Diorama**
A tactile, crafted miniature chunk of a living magical universe suspended in space, rendered with isometric/perspective depth, rich micro-detail, and physical plausibility.

### Secondary Influences
- **Whimsical Miniature World Design:** (e.g. Nintendo's *Captain Toad: Treasure Tracker*, *Super Mario Odyssey*, *Monument Valley*).
- **Polished Children's Educational Game Art:** Inviting, cheerful, readable, engaging, and inspiring curiosity without being childish or disposable.
- **Soft Storybook Fantasy:** Warm, magical, nostalgic wonder with painterly fairy elements and gentle morning light.

### Visual Benchmark
The existing Flyer homepage's floating worlds:
- **Starters (Knowledge Arena / `planet_ioe.png`):** Layered rock cliff strata beneath lush tufted grass, ancient stone clock tower/archway, crystal accents, open storybook resting naturally on the terrain.
- **Movers (`planet_movers.png`):** Natural terrain with sandy shoreline, wooden pirate pier, cascading water flowing off cliff edges, detailed palm foliage.
- **Flyers (`planet_flyers.png`):** Elaborate floating sky citadel, architectural battlements, floating magical rings, natural depth perspective.

### Target Outcome
A richly detailed, colorful, magical miniature world with:
- Soft organic geometry with natural irregularities and hand-crafted structural feel.
- Sophisticated lighting with coherent light direction and ambient occlusion.
- Carefully designed materials (tactile stone, wood grain, foliage tufts, paper pages, earthen rock strata).
- Intentional environmental storytelling (every prop, tree, path, and book looks purposeful and inhabited, not randomly scattered).

---

## 2. Crucial Distinction: Diorama vs. Puffy Claymorphism

> [!IMPORTANT]
> **Soft rounded 3D materials are welcome, but the scene must NEVER degrade into an exaggerated puffy claymorphism environment.**

| Feature | Premium Stylized 3D Fantasy Diorama (Locked Standard) | Puffy Claymorphism (Prohibited) |
| :--- | :--- | :--- |
| **Geometry** | Layered, varied, faceted rock strata, organic uneven terrain, crisp micro-edges | Uniformly inflated, swollen, bulbous shapes without structural variation |
| **Material Finish** | Matte to subtle satin tactile textures (stone, moss, wood, paper, grass) | Uniform glossy or rubbery plastic, play-doh, or marshmallow dough appearance |
| **Edge Definition** | Intentional bevels, natural terrain crumbling, crisp contact points | Uniformly round, sausage-like, or pillowy edges everywhere |
| **Lighting** | Coherent directional sunlight, subtle ambient occlusion in crevices, realistic contact drop shadows | Floating blobs with blurred generic dropshadows or blown-out artificial glow |
| **World Feel** | A real, believable miniature diorama children want to reach into and play | A trendy, disposable dribbble clay graphic or generic AI prompt output |

---

## 3. Explicit Prohibitions ("AVOID" List)

1. **Puffy foam cloud walls:** No enclosed marshmallow foam borders or puffy foam pillows blocking the sky.
2. **Bubble-like cloud clusters:** No soap-bubble or cluster-balloon cloud formations.
3. **Inflated plastic-looking scenery:** No shiny, inflated vinyl or rubberized terrain/props.
4. **Generic AI pastel gradients:** No washed-out, milky pink-purple gradient soups lacking contrast or structure.
5. **Flat vector illustrations:** No flat 2D vector clip art pasted onto 3D scenes.
6. **Excessive bloom and artificial glow:** No radioactive neon halos, blown-out white glares, or muddy lens flare haze.
7. **Oversized decorative objects:** No gigantic out-of-scale mushrooms or lollipop props that overwhelm the island or mascot.
8. **Uniformly rounded shapes without variation:** Avoid geometric monotony where every object has the exact same radius and roundness.
9. **Unrelated asset collage:** No mismatched clipart, random 3D stock models from different render engines, or disconnected cutouts that do not share lighting, perspective, and ground contact.

---

## 4. Environmental Asset & Scene Rules

### Clouds
- **Function:** Clouds must **frame the world, not enclose it**. The sky behind must remain visible, expansive, and breathable.
- **Form:** Naturally layered stylized 3D clouds with varied, painterly silhouettes.
- **Shading:** Soft, directional shading matching the scene's key light, with gentle atmospheric perspective (warmer rims facing the sun, soft lavender/blue tints on the shaded undersides).

### Island
- **Composition:** Self-contained miniature floating island with visible depth underneath (craggy underside with rock strata, roots, and hanging vines).
- **Terrain:** Layered terrain with tiered levels, gentle mounds, natural dirt paths, and dense grass blades rather than a smooth green dome.
- **Props & Foliage:** Scaled trees with distinct foliage clusters, small wildflowers, authentic book stacks with realistic bindings and pages, and stone pathways.

### Lighting & Shadow
- **Global Illumination:** Soft, warm morning key light from top-left/top-center, creating golden highlights on grass tops and rooftops.
- **Ambient Occlusion (AO):** Tight, dark ambient occlusion in contact crevices (where the lion sits on grass, where books rest on terrain, where tree roots meet the soil).
- **Contact Shadows:** Clear, believable contact shadows anchoring every object to the ground so nothing appears to float detached unless it is explicitly an airborne fairy/creature.
- **Coherence:** All scene elements, mascot cutouts, and environmental layers must share the exact same sun angle and shadow direction.

### Color Palette
- **Inspiration:** The Flyer homepage palette.
  - Sky: Soft morning azure (`#bae6fd`), warm apricot cream (`#fef3c7`), gentle morning mint (`#dcfce7`).
  - Grass & Foliage: Vibrant emerald green (`#10b981`), warm lime (`#84cc16`), rich forest base (`#047857`).
  - Earth & Stone: Warm weathered slate, rich terracotta/umber under-crags.
  - Accents: Honey amber (`#f59e0b`), royal purple wordmark extrusion (`#7c3aed`), crisp white highlights.

---

## 5. Final Unifying Principle

> **The Login page must feel like another playable world within the Flyer homepage, not a separate clay-art illustration or generic AI fantasy landing page.**

Navigating between the homepage carousel (`/`) and the Login portal (`/login`) must feel like smooth spatial transit within the same game universe:
- The same scale and camera perspective.
- The same physics (gentle floating diorama levitation, drifting golden fairy pollen).
- The same mascot presence and tactile affordance.
