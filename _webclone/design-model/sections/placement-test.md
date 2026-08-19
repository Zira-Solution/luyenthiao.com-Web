# Section Spec — placement-test: Placement Test Page

- **Route(s):** `/placement-test`
- **Screenshots:** N/A (Custom gamified extension)
- **Chunk owns:** `src/app/(dashboard)/placement-test/page.tsx`

## Layout intent

```
Page Container (flex col, max-w-7xl mx-auto, p-4 md:p-8, pb-28)
├─ Page Header (Back button, Title: "KIỂM TRA TRÌNH ĐỘ")
├─ Test Selection Grid (3D cards for Starters, Movers, Flyers, TOEFL)
│  └─ Selecting a test shows the Test Lobby modal
└─ Active Test Interface (If test is active)
   ├─ Header (Timer, Progress Bar)
   ├─ Question Container (Image/Text prompt, options)
   └─ Result Modal (Score, badge award, save history option)
```

## Component mapping

| Piece | Uses | Note |
|---|---|---|
| Level Cards | 3D Game Cards | Interactive hover state and mascot badges |
| Quiz Engine | React State Quiz | Handles 3 interactive questions, timer, answers validation |
| Result Card | Glassmorphic 3D Card | Trophy icon, final score, and CTA |

## State, validation, interactions

- **Client UI state:** Active state (`select-test` | `quiz` | `result`), current question index, selected answers, score.
- **Interactions:** Level select, answer selections, submit quiz, return to dashboard.
