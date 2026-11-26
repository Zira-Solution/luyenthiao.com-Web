# Sub-project A Design — Student Exams, Attempts, Writing/Speaking & Recording Upload

**Date:** 2026-11-26
**Scope:** Connect student/public frontend flows in `luyenthiao.com-Web` to existing Backend endpoints (`/exams/*`, `/exam-attempts/*`, `/writing-submissions/*`, `/speaking-submissions/*`, `/uploads/recording`) without modifying Backend contracts or removing legacy mock compatibility where needed.

## 1. Architecture & API Layer

Create dedicated student schemas and API modules following `authFetch` + `parseOrThrow` / build-safe `getPublic` patterns:

- `src/schemas/student-exam.ts` — Zod schemas for:
  - `PublicExamSummary` (`id`, `name`, `levelSlug`, `levelName`, `order`, `skills`)
  - `AttemptSubmissionRef` (`WritingSubmission` / `SpeakingSubmission` embedded & detail views, using `optStr`/`optNum` nullable normalization)
  - `ServerExamAttempt` (`id`, `examId`, `levelSlug`, `examTitle`, `score`, `total`, `correctCount`, `totalQuestions`, `timeSpentSec`, `createdAt`, `data`, `exam`, `writingSubmissions`, `speakingSubmissions`)
  - `WritingSubmissionDetail` & `SpeakingSubmissionDetail` (supporting `/write/result/[id]` and `/speaking/result/[id]`)
- `src/lib/api/public.ts` — extend `'server-only'` public API helper with:
  - `getPublicExams(level?: string, skill?: string)` (`GET /exams/public`)
  - `getPublicDemoExam()` (`GET /exams/demo`)
- `src/lib/api/student-exams.ts` — client/auth fetches & mutations:
  - `fetchPublicExamsClient(level?, skill?)` (`GET /exams/public`)
  - `fetchDemoExamClient()` (`GET /exams/demo`)
  - `fetchExamById(id)` (`GET /exams/:id`)
  - `submitExamAttempt(input)` (`POST /exam-attempts`)
  - `fetchExamAttempt(id)` (`GET /exam-attempts/:id`)
  - `uploadRecordingAudio(blob, filename?)` (`POST /uploads/recording` via `authFetch` with `FormData` key `'file'`)
  - `fetchWritingHistory(attemptId)` & `fetchWritingSubmission(id)`
  - `fetchSpeakingHistory(attemptId)` & `fetchSpeakingSubmission(id)`
- `src/lib/query-keys.ts` — add student keys (`myExamAttempt(id)`, `myWritingSubmission(id)`, `mySpeakingSubmission(id)`, `demoExam()`, `publicExams(level, skill)`) strictly under non-admin namespaces (`me` / `public`).

## 2. Screen-by-Screen Behavior

1. **`/testlevels/[level]` (`TestLevelsPage`, `LevelHeader`, `LevelMap`)**
   - Server page loads `getPlanets()` + `getPublicExams(level)`. If the level exists in DB planets (or `mocks/testlevels.json` fallback when backend is unreachable), render dynamic `name`, `total = planet.mapTotal`, `mapBackground`, and map checkpoints `1..exams.length` to real `/check-point/${exam.id}` URLs with real titles and skill badges.
   - Checkpoints beyond `exams.length` stay locked (`"Sắp mở"`). Legacy direct `/check-point/7778495e-531b-4039-a3ea-321874ba1a7a` remains supported.
   - `LevelHeader` wires the `🎲 Ngẫu nhiên` button to navigate to a random real checkpoint in `exams` (or demo/mock fallback).

2. **`/placement-test` (`PlacementTestView`) & Guest Demo Access**
   - Preserve existing quick quiz and add a prominent **"Làm Đề Demo chính thức"** action powered by `GET /exams/demo` so guests can run a full real `ExamPlayer` session without logging in.
   - When an unauthenticated visitor opens `/check-point/[id]` (for a DB exam UUID), show a clear modal prompting Sign In (`?redirect=/check-point/${id}`) alongside a button to launch the **Demo Exam** (`/exams/demo`).

3. **`/check-point/[id]` (`ExamCheckpoint` + `ExamPlayer` + `PartWrite` + `PartSpeak`)**
   - Authenticated visitors fetch the real exam via `GET /exams/:id`; `mode=review&attemptId=...` fetches saved answers + submissions via `GET /exam-attempts/:attemptId`.
   - When `ExamCheckpoint` runs a DB exam in `exam` / `practice` mode, `ExamModeSelectModal` builds `parts` dynamically from `exam.structures` (title, minutes, maxScore) and navigates close button cleanly back to `/testlevels/${exam.levelSlug || initialData.level}`.
   - `PartRendererProps` receives optional `interactive?: boolean` and optional speaking media callbacks (`speakingMedia`, `onSpeakingMediaChange`), defaulting `interactive = false` so Admin `PartPreview` remains read-only.
   - Interactive `PartWrite` provides a rich textarea + live word counter writing to `answers[part.id].essay`.
   - Interactive `PartSpeak` integrates `SpeakingMicRecord` per question (handling `mic-plain`, `qa-grid`, `qa-pick`, `say-and-pick` selection/audio) and stores recorded `Blob` references in `ExamPlayer` state until submit.
   - On `handleSubmitExam`:
     - Compute objective score via `gradeExam` + `timeSpentSec` + `manualMax`.
     - If authenticated, upload any newly recorded speaking audio `Blob`s in sequence/parallel via `POST /uploads/recording` to obtain R2 `audioUrl` values, construct `writes` (`partId`, `answerText`, `wordCount`) and `speaks` (`partId`, `answers`), and call `POST /exam-attempts` once with a stable per-session `clientAttemptId`.
     - Redirect to `/testresult?attemptId=${attempt.id}&examId=${exam.id}` (or query-param summary when running as unauthenticated Demo without `attemptId`).

4. **`/testresult`, `/history`, `/write/*`, `/speaking/*`**
   - `/testresult` (`ExamResultView`): when `attemptId` is present, loads `GET /exam-attempts/:attemptId` and displays student display name (`useAuthStore`), dynamic skill shield breakdown derived from `structures`, live Writing/Speaking submission status badges (`Chờ chấm` / `Đã chấm` + scores & teacher comments + deep links to `/write/result/[subId]` & `/speaking/result/[subId]`), and **"Xem đáp án"** linking `/check-point/${examId}?attemptId=${attemptId}&review=true`.
   - `/history` (`HistoryView`): makes rows clickable / adds `"Xem chi tiết"` link to `item.detailUrl`.
   - `/write/[slug]` & `/speaking/[slug]` support real UUID exam IDs (fetching via `GET /exams/:id` and submitting via `POST /exam-attempts` + `POST /uploads/recording`), and `/write/result/[id]` & `/speaking/result/[id]` load real `WritingSubmission` / `SpeakingSubmission` (by submission ID or `attemptId`) with teacher rubric feedback & audio playback, while retaining legacy mock ID compatibility.

## 3. Error Handling & Testing

- All Zod schemas normalize nullable DB columns via `optStr`/`optNum`.
- Recording upload failures surface a crisp retryable message before discarding exam state (`clientAttemptId` prevents duplicate submissions).
- Unit/component tests (`vitest run`) verify helper builders (`writes`/`speaks` payload extraction, `wordCount`, `LevelMap` dynamic checkpoint binding, `PartWrite`/`PartSpeak` interactive mode vs read-only preview, `ExamResultView` & `HistoryView`), followed by `tsc --noEmit`, targeted `eslint`, `npm run build`, and Playwright Chromium E2E against live NestJS Backend.
