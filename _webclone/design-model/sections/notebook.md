# Section Spec — notebook: Notebook Page

- **Route(s):** `/notebook`
- **Screenshots:** N/A (Custom gamified extension)
- **Chunk owns:** `src/app/(dashboard)/notebook/page.tsx`

## Layout intent

```
Page Container (flex col, max-w-7xl mx-auto, p-4 md:p-8, pb-28)
├─ Page Header (Back button, Title: "SỔ TAY TỪ VỰNG")
├─ Search and Filters Row (Vocabulary, Grammar, Saved Questions tabs)
└─ Cards Grid (bg-[#0a1a3a]/80 backdrop-blur rounded-[2rem] p-6 border-3 border-[#1e3a8a])
   └─ Vocabulary Card Grid
      ├─ Card Front (Word, phonetic, category, image/icon, click to flip)
      └─ Card Back (Vietnamese translation, example sentence)
```

## Component mapping

| Piece | Uses | Note |
|---|---|---|
| Tabs | Custom pill buttons | Active highlights |
| Cards | Interactive flipping animation cards | Pure CSS 3D flip card |

## State, validation, interactions

- **Client UI state:** Active Tab (Vocabulary | Grammar), Search Query, flipped cards state list.
- **Interactions:** Flip card toggle, search filtering.
