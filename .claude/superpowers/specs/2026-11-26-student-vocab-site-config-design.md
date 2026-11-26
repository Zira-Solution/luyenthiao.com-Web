# Sub-project B Design: Vocabulary Search + Save to Notebook & Dynamic SiteConfig

## 1. Scope & Goals
Integrate the remaining non-Arena public/student Backend endpoints cleanly into `luyenthiao.com-Web`:
1. `GET /api/vocab/search?q=&level=&topic=` — public dictionary lookup returning up to 50 active `VocabWord` records.
2. `POST /api/notebook/save` — authenticated (`JwtAuthGuard`) upsert of `{ vocabId, notes?, isFavorite?, memorized? }` into the student's Notebook (`NotebookEntry`).
3. `GET /api/site-config/public` — public site configuration (`mapAssets`, `mapTexts`, `languages`, `defaultLanguage`, `globalAssets`, `authAssets`, `homeAssets`, `speakingAssets`, `writingAssets`, `challengeAssets`, `checkpointAssets`) applied dynamically across student/public surfaces while falling back safely to upgraded local defaults when uncustomized or offline.

## 2. Architecture & Routes

### 2.1 Vocabulary Search & Save (`/vocab` + `/notebook`)
- **Public API helper (`src/lib/api/public.ts` & `src/schemas/vocab.ts`):**
  - `vocabWordSchema`: `id`, `word`, `ipa`, `type`, `meaningVi`, `exampleEn`, `exampleVi`, `audioUrl`, `level`, `topic`, `active`.
  - `searchPublicVocab({ q?, level?, topic? })`: calls `publicFetch('/vocab/search?...')`, parses array cleanly with `vocabWordSchema`.
- **Authenticated Notebook API (`src/lib/api/notebook.ts` & `src/hooks/use-notebook.ts`):**
  - `saveNotebookWord({ vocabId, notes?, isFavorite?, memorized? })`: calls `authFetch('/notebook/save', { method: 'POST', body })` -> parses `{ id, isFavorite, memorized, notes, vocab }`.
  - `useSearchVocab(params)`: public React Query (`queryKeys.publicVocabSearch(params)`).
  - `useSaveToNotebook()`: React Query mutation invalidating `queryKeys.myNotebook()` on success.
- **UI Surfaces:**
  - `VocabLibraryView` (`src/components/vocab/vocab-library-view.tsx` + barrel):
    - Search input (debounced), level selector (`ALL`, `starters`, `movers`, `flyers`, `ket`, `pet`, `toefl_primary`, `toefl_junior`, `ioe`), topic selector (computed dynamically from loaded results + clear filters).
    - Responsive flashcard/word-card grid showing `word`, `type`, `ipa`, `level`/`topic` badge, `meaningVi`, `exampleEn`, `exampleVi`, Web Speech / `audioUrl` pronunciation button, inline optional note input, and `"Lưu vào Sổ tay"` action button.
    - Handles both authenticated students (live save via `POST /notebook/save`, shows `"Đã lưu"` state immediately if present in `useMyNotebook()`, allows updating/saving notes) AND guests (full search + audio + examples work; clicking `"Lưu vào Sổ tay"` shows clean prompt with link to `/login?redirect=/vocab`).
  - `/vocab` public route (`src/app/(dashboard)/vocab/page.tsx`) + `ROUTES.VOCAB = '/vocab'` + `'\/vocab'` in `PUBLIC_PATHS` (`src/lib/route-access.ts`).
  - Embed `"Kho từ vựng"` tab cleanly inside `/notebook` (`src/components/notebook/notebook-view.tsx`) alongside existing `"Từ vựng"` and `"Ngữ pháp"` tabs (preserving exact `"Ngữ pháp"` coming-soon text and all existing `NotebookView` tests).
  - Fix dead `/exam` links in `Topbar` and `MobileNavDrawer` (`"Kho Từ Vựng"` -> `/vocab`, `"Đề Thi Writing"` -> `/?focus=writing` or `/testlevels/starters`, `"Đề Thi Speaking"` -> `/?focus=speaking` or `/testlevels/movers`, `"Luyện thi thử"` stays working cleanly).

### 2.2 Dynamic Site Config (`SiteConfigProvider` & `useSiteConfig`)
- **Schema & Fetch (`src/lib/api/public.ts`):**
  - `getPublicSiteConfig()`: calls `publicFetch('/site-config/public')`, validates against `siteConfigSchema`, merges partial keys over `DEFAULT_SITE_CONFIG_CLIENT`.
- **Context + Provider (`src/providers/site-config-provider.tsx` + `src/hooks/use-site-config.ts`):**
  - `SiteConfigContext` carries `{ config, language, setLanguage }` with `DEFAULT_SITE_CONFIG_CLIENT` as default value so standalone unit tests without `<SiteConfigProvider>` continue to work with zero mock boilerplate.
  - `SiteConfigProvider` mounted inside `QueryProvider` (`src/providers/query-provider.tsx`) fetches `queryKeys.publicSiteConfig()` with `placeholderData: DEFAULT_SITE_CONFIG_CLIENT` and `staleTime: 5 * 60_000`.
  - Asset resolution helper `resolveConfiguredAsset(configuredValue, defaultPlaceholder, preferredAsset)`:
    - Keeps upgraded visual assets (e.g., `/assets/homepage/background/universe-background.webp`, `/assets/topbar/ic_*_3d.webp`) when Admin has NOT overridden the legacy default `/clone-assets/...` value, and immediately serves Admin's customized URL/R2 upload whenever changed in `/admin/site-config`!
    - Also switches `/clone-assets/*` scenes (`LevelHeader`, `LevelMap`, `ExamCheckpoint`, `ExamModeSelectModal`, `Writing*`, `Speaking*`, `BottomNav`) cleanly to configured URLs.
  - Localization helper `formatMapText(config, key, lang, vars)` applies `config.mapTexts` and `language` (`'vi' | 'en'`) to map labels (`Trở về`/`Back`, `Video bài thi nói`/`Speaking Test Video`, `Ngẫu nhiên`/`Random`, `Bài {n}`/`Test {n}`).
  - Optional language toggle in `Topbar` / `Dashboard` when `config.languages.length > 1`.

## 3. Non-Goals & Constraints
- Do not change `/admin/*` behavior or Admin `SiteConfigView` contract.
- Keep `useMyNotebook`, `useSaveToNotebook` under `queryKeys.my...` (`'me'` prefix) so logout clears private state automatically; keep `publicSiteConfig` & `publicVocabSearch` under `'public'`.
- Avoid raw HTML rendering (`lib/no-raw-html.test.ts`), keep `import-x/order` & React 19 hooks rules clean.
