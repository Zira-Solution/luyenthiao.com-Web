# Sub-project B Implementation Plan

## Step 1: Schemas, Query Keys, API & Hooks
1. Create `src/schemas/vocab.ts` with `publicVocabWordSchema`, `publicVocabListSchema`, and `savedNotebookEntrySchema` + helpers to normalize nullables cleanly.
2. Extend `src/lib/query-keys.ts` with:
   - `publicVocabSearch: (params) => ['public', 'vocab', params]`
   - `publicSiteConfig: () => ['public', 'site-config']`
3. Update `src/lib/api/public.ts` with `searchPublicVocab` & `getPublicSiteConfig` (safely merging with `DEFAULT_SITE_CONFIG_CLIENT`), and update `src/lib/api/notebook.ts` with `saveNotebookEntry`.
4. Create `src/hooks/use-vocab.ts` (`useSearchVocab`) and extend `src/hooks/use-notebook.ts` with `useSaveNotebookEntry`, exporting via `src/hooks/index.ts`.

## Step 2: Public Route Access & Vocabulary Library + Notebook Integration
1. Add `ROUTES.VOCAB = '/vocab'` to `src/constants/index.ts`.
2. Add `'/vocab'` and `'/check-point/demo'` to `PUBLIC_PATHS` in `src/lib/route-access.ts` and extend `src/lib/route-access.test.ts`.
3. Create `src/components/vocab/vocab-library-view.tsx` (+ `index.ts`) supporting search by keyword, level filter, topic filter, pronunciation audio (`audioUrl` + Web Speech fallback), saved-status detection against `useMyNotebook` when logged in, and `POST /notebook/save` with optional custom notes.
4. Create `src/app/(dashboard)/vocab/page.tsx`.
5. Update `src/components/notebook/notebook-view.tsx` to add the `"Kho từ vựng"` tab cleanly without disturbing `"Từ vựng"` or `"Ngữ pháp"` tests.
6. Update `src/components/common/topbar.tsx` and `src/components/common/mobile-nav-drawer.tsx` replacing broken `/exam` links (`Kho Từ Vựng` -> `/vocab`, `Đề Thi Writing`/`Speaking` -> `/testlevels/flyers` & `/testlevels/movers` or `/` rather than 404).

## Step 3: Dynamic SiteConfig Provider & Student Surface Wiring
1. Create `src/lib/site-config.ts` with `mergeSiteConfig`, `resolveSiteAsset`, `resolveMapText`.
2. Create `src/providers/site-config-provider.tsx` (`SiteConfigProvider`, `useSiteConfig`) defaulting to `DEFAULT_SITE_CONFIG_CLIENT` and mount inside `src/providers/query-provider.tsx`.
3. Wire `useSiteConfig()` across:
   - `DreamySkyBackground` (`homeAssets.background`)
   - `Topbar` (`homeAssets.topbarIcons`, `languages` compact pill switcher when enabled)
   - `BottomNav` (`homeAssets.bottomNavIcons`, mascot badge)
   - `LevelHeader` & `LevelMap` (`mapAssets`, `mapTexts` localization)
   - `ExamCheckpoint` & `ExamModeSelectModal` (`checkpointAssets`)
   - `WritingIntro`, `WritingWorkbench`, `WritingResultOverview` (`globalAssets`, `writingAssets`)
   - `SpeakingIntro`, `SpeakingMicCheck`, `SpeakingWorkbench`, `SpeakingQuestion`, `SpeakingPreview`, `SpeakingResult` (`globalAssets`, `speakingAssets`)

## Step 4: Verification
1. Write unit/component tests: `src/lib/site-config.test.ts` & `src/components/vocab/vocab-library-view.test.tsx`, plus ensure `notebook-view.test.tsx`, `route-access.test.ts`, `topbar-admin-entry.test.tsx`, `dashboard-view.test.tsx` pass.
2. Run `tsc --noEmit`, `eslint` on touched files, `vitest run`, and `npm run build`.
