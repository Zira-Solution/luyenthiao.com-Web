# Plan — Exam Player reuse + Xem đáp án + /admin/exam

Ngày: 2026-08-20 · Người tự code: Admin · Trạng thái: đã duyệt kiến trúc + storage

## Quyết định đã chốt

| Hạng mục | Quyết định |
| --- | --- |
| Storage đề tự tạo | **localStorage + export/import JSON** (chưa có backend) |
| Reuse | 1 data-model (zod) → 3 consumer: player / review / admin preview, dùng chung 1 bộ part-renderer |
| Review mode | Cùng `ExamPlayer`, thêm prop `mode: "exam" \| "review"` — không làm trang riêng |
| Điểm thi | Chấm bằng pure function `gradeExam()`, dùng chung cho submit + review |

## Nguyên tắc suốt plan

- Giữ **nguyên UI/CSS của part khi tách** ra file riêng (class hex cứng giữ nguyên để không phá design). Code **mới** (admin, feedback) theo rule màu token `@theme`.
- Theo `coding.md`: named export, `React.ReactElement`, `[Name]Props`, file kebab-case, thứ tự import, barrel `index.ts` mỗi thư mục component mới, không `any`.
- Mỗi bước xong chạy: `npm run lint && npx tsc --noEmit` (bước cuối thêm `npm run build`).
- Không xóa file cũ cho tới khi part mới render giống hệt bản cũ (so bằng mắt trên `/check-point/7778495e-531b-4039-a3ea-321874ba1a7a`).

---

## Bước 1 — Data model: types + zod + normalize

### File

- `src/lib/exam/schema.ts` — zod schema (single source of truth)
- `src/types/exam.ts` — `export type Exam = z.infer<...>` + các type không infer được
- `src/lib/exam/normalize.ts` — map JSON gốc (GraphQL-ish) → `Exam`
- `src/lib/exam/schema.test.ts` — parse mock thật phải pass

### Model

```ts
// types/exam.ts
export type PartKind = "dragdrop" | "matching" | "multichoice" | "gapfill";

export interface Box { left: string; top: string; width: string; height: string } // "%", string như data gốc

export interface WordBoxItem { label: string; imageId?: string | null }

export interface ExamDetail {
  id: string;
  label: string;                 // "1".."n" (gapfill) | "A".."H" (multichoice/matching)
  box?: Box | null;              // dragdrop target
  imageUrl?: string | null;      // matching: ảnh vật phẩm
  correctAnswers: string[];      // result.value ?? [formattedValue.text]
  options?: string[];            // lựa chọn cho select (nếu có); không có → text input
}

export interface ExamQuestion {
  id: string;
  isExample: boolean;
  title?: string | null;         // heading / câu dialogue
  promptHtml?: string | null;    // content.text, chứa {{n}}
  choices?: WordBoxItem[];       // q.choices (dragdrop: tên/màu)
  correctLabel?: string | null;  // multichoice: labelOrder của detail có result.isSelected
  details: ExamDetail[];
}

export interface ExamPart {
  id: string;                    // examPartId
  kind: PartKind;
  title: string;
  audioUrl?: string | null;      // contents format AUDIO_ID
  imageUrl?: string | null;      // contents format IMAGE_ID
  wordBox?: WordBoxItem[];       // contents[].body.images
  extraHtml?: string | null;     // contents HTML block (bảng từ RW4)
  questions: ExamQuestion[];
}

export interface ExamStructure {
  id: string;
  name: string;                  // "Listening" | "Reading - Writing"
  minutes: number;               // schema default 35 / 30
  parts: ExamPart[];
}

export interface Exam {
  id: string;
  name: string;
  levelSlug: string;             // "movers"
  levelName: string;
  structures: ExamStructure[];
}

// Đáp án người dùng — GIỮ format cũ để tương thích: key = detailId (dragdrop/gapfill/matching), questionId (multichoice)
export type AnswerMap = Record<string, Record<string, string>>;
```

### Quy tắc normalize (từ JSON mock)

| Nguồn (JSON gốc) | Đích (model) |
| --- | --- |
| `examStructures[].structureType.name` | `structure.name`; contains "Listening" → `minutes` default 35, ngược lại 30 |
| `parts[].node.partType` | `kind` |
| `contents` có `format: "AUDIO_ID"` | `audioUrl` |
| `contents` có `format: "IMAGE_ID"` | `imageUrl` |
| `contents[].body.images` | `wordBox` (`label`, `imageId`) |
| `contents` có format TEXT và `text.trim().startsWith("<")` | `extraHtml` |
| `q.choices` | `choices` (`{label, text}`) |
| `detail.formattedText.text` | `label` (gapfill) / `imageUrl` (matching) tùy kind |
| `detail.box` | `box` |
| `detail.result.value` ∥ `[result.formattedValue.text]` | `correctAnswers` |
| detail có `result.isSelected === true` | hoist lên `question.correctLabel = detail.labelOrder` |

**Fixups cho mock** (gom 1 chỗ, có comment đánh dấu `// MOCK_FIXUP`):
1. RW3 `{{6}}` (chọn tên truyện): data thiếu 3 lựa chọn A/B/C → gán `options` cho detail "6".
2. RW5: thay `/image/<hash>` bằng `/clone-assets/exam-media/read5_pic{1,2,3}.png`; strip thẻ `<p>` trong prompt.
3. Chiến lược `options` cho gapfill: detail-level → `question.choices` → labels của `wordBox` → tất cả từ trong `extraHtml` (RW4). Không có gì → text input.

### Hoàn thành khi

- `normalizeExam(exam7778495e)` pass schema, `tsc` sạch, test asserting: 2 structures / 5+6 parts / tổng detail có đáp án > 0 / mỗi multichoice question có `correctLabel`.

---

## Bước 2 — `gradeExam()` pure + fix bug chấm điểm

### File

- `src/lib/exam/grade.ts` + `grade.test.ts`

### API

```ts
export interface DetailGrade { status: "correct" | "wrong" | "empty"; correctAnswers: string[] }

export interface GradeResult {
  byKey: Record<string, DetailGrade>;                 // detailId hoặc questionId
  byPart: Record<string, { correct: number; total: number }>;
  byStructure: Record<string, { correct: number; total: number }>; // key = structure.id
  total: { correct: number; total: number };
}

export function gradeExam(exam: Exam, answers: AnswerMap): GradeResult;
```

### Luật chấm theo kind

| Kind | Key | So sánh |
| --- | --- | --- |
| dragdrop | `detail.id` | `correctAnswers.includes(value)` — exact |
| matching | `detail.id` | idem |
| multichoice | `question.id` | `value === question.correctLabel` (**fix bug L4/RW2 hiện không bao giờ được điểm**) |
| gapfill | `detail.id` | `trim().toLowerCase()` hai chiều so với từng mục trong `correctAnswers` |

- Mọi nơi: bỏ qua `isExample`. Không có value → `empty`.
- Test bắt buộc: 4 kind × (đúng / sai / bỏ trống) + đề trống answers + bug regression L4 & RW2.

---

## Bước 3 — Attempt storage

### File

- `src/lib/exam/storage.ts`

```ts
const EXAMS_KEY = "ela.exams.v1";      // Exam[] — đề admin tạo
const ATTEMPTS_KEY = "ela.attempts.v1"; // Record<examId, Attempt>

export interface ExamAttempt {
  examId: string;
  answers: AnswerMap;
  grade: { correct: number; total: number };
  submittedAt: string; // ISO
}

export function loadExams(): Exam[];
export function saveExams(exams: Exam[]): void;
export function upsertExam(exam: Exam): void;
export function deleteExam(id: string): void;
export function saveAttempt(attempt: ExamAttempt): void;
export function loadAttempt(examId: string): ExamAttempt | null;
export function exportExams(exams: Exam[]): void;   // download JSON (Blob + a[download])
export function importExams(file: File): Promise<{ added: number; skipped: number }>; // zod validate, id trùng → ghi đè
```

SSR-guard: mọi hàm đọc `localStorage` bọc `typeof window !== "undefined"`.

### Hoàn thành khi

- Submit bài xong → DevTools Application tab thấy `ela.attempts.v1` có đủ answers + điểm.

---

## Bước 4 — Tách part-renderer, xóa index cứng + hardcode

### File

- `src/components/exam/parts/part-dragdrop.tsx` (L1, L5)
- `src/components/exam/parts/part-matching.tsx` (L3)
- `src/components/exam/parts/part-multichoice.tsx` (L4, RW2)
- `src/components/exam/parts/part-gapfill.tsx` (L2, RW1, RW3–RW6)
- `src/components/exam/parts/index.ts` — registry

```ts
export interface PartRendererProps {
  part: ExamPart;
  structureName: string;          // "Listening" | "Reading - Writing" — chip tím
  answers: AnswerMap;
  onChange: (partId: string, key: string, value: string | null) => void;
  review?: ReviewContext;         // undefined khi làm bài
}

export interface ReviewContext {
  getGrade(key: string): DetailGrade | undefined;
  partScore?: { correct: number; total: number };
}

export const PART_RENDERERS: Record<PartKind, ComponentType<PartRendererProps>>;
```

### Nội dung tách từ `exam-player.tsx` (giữ nguyên JSX/class)

| Renderer | Lấy từ dòng cũ | Ghi chú |
| --- | --- | --- |
| dragdrop | 452–569 | `isColorCode`/`getColorName` chuyển vào file này; choices từ `question.choices`; ảnh từ `question.promptHtml` (đang lây từ `content.text`) |
| gapfill | 572–650 (L2), 813–903 (RW1), 1000–1343 (RW3–RW5), 1346–1438 (RW6) | Chọn variant bằng helper `gapfillVariant(part)`: **1** non-example question → `inline-passage` (cột trái `imageUrl` + `title` + `wordBox`/`extraHtml`, phải prompt `{{n}}`); **nhiều** → `form-rows` (chip số + input mỗi detail). `{{n}}` → select nếu `options`, ngược lại input. Xóa: `PART4_WORD_ROWS` (dùng `extraHtml`), `titleChoices` (dùng `options` của detail "6"), ảnh cứng `read2_cau_ca.webp`/`smile.webp`/`read5_*.png` (dùng `imageUrl` + fixup) |
| matching | 653–736 | danh sách A–H từ hardcode `["A".."H"]` → sinh từ `part.questions[].details` + letters của ảnh phải |
| multichoice | 739–810 (L4), 907–997 (RW2) | L4: choice là ảnh (`detail.imageUrl`), RW2: text — phân biệt bằng `detail.imageUrl` có hay không. Cả 2 lưu value = `labelOrder` vào key `question.id` |

### Hoàn thành khi

- Mở đề Movers, enough cả 11 part render giống hệt bản cũ (so màn hình), code không còn `activeStructIdx === 1 && activePartIdx === …`, không còn constant hardcode nội dung đề.

---

## Bước 5 — Xem đáp án: `AnswerFeedback` + review mode

### File

- `src/components/exam/answer-feedback.tsx`
- Sửa `exam-player.tsx`: prop `mode`, review rendering

### Thiết kế tick/X (đều dùng class Tailwind thường, không hex)

| Trạng thái | Hiển thị |
| --- | --- |
| correct | viền `border-emerald-500` + nền `bg-emerald-50` + icon `Check` (lucide) `text-emerald-600` |
| wrong | viền `border-rose-500` + nền `bg-rose-50` + icon `X` `text-rose-600` + chip "Đáp án: **X**" (`bg-emerald-100 text-emerald-800`) |
| empty | icon `X` `text-slate-400` + chip đáp án đúng |

- Component: `<AnswerFeedback grade={DetailGrade} format="text" | "color" />` — `format="color"` hiển thị chấm màu + tên màu (dùng cho dragdrop L5).
- Áp per kind: dragdrop → box đúng xanh/lỗi đỏ + ghi tên đúng; multichoice → choice đúng luôn viền xanh + ✓, choice đã chọn sai đỏ + ✗; gapfill → input `readOnly` đổi viền + badge ngay cạnh; matching → select `readOnly` viền theo trạng thái.
- Đầu mỗi part khi review: pill `bg-slate-900/60` "✓ 8/10 đúng".
- Header: label "XEM ĐÁP ÁN", ẩn timer; footer ẩn "Nộp bài", giữ 2 nút điều hướng; input/select `readOnly` + `pointer-events-none` (trừ điều hướng).

### Hoàn thành khi

- Làm bài → submit → testresult → "Xem đáp án": thấy lại đúng bài làm + tick/X + đáp án đúng ở cả 4 kind; điểm review khớp điểm submit.

---

## Bước 6 — Player nhận `exam` qua props

- `ExamPlayerProps`: `{ exam: Exam; attempt?: ExamAttempt | null; mode: "exam" | "review"; onExit: () => void }`. Xóa import JSON.
- `app/check-point/[id]/page.tsx` (server): đọc nguồn đề theo thứ tự **localStorage chưa đọc được ở server** → MVP: đề tự tạo thì client fetch từ storage. Cách gọn: page luôn render `<CheckpointClientWrapper>` (client) — wrapper tự `loadExams()`/mock, normalize, rồi render player. Mock giữ import server-side truyền vào như hiện tại cho nhanh.
- Submit: `gradeExam()` → `saveAttempt()` → `router.push(/testresult?examId=…&score=…&listening=…&rw=…&total=…)`.
- `testresult`: "Xem đáp án" dùng `examId` từ query (bỏ hardcode UUID). 
- (Optional sau) tab "Luyện tập" ở `mode-select-modal` truyền `mode` vào player, bật feedback từng câu — component ở bước 5 dùng lại được, không làm trong MVP.

### Hoàn thành khi

- Không còn import JSON bên trong component; luồng làm bài → xem đáp án khép kín theo `examId`.

---

## Bước 7 — `/admin/exam`: danh sách + CRUD

- `src/app/admin/exam/page.tsx` (orchestrator) + `src/components/admin/exam/exam-list-table.tsx`.
- Route constants: thêm `ADMIN_EXAM: "/admin/exam"`, `ADMIN_EXAM_DETAIL: "/admin/exam/[id]"` vào `ROUTES` (`src/constants/index.ts`).
- Bảng: tên đề · level · số phần · số câu hỏi · cập nhật lúc · actions (Sửa / Nhân bản / Xóa / Xuất).
- "Tạo đề" / "Nhân bản": sinh `crypto.randomUUID()`, seed template 2 structures (Listening 35' / Reading-Writing 30', 0 part) → điều hướng `/admin/exam/{id}`.
- "Nhập JSON": input file → `importExams()` → toast kết quả.
- `robots.ts`: thêm `Disallow: /admin`; **không** thêm vào sitemap.

### Hoàn thành khi

- Tạo → thấy trong bảng, refresh còn (localStorage); nhân bản đổi id + "(bản sao)"; xóa có confirm.

---

## Bước 8 — `/admin/exam/[id]`: editor + live preview

- `src/app/admin/exam/[id]/page.tsx` + `src/components/admin/exam/editor/`:
  - `exam-editor.tsx` — khung 3 vùng + state chung. State cross-component → theo rule 3 lớp: **cài Zustand** (`useExamEditorStore`: draft Exam + node đang chọn + dirty). Đây là lần đầu thật sự cần → `npm i zustand`.
  - `structure-tree.tsx` — cây Exam → Structure → Part → Question; thêm/xóa/duplicate từng node.
  - `node-forms.tsx` — form theo node đang chọn: exam meta; structure (tên, số phút); part (kind, title, audioUrl, imageUrl, wordBox rows, extraHtml); question (isExample toggle, title, promptHtml + nút "Chèn ô trống {{n}}", choices rows); detail (label, correctAnswers multi-value, options rows).
  - `dragdrop-box-picker.tsx` — part kind dragdrop: overlay lên `imageUrl`, kéo chuột vẽ rect (pointer events) → lưu `box` dạng `%` string.
  - `part-preview.tsx` — render node đang chọn qua `PART_RENDERERS[kind]` + toggle "Xem thử review" (bật `review` với vài answers mẫu).
- Lưu: validate `examSchema` mở rộng (mỗi detail ≥ 1 đáp án; multichoice có `correctLabel`; mọi `{{n}}` trong prompt khớp detail label; dragdrop cần `imageUrl` + box) → `upsertExam()`. Lỗi hiện cạnh trường, không chặn lưu nháp (nút "Lưu nháp" bỏ qua validate, "Hoàn tất" validate).
- Media: MVP chỉ nhập URL (paste path `/clone-assets/...`), không upload.

### Hoàn thành khi

- Tạo đề 2 phần (1 multichoice + 1 gapfill) trong admin → vào `/check-point/{id}` làm bài → submit → xem đáp án chạy đủ luồng. Preview admin giống hệt màn chơi.

---

## Bước 9 — Gates tổng

```bash
npm run format && npm run lint && npx tsc --noEmit && npm run build && npm run test
```

Kịch bản test tay (checklist cuối):

1. Đề mock Movers: 11 part render giống bản trước.
2. Submit đề mock → điểm đúng hơn bản cũ (L4 + RW2 giờ được chấm).
3. Xem đáp án: tick/X + đáp án đúng, readOnly, đủ 4 kind.
4. Admin: tạo → sửa → preview → làm bài → xem đáp án.
5. Export JSON từ máy này → import ở trình duyệt khác → làm được.

## Rủi ro biết trước

| Rủi | Ghi chú |
| --- | --- |
| localStorage ~5MB | Đề nặng ảnh/audio là URL nên nhẹ; export/import là lối thoát |
| 2 nguồn đề (mock + admin) | Bước 6 wrapper gộp: mock theo id cũ, đề mới từ storage — cùng schema |
| RW3 title options thiếu trong mock | Đã có MOCK_FIXUP; đề admin tự điền đầy đủ |
