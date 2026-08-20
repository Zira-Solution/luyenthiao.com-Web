# Hướng dẫn sửa — sau review code ngày 20/08

Đối chiếu plan `exam-reuse-review-admin.md`. Phần A = 5 bug **bắt buộc sửa**. Phần B = tùy chọn. Sửa xong chạy lại gates ở Phần C.

| # | File | Bug | Độ khó |
| --- | --- | --- | --- |
| 1 | `exam-player.tsx:103` | Điểm listening/rw đề admin luôn 0 | Dễ |
| 2 | `exam-editor.tsx:124` | Lỗi JSON editor không hiện UI | Dễ |
| 3 | `exam-list-table.tsx:20` | Gọi store-set trong render | Dễ |
| 4 | `part-gapfill.tsx:14` | Gapfill Reading nhiều câu bị mất câu | Trung bình |
| 5 | `exam-player.tsx:407,419` | Hardcode structure cuối = 1 | Dễ |

---

## Phần A — 5 bug bắt buộc

### Bug 1 — Điểm listening/rw của đề admin luôn = 0

**Nguyên nhân.** `gradeExam` trả `byStructure` key = `structure.id`. Đề mock normalize sinh id dạng `${exam.id}:0` — trùng cái mình đang ghép tay. Đề admin tạo từ `blankStructure()` có id `s_<uuid>` → lookup miss → fallback 0 → testresult tính khiên sai.

**Sửa** — `src/components/checkpoint/exam-player.tsx:103-104`, trong `handleSubmitExam`:

```ts
// SAI — chỉ đúng cho đề mock
const listening = result.byStructure[`${exam.id}:0`]?.correct ?? 0
const rw = result.byStructure[`${exam.id}:1`]?.correct ?? 0

// ĐÚNG — lấy key từ chính structures của đề
const listening = result.byStructure[exam.structures[0]?.id ?? ""]?.correct ?? 0
const rw = result.byStructure[exam.structures[1]?.id ?? ""]?.correct ?? 0
```

**Verify.** Làm bài đề tự tạo trong admin → submit → testresult hiện listening/rw > 0 (trước fix = 0).

---

### Bug 2 — Lỗi JSON ở editor crash ngầm, không hiện banner

**Nguyên nhân.** `save()` đang `throw new Error` ở 2 nhánh (JSON trống / JSON sai cú pháp). `onClick` không có ai catch → lỗi văng ra console, banner đỏ `saveError` không bao giờ được set (nó chỉ set cho lỗi zod).

**Sửa** — `src/components/admin/exam/editor/exam-editor.tsx`, thay cả block `save()` từ dòng 117:

```ts
const save = () => {
  setSaveError(null)
  if (!draft) return

  let parseError: string | null = null
  const finalPartsPerStruct: ExamStructure[] = draft.structures.map((s) => {
    const parts: ExamPart[] = s.parts.map((p) => {
      const raw = questionJsons[p.id]?.trim()
      if (!raw) {
        parseError = `Phần "${p.title || p.id}" chưa có dữ liệu câu hỏi.`
        return p
      }
      try {
        return { ...p, questions: JSON.parse(raw) as ExamQuestion[] }
      } catch {
        parseError = `JSON câu hỏi của phần "${p.title || p.id}" không hợp lệ.`
        return p
      }
    })
    return { ...s, parts }
  })

  if (parseError) {
    setSaveError(parseError)
    return
  }

  const final: Exam = { ...draft, structures: finalPartsPerStruct }
  const result = examSchema.safeParse(final)
  if (!result.success) {
    const first = result.error.issues[0]
    setSaveError(`Dữ liệu không hợp lệ: ${first?.path.join(".")} ${first?.message}`)
    return
  }
  if (isNew) addExam(final)
  else updateExam(final)
  router.push(ROUTES.ADMIN_EXAM)
}
```

**Verify.** Mở editor → xóa trống textarea JSON một phần → "Lưu đề" → banner đỏ hiện, console không có uncaught error.

---

### Bug 3 — `hydrate()` trong render của `ExamListTable`

**Nguyên nhân.** `if (!hydrated) hydrate()` chạy ngay giữa render → set store Zustand khi đang render component khác → React cảnh báo "Cannot update a component while rendering a different component".

**Sửa** — `src/components/admin/exam/exam-list-table.tsx`:

1. Dòng 5 thêm `useEffect`:

```ts
import { useEffect, useRef, type ReactElement } from "react"
```

2. Thay dòng 20:

```ts
// XÓA
if (!hydrated) hydrate()

// THAY BẰNG
useEffect(() => {
  hydrate()
}, [hydrate])
```

**Verify.** Vào `/admin/exam` mở DevTools Console — không còn warning đó; danh sách vẫn hiện sau 1 tick.

---

### Bug 4 — Gapfill Reading có nhiều câu: mất các câu sau câu đầu

**Nguyên nhân.** `gapfillVariant` đang phân nhánh theo **tên structure** (Listening → form-rows, ngược lại inline-passage), còn `InlinePassageLayout` chỉ render **một** question non-example (`find`). Đề mock không sao (RW1/3–6 mỗi part 1 câu chính), nhưng đề admin gapfill Reading ≥ 2 câu → câu 2+ không hiện ra UI mà vẫn bị tính vào total khi chấm.

**Sửa** — `src/components/exam/parts/part-gapfill.tsx`, về đúng rule của plan (đếm số câu):

1. Đổi signature hàm variant (dòng 14-16) — nhận `part` thay vì `structureName`:

```ts
import type { AnswerMap, ExamPart } from "@/types/exam" // thêm ExamPart nếu chưa có

function gapfillVariant(part: ExamPart): "form-rows" | "inline-passage" {
  const realQuestions = part.questions.filter((q) => !q.isExample).length
  return realQuestions <= 1 ? "inline-passage" : "form-rows"
}
```

2. Đổi `PartGapfill` cuối file (dòng 375):

```ts
export function PartGapfill(props: PartRendererProps): ReactElement {
  return gapfillVariant(props.part) === "form-rows" ? (
    <FormRowsLayout {...props} />
  ) : (
    <InlinePassageLayout {...props} />
  )
}
```

**Không ảnh hưởng đề mock**: L2 nhiều câu → vẫn form-rows; RW1/3–6 một câu → vẫn inline-passage (kết quả giống hệt nhánh cũ). Đa câu giờ rơi vào form-rows (mỗi detail 1 dòng) — hết mất dữ liệu.

Lưu ý cosmetic còn lại (chấp nhận, không cần sửa): `FormRowsLayout` với question có nhiều detail sẽ lặp nguyên đoạn prompt mỗi dòng, mỗi lần thay một `{{n}}` khác nhau thành `______`.

**Verify.**
1. Đề mock Movers: 11 part render giống bản trước (L2 vẫn hàng form, RW vẫn đoạn văn).
2. Admin tạo gapfill Reading 2 câu → preview/làm bài thấy đủ 2 câu.

---

### Bug 5 — Hardcode "structure cuối cùng = index 1"

**Nguyên nhân.** 2 chỗ so `activeStructIdx === 1` — đúng cho đề 2 structure (mock) nhưng sai cho đề admin 1 structure: label "Nộp bài" không bao giờ hiện (chỉ "Tiếp tục" rồi no-op), review mode nút ⮕ cuối không disable.

**Sửa** — `src/components/checkpoint/exam-player.tsx`:

Dòng 407 (label nút submit):

```ts
// SAI
{activePartIdx === structPartCount - 1 && activeStructIdx === 1 ? "Nộp bài" : "Tiếp tục"}
// ĐÚNG
{activePartIdx === structPartCount - 1 && activeStructIdx === structures.length - 1
  ? "Nộp bài"
  : "Tiếp tục"}
```

Dòng 419 (disable nút phải khi review):

```ts
// SAI
disabled={isReview && activePartIdx === structPartCount - 1 && activeStructIdx === 1}
// ĐÚNG
disabled={
  isReview &&
  activePartIdx === structPartCount - 1 &&
  activeStructIdx === structures.length - 1
}
```

**Verify.** Đề admin 1 structure: part cuối hiện "Nộp bài" và bấm ra modal submit; review mode ở part cuối nút ⮕ mờ.

---

## Phần B — Tùy chọn (sai lệch plan + nit)

| # | Chỗ | Sửa gợi ý |
| --- | --- | --- |
| B1 | Thiếu live preview ở editor (plan bước 8) | Thêm tab preview vào `PartCard`: render `<PartRenderer part={part} answers={{}} onChange={() => {}} />` lấy từ `PART_RENDERERS[part.kind]` — chính là consumer thứ 3 của bộ renderer |
| B2 | Không có nút "Nhân bản" ở list | Copy exam qua `structuredClone` → đổi `id = createId("exam")`, `name + " (bản sao)"`, gọi `add()` |
| B3 | Alert import sai nghĩa | `exam-list-table.tsx:32` — `skipped` là số item **fail schema**, id trùng thì bị **ghi đè**. Đổi text: `${result.skipped} đề sai định dạng đã bỏ qua (đề trùng id được ghi đè)` |
| B4 | `persistExams` export chết | Xóa hàm export ở `exam-store.ts:61` (trùng tên hàm private trong `storage.ts`) |
| B5 | `?admin=1` param chết | Xóa ở `exam-list-table.tsx:134` — không component nào đọc param này |
| B6 | `MOCK_LEVEL_LABEL` hardcode | `exam-player.tsx:18,303` — thay bằng `exam.levelName` (hoặc `${exam.levelName} Practice Test`), xóa constant |
| B7 | Thiếu barrel + route constant | Tạo `src/components/admin/index.ts`; thêm `ADMIN_EXAM_DETAIL: '/admin/exam/[id]'` nếu cần dùng |
| B8 | 2 page admin thiếu `metadata` | Thêm export `metadata` đủ 5 trường (title, description, keywords, alternates, openGraph) — hoặc `robots: noindex` cho trang admin |
| B9 | `changePartKind` wipe questions | Thêm `window.confirm("Đổi loại phần sẽ xóa câu hỏi hiện tại. Tiếp tục?")` trước khi thay |
| B10 | `saveAttempt` không try/catch | Bọc `JSON.parse` như `loadAttempt` đã làm |
| B11 | Editor seed 1 structure | `blankExam()` thêm `blankStructure(1)` thứ 2 nếu muốn đúng plan (Listening 35' + Reading-Writing 30') |

---

## Phần C — Chạy lại sau khi sửa

```bash
npm run format && npm run lint && npx tsc --noEmit && npm run build && npm run test
```

Lưu ý: `lint` hiện có sẵn 7 lỗi import-order ở **file cũ** (`testlevels/*`, `_webclone/capture-flyer.js`) — không liên quan đợt này, muốn xanh hẳn thì chạy `npx eslint src/components/testlevels src/app/testlevels --fix` riêng.

Checklist tay (theo bước 9 plan):

1. Đề mock Movers: 11 part render giống bản trước (sau bug 4 vẫn phải giống).
2. Submit đề mock → điểm không đổi so với trước sửa.
3. Submit **đề admin** → testresult listening/rw > 0 (bug 1), khiên hợp lý.
4. Review "Xem đáp án": đủ 4 kind, readOnly, nút cuối disable (bug 5).
5. Editor: JSON trống/sai → banner đỏ (bug 2); `/admin/exam` không còn warning console (bug 3).
