# Section Spec — testlevels: Test Level Selection Map

- **Route(s):** `/testlevels/[level]` (e.g. `/testlevels/movers`)
- **Screenshots:** `_webclone/captures/testlevels-movers/desktop-viewport-top.png`, `desktop.png`
- **Chunk owns:** `src/app/testlevels/[level]/page.tsx`, `src/components/testlevels/level-map.tsx`

## Layout intent

```
Page (relative, min-h-screen, bg map image full-bleed)
├─ Background: bg-map.73c46437.jpg (cover, fixed)
├─ Header (absolute top, z-10)
│  ├─ "TRỞ VỀ" button (left, back arrow, 3D game button)
│  ├─ MOVERS title (center, bg-title.de447cb5.png ribbon)
│  └─ "NGẪU NHIÊN" button (right, dice icon, bg-random.66cd8920.png)
├─ "VIDEO BÀI THI NÓI" banner (bg-speaking-video-btn.80759ee2.png, below header)
└─ Game Map (relative, w-full)
   ├─ Checkpoint nodes (absolute positioned by %: w-[11.7%])
   │  ├─ Unlocked: bg-checkpoint.95231678.png circle + bg-checkpoint-title.f554fd72.png label
   │  └─ Locked: bg-checkpoint-disabled.49d83d62.png + bg-locked.451398ce.png + disabled title
   └─ Connecting path (S-curve implied by node positions)
```

## Node layout (SOURCE from captured HTML)

| Node | top% | left% | state |
|---|---|---|---|
| 1 | 8.2 | 31.8 | unlocked |
| 2 | 25.0 | 38.8 | unlocked |
| 3 | 47.4 | 47.7 | unlocked |
| 4+ | zigzag continuing down | locked |

- Node width ~11.7% of container.
- Unlocked = 3 nodes (account's progress); rest locked.

## Component mapping

| Piece | Uses | Note |
|---|---|---|
| Back button | `Link` → `/` | Arrow + "TRỞ VỀ" |
| Map nodes | custom `CheckpointNode` | Absolute % positioning; img assets |
| Title ribbon | `Image` | bg-title asset |

## Mock data

- `_webclone/design-model/mocks/testlevels.json`: `{ level, total, unlockedCount }` per level.

## Acceptance criteria

- [ ] Map renders with background image
- [ ] 3 unlocked + N locked nodes follow S-curve
- [ ] Clicking unlocked node → `/check-point/[id]`
- [ ] Responsive (mobile uses bg-back-m + bg-random-m)
