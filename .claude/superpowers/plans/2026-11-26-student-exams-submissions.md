# Sub-project A Implementation Plan — Student Exams, Attempts, Writing/Speaking & R2

**Spec:** `.claude/superpowers/specs/2026-11-26-student-exams-submissions-design.md`

## Task Order

1. **Task 1 — Schemas, Helpers, Query Keys & API Clients (`student-exam`)**
   - Create `src/schemas/student-exam.ts` (Zod schemas for `PublicExamSummary`, `ServerExamAttempt`, `WritingSubmissionDetail`, `SpeakingSubmissionDetail`, `UploadRecordingResponse`).
   - Create `src/lib/student-exam.ts` pure helpers (`buildSubjectivePayloads`, `computeManualMaxScore`, `countWords`, `toCheckpointSummary`) + `src/lib/student-exam.test.ts`.
   - Extend `src/lib/query-keys.ts` (`studentExamKeys` / methods under non-admin keys).
   - Extend `src/lib/api/public.ts` (`getPublicExams`, `getPublicDemoExam`) and create `src/lib/api/student-exams.ts` + `src/hooks/use-student-exams.ts`.

2. **Task 2 — Dynamic `/testlevels/[level]` Map & `/placement-test` Demo Mode**
   - Update `src/components/testlevels/level-map.tsx` and `level-header.tsx` to accept dynamic `exams` checkpoint links, skill labels, locked states beyond available DB exams, and working Random button.
   - Update `src/app/testlevels/[level]/page.tsx` to load live `getPlanets()` + `getPublicExams(level)` with safe mock fallback.
   - Update `src/components/placement-test/placement-test-view.tsx` to offer full real Demo Exam launch via `GET /exams/demo`.

3. **Task 3 — Interactive `PartWrite`, `PartSpeak`, `SpeakingMicRecord` & Real `ExamCheckpoint`/`ExamPlayer`**
   - Enhance `SpeakingMicRecord` (`onRecorded` optionally returns raw `blob` for upload without breaking existing props).
   - Extend `src/components/exam/parts/types.ts`, `part-write.tsx`, `part-speak.tsx` to support `interactive?: boolean` (textarea + word count, mic recorder + slide selection, review display).
   - Update `src/components/exam/exam-checkpoint.tsx`, `exam-mode-select-modal.tsx`, and `exam-player.tsx` to fetch real `GET /exams/:id` when logged in, prompt login / offer demo when guest, upload speaking audio blobs via `POST /uploads/recording`, post real `POST /exam-attempts`, and load `GET /exam-attempts/:id` in `review` mode.

4. **Task 4 — Real `/testresult`, `/history`, `/write/*`, `/speaking/*`**
   - Update `src/components/exam/exam-result-view.tsx` to fetch `GET /exam-attempts/:attemptId` and display real student name, objective breakdown, teacher grading status/feedback, and review link.
   - Update `src/components/history/history-view.tsx` so each attempt row opens `item.detailUrl`.
   - Update `src/app/write/[slug]/page.tsx`, `src/app/write/result/[id]/page.tsx`, `src/app/speaking/[slug]/page.tsx`, `src/app/speaking/result/[id]/page.tsx`, and `src/components/writing/*`, `src/components/speaking/*` to support real DB exam/submission UUIDs (`GET /writing-submissions/:id`, `GET /speaking-submissions/:id`, `POST /uploads/recording`, `POST /exam-attempts`) while keeping mock slug/attempt fallback intact.

5. **Task 5 — Verify Sub-project A**
   - Run `prettier --write`, `tsc --noEmit`, `eslint` on touched files, full `vitest run`, `npm run build`, and Playwright Chromium E2E across student map -> exam -> write + speak recording upload -> attempt submit -> admin grade -> student result/history review!
