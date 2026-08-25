# Guide — Nâng cấp editor `/admin/exam` cho người non-tech

Ngày: 2026-08-20 · Người code: **Admin** · Nguồn: plan đã duyệt (humming-giggling-quail) + thiết kế đã đối chiếu source

Mục tiêu: thay textarea JSON bằng form trực quan theo từng loại phần — media picker chọn ảnh/audio từ thư viện, kéo-vẽ ô thả, live preview, validation tiếng Việt. **Không đổi `src/types/exam.ts`, không đổi player, không đổi storage keys.**

Mỗi bước = 1 commit chạy được, có mục Verify riêng. Làm tuần tự, không nhảy bước.

---

## Quy tắc chung (áp dụng mọi bước)

- Named export · `React.ReactElement` · interface `[Name]Props` đặt ngay trên component · file kebab-case · barrel `index.ts` mỗi thư mục component mới · import order (Node → external → `@/` → relative) · `cn()` cho class điều kiện · **không `any`**.
- Màu qua token `@theme`: `bg-dashboard-bg`, `bg-topbar-login-bg/80`, `bg-brand-primary`, `bg-game-cta-from/to`, `bg-game-danger-to`, `text-semantic-warning`… — không hex cứng.
- **Deviation có chủ đích (ghi nhận):** thân editor dùng Zustand + controlled state, KHÔNG dùng react-hook-form. Lý do: mảng lồng động (structures→parts→questions→details) + semantics chéo (`correctLabel` tham chiếu `detail.label`) — RHF phải register nghìn field động. Vẫn đúng tinh thần rule 3 lớp: media = TanStack Query (server data), draft editor = Zustand (UI cross-component), rect tạm/người dùng gõ = `useState` (widget local). Zod vẫn là cửa cuối khi lưu.
- Xong mỗi bước: `npm run lint && npx tsc --noEmit` (bước 12 thêm build + test).

---

## Bước 1 — Refactor nền: tách store + primitives (hành vi ngoài không đổi)

**Mục tiêu:** dời state khỏi `exam-editor.tsx` vào Zustand store, tách field primitives, tách `PartCard` ra file riêng. Editor nhìn y như cũ.

### 1a. `src/store/exam-editor-store.ts` (mới)

```ts
"use client"

import { create } from "zustand"

import type { Exam, ExamPart, ExamStructure } from "@/types/exam"

interface ExamEditorState {
  draft: Exam | null
  baseline: string // JSON của bản đã lưu — để tính dirty
  jsonTexts: Record<string, string> // buffer JSON theo partId
  init: (exam: Exam) => void
  reset: () => void
  patchExam: (fn: (d: Exam) => Exam) => void
  patchStruct: (structIdx: number, fn: (s: ExamStructure) => ExamStructure) => void
  patchPart: (structIdx: number, partIdx: number, fn: (p: ExamPart) => ExamPart) => void
  setJsonText: (partId: string, text: string) => void
}

export const useExamEditorStore = create<ExamEditorState>((set) => ({
  draft: null,
  baseline: "",
  jsonTexts: {},

  init: (exam) =>
    set({
      draft: exam,
      baseline: JSON.stringify(exam),
      jsonTexts: Object.fromEntries(
        exam.structures.flatMap((s) =>
          s.parts.map((p) => [p.id, JSON.stringify(p.questions ?? [], null, 2)] as const),
        ),
      ),
    }),

  reset: () => set({ draft: null, baseline: "", jsonTexts: {} }),

  patchExam: (fn) =>
    set((st) => (st.draft ? { draft: fn(st.draft) } : st)),

  patchStruct: (structIdx, fn) =>
    set((st) =>
      st.draft
        ? {
            draft: {
              ...st.draft,
              structures: st.draft.structures.map((s, i) => (i === structIdx ? fn(s) : s)),
            },
          }
        : st,
    ),

  patchPart: (structIdx, partIdx, fn) =>
    set((st) => {
      if (!st.draft) return st
      const patch = (s: ExamStructure, si: number): ExamStructure =>
        si === structIdx
          ? { ...s, parts: s.parts.map((p, pi) => (pi === partIdx ? fn(p) : p)) }
          : s
      return { draft: { ...st.draft, structures: st.draft.structures.map(patch) } }
    }),

  setJsonText: (partId, text) =>
    set((st) => ({ jsonTexts: { ...st.jsonTexts, [partId]: text } })),
}))

export function selectDirty(st: ExamEditorState): boolean {
  return st.draft !== null && JSON.stringify(st.draft) !== st.baseline
}
```

### 1b. `src/components/admin/exam/editor/editor-field.tsx` (mới)

Di chuyển `Field`, `TextInput`, `NumberInput` từ `exam-editor.tsx` (dòng 355–400 cũ) sang đây, export đủ 4 primitive (thêm `TextAreaInput` cho các bước sau):

```ts
"use client"

import type { ChangeEvent, ReactElement, ReactNode } from "react"

interface FieldProps {
  label: string
  children: ReactNode
}

export function Field({ label, children }: FieldProps): ReactElement {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-white/60 text-[11px] font-black uppercase tracking-wide">{label}</span>
      {children}
    </label>
  )
}
```

`TextInput`, `NumberInput` copy nguyên từ bản cũ (đổi sang named export + interface props đúng rule). `TextAreaInput`:

```ts
interface TextAreaInputProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}

export function TextAreaInput({ value, onChange, placeholder, rows = 4 }: TextAreaInputProps): ReactElement {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      spellCheck={false}
      className="w-full bg-white/10 text-white font-semibold text-sm rounded-xl px-3 py-2.5 focus:outline-none border border-transparent focus:border-brand-primary placeholder:text-white/30 resize-y"
    />
  )
}
```

### 1c. `src/components/admin/exam/editor/part-card.tsx` (mới)

Chuyển `PartCard` + phần render textarea JSON hiện có từ `exam-editor.tsx` sang. Props đổi thành nhận vị trí thay vì callback rời:

```ts
interface PartCardProps {
  structIdx: number
  partIdx: number
}
```

Bên trong tự đọc `useExamEditorStore`: `draft.structures[structIdx].parts[partIdx]`, gọi `patchPart`, `setJsonText`… Logic `changePartKind` (kèm `window.confirm` hiện có) chuyển sang dùng `patchExam`.

### 1d. Sửa `exam-editor.tsx`

- Bỏ `useState<Exam>` + `questionJsons` + các hàm patch cục bộ → đọc từ store.
- `useEffect` nạp đề: gọi `init(found ?? blankExam())`; rời trang gọi `reset()`.
- Hàm `save()`: đọc `draft` từ store (logic parse JSON giữ nguyên như bản đã sửa lỗi).
- Thêm badge dirty: `const dirty = useExamEditorStore(selectDirty)` → chấm "Chưa lưu" cạnh nút Lưu.

**Verify:** mở `/admin/exam/{id}` — sửa đề bằng textarea JSON như cũ, Lưu, mọi hành vi y nguyên. F12 console sạch.

**Commit:** `refactor(editor): tách exam-editor-store + editor-field + part-card`

---

## Bước 2 — API liệt kê media

**Mục tiêu:** browser không đọc được thư mục `public/` → API route đọc filesystem. Chọn API route thay vì manifest vì manifest phải sinh lại mỗi lần bỏ file mới vào (admin non-tech sẽ quên).

### 2a. `src/lib/admin/media.ts` (mới)

```ts
export interface MediaItem {
  name: string
  path: string // "/clone-assets/exam-media/xxx.png" — dùng trực tiếp cho next/image
  dir: string // "exam-media"
  ext: string
}

export type MediaKind = "image" | "audio"

const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "gif", "svg"]
const AUDIO_EXTS = ["mp3", "wav", "ogg", "m4a"]
const SKIP_DIRS = new Set(["_next", "cm"])

export async function fetchMediaLibrary(kind: MediaKind): Promise<MediaItem[]> {
  const res = await fetch(`/api/admin/media?type=${kind}`)
  if (!res.ok) throw new Error("Không tải được thư viện media")
  const data = (await res.json()) as { items: MediaItem[] }
  return data.items
}
```

### 2b. `src/app/api/admin/media/route.ts` (mới — route API đầu tiên của app)

```ts
import { promises as fs } from "node:fs"
import path from "node:path"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

const IMAGE_EXTS = new Set(["png", "jpg", "jpeg", "webp", "gif", "svg"])
const AUDIO_EXTS = new Set(["mp3", "wav", "ogg", "m4a"])
const SKIP_DIRS = new Set(["_next", "cm"])
const ROOT = path.join(process.cwd(), "public", "clone-assets")

interface Entry {
  name: string
  path: string
  dir: string
  ext: string
}

let cache: { at: number; entries: Entry[] } | null = null
const TTL_MS = 60_000

async function walk(dir: string, rel: string, out: Entry[]): Promise<void> {
  const items = await fs.readdir(dir, { withFileTypes: true })
  for (const item of items) {
    if (SKIP_DIRS.has(item.name)) continue
    const abs = path.join(dir, item.name)
    const relPath = rel ? `${rel}/${item.name}` : item.name
    if (item.isDirectory()) {
      await walk(abs, relPath, out)
    } else if (item.isFile()) {
      const ext = path.extname(item.name).slice(1).toLowerCase()
      if (IMAGE_EXTS.has(ext) || AUDIO_EXTS.has(ext)) {
        out.push({
          name: item.name,
          path: `/clone-assets/${relPath}`,
          dir: rel || ".",
          ext,
        })
      }
    }
  }
}

async function listAll(): Promise<Entry[]> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.entries
  const entries: Entry[] = []
  await walk(ROOT, "", entries)
  entries.sort((a, b) => a.path.localeCompare(b.path))
  cache = { at: Date.now(), entries }
  return entries
}

export async function GET(request: Request): Promise<NextResponse> {
  const type = new URL(request.url).searchParams.get("type") ?? "image"
  const allowed = type === "audio" ? AUDIO_EXTS : IMAGE_EXTS
  const entries = await listAll()
  const items = entries.filter((e) => allowed.has(e.ext as never))
  return NextResponse.json(
    { items },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  )
}
```

Ghi chú: route này là server-side Node — chạy `next dev` / standalone bình thường; không lộ gì ngoài tên file public (đã public sẵn).

### 2c. `src/hooks/use-media-library.ts` (mới)

```ts
"use client"

import { useQuery } from "@tanstack/react-query"

import { fetchMediaLibrary, type MediaKind } from "@/lib/admin/media"

export function useMediaLibrary(kind: MediaKind) {
  return useQuery({
    queryKey: ["admin-media", kind],
    queryFn: () => fetchMediaLibrary(kind),
    staleTime: 5 * 60_000,
  })
}
```

**Verify:** `npm run dev` → `curl "http://localhost:3000/api/admin/media?type=audio"` trả 5 file mp3; `type=image` trả danh sách ảnh (khoảng 100+).

**Commit:** `feat(api): route liệt kê ảnh/audio trong clone-assets`

---

## Bước 3 — Media picker (field + dialog)

**Mục tiêu:** component chọn media tái sử dụng ở mọi form: thumbnail hiện tại + nút mở thư viện + dán URL + xóa.

### 3a. Cài dialog

```bash
npx shadcn@latest add dialog
```

Thêm export vào `src/components/ui/index.ts` (file này hiện chỉ có comment — bắt đầu barrel luôn).

### 3b. `src/components/admin/media/media-browser-dialog.tsx` (mới)

Props `{ kind, open, onOpenChange, value, onSelect }`. Bên trong:

- `useMediaLibrary(kind)`; state `search` (lọc client-side theo `name` + `dir`, không cần debounce — 129 item), `visibleCount = 24` tăng khi bấm "Tải thêm".
- Ảnh: grid `grid-cols-4 gap-2`, mỗi ô `relative aspect-square rounded-lg overflow-hidden border` + `next/image fill object-contain` + tick xanh khi đang chọn.
- Audio: danh sách hàng ngang — icon `Music` + tên file + `<audio controls preload="metadata" className="h-8" src={item.path} />` nghe thử ngay.
- Chọn item → `onSelect(item.path)` → `onOpenChange(false)`.

### 3c. `src/components/admin/media/media-picker-field.tsx` (mới)

```ts
interface MediaPickerFieldProps {
  kind: "image" | "audio"
  value: string | null | undefined
  onChange: (v: string | null) => void
}
```

Layout 1 hàng: preview 64×64 (ảnh: `next/image`; audio: icon + tên file rút gọn) · nút "Thư viện" (mở dialog) · nút "Dán URL" (bật ô input nhỏ, validate: bắt đầu bằng `/` mới nhận; URL http → hiện cảnh báo vàng *"URL ngoài sẽ không hiển thị được — hãy tải file vào public/clone-assets"*) · nút "Xóa" (icon Trash2, `onChange(null)`).

### 3d. Barrel `src/components/admin/media/index.ts` + dùng thử

Thêm tạm vào `part-card.tsx` một `MediaPickerField` gán `part.imageUrl` (bước 4 sẽ đưa vào đúng chỗ `part-settings-fields`).

**Verify:** mở editor phần bất kỳ → chọn ảnh từ thư viện → Lưu đề → F5 → mở lại thấy ảnh còn (kiểm tra trong `ela.exams.v1` DevTools). Paste URL `https://...` thấy cảnh báo vàng.

**Commit:** `feat(admin): media picker field + thư viện dialog`

---

## Bước 4 — Part settings + form GAPFILL (default kind) + factories + tags-input

**Mục tiêu:** form đầu tiên thay textarea JSON cho kind gapfill.

### 4a. `src/lib/exam/factories.ts` (mới — không đụng `blank.ts`)

```ts
import { createId } from "@/lib/exam/blank"
import type { ExamDetail, ExamQuestion, PartKind } from "@/types/exam"

export function blankDetail(kind: PartKind, label: string): ExamDetail {
  const detail: ExamDetail = { id: createId("d"), label, correctAnswers: [] }
  if (kind === "dragdrop") detail.box = null
  return detail
}

export function blankQuestion(kind: PartKind): ExamQuestion {
  return { id: createId("q"), isExample: false, title: "", details: [] , ...(kind === "multichoice" ? { correctLabel: null } : {}) }
}

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

export function nextLetter(used: string[]): string {
  return LETTERS.find((l) => !used.includes(l)) ?? "Z"
}
```

### 4b. `src/components/admin/exam/editor/tags-input.tsx` (mới)

Nhập danh sách string: ô input, Enter/phẩy để thêm, chip có nút x. Props `{ values: string[] | undefined; onChange: (v: string[] | undefined) => void; placeholder?: string }`. Khi mảng rỗng và chưa gõ → `onChange(undefined)` (giữ field optional đúng schema).

### 4c. `src/components/admin/exam/editor/form/part-settings-fields.tsx` (mới)

Field part-level, hiện theo kind (bảng visibility):

| Control | Ghi vào | Label VI | Hiện cho kind | Ghi chú |
| --- | --- | --- | --- | --- |
| MediaPicker audio | `part.audioUrl` | "Âm thanh phần nghe" | tất cả | chú thích: *"Chỉ phát khi phần thuộc cấu trúc thứ nhất (Listening)"* |
| MediaPicker image | `part.imageUrl` | "Ảnh minh họa" | gapfill, multichoice | KHÔNG hiện cho dragdrop (player không đọc) và matching |
| WordBox editor | `part.wordBox[]` | matching: "Cột phải — các thẻ chữ" · gapfill: "Hộp từ gợi ý" | matching, gapfill | mỗi hàng: TextInput chữ (auto A/B/C) + MediaPicker ảnh → `imageId` |
| TextArea | `part.extraHtml` | "Khối HTML bổ sung (bảng từ)" | gapfill | mini preview `dangerouslySetInnerHTML` bên dưới |

WordBox editor đặt trong file này (component con `WordBoxEditor`): hàng = `[TextInput label] [MediaPicker image → imageId] [nút xóa]`, nút "+ Thêm thẻ" gán `nextLetter(các chữ đã dùng)`.

### 4d. `src/components/admin/exam/editor/form/part-form-gapfill.tsx` (mới)

Props `{ structIdx, partIdx }` — tự đọc part từ store. Cấu trúc:

- Banner đầu form: tự tính variant như player (`questions.filter(q => !q.isExample).length <= 1` → "Khuôn dạng: Đoạn văn chỗ trống", ngược lại "Khuôn dạng: Dạng hàng (mỗi ô 1 dòng)").
- Danh sách question card: header = toggle `isExample` ("Là ví dụ — không chấm điểm") + nút xóa câu; body:
  - `TextArea` "Đoạn văn / Câu hỏi" → `question.promptHtml` + **nút "Chèn chỗ trống"** chèn `{{n}}` tại vị trí con trỏ (tính `n` = số ô tiếp theo: `details.length + 1`).
  - Danh sách "Ô trống" (details): mỗi ô = badge số (auto 1,2,3… — `detail.label` **bắt buộc là số** vì player match `{{\d+}}`) + `TagsInput` "Các lựa chọn" → `detail.options` (để trống = học sinh tự gõ) + `TagsInput` "Đáp án chấp nhận" → `detail.correctAnswers` (chấm không phân biệt hoa/thường) + nút xóa ô.
- Nút "+ Thêm câu hỏi" / "+ Thêm ô trống" dùng `blankQuestion("gapfill")` / `blankDetail("gapfill", String(details.length + 1))`.
- Live hint cuối mỗi question: so `{{\d+}}` trong prompt với labels — `"{{3}} chưa có ô tương ứng"` / `"Ô số 2 không được tham chiếu"`; ô không tham chiếu **có** options → warning vàng *"Ô này hiển thị thành khối 'Choose the best name' ở cột trái"*; không options → đỏ *"Ô này sẽ không bao giờ hiển thị"*.

### 4e. Mount theo kind trong `part-card.tsx`

Khi kind = gapfill → render `PartFormGapfill`; các kind khác **tạm** vẫn textarea JSON (bước 6–8 thay dần). Xóa đường JSON cho gapfill ở bước này luôn.

**Verify:** tạo đề mới → thêm phần gapfill → nhập đoạn văn có `{{1}}`, `{{2}}`, ô 1 có options ["a", "an"], ô 2 trống options + đáp án ["the"] → Lưu đề → vào `/check-point/{id}` chơi → render đúng khuôn dạng, select/input đúng như form đã nhập.

**Commit:** `feat(editor): form gapfill + part settings + factories + tags-input`

---

## Bước 5 — Live preview panel

**Mục tiêu:** thấy ngay kết quả khi gõ — mọi form bước sau đều hưởng.

### `src/components/admin/exam/editor/part-preview.tsx` (mới)

```tsx
"use client"

import type { ReactElement } from "react"

import { PART_RENDERERS } from "@/components/exam"

import type { ExamPart } from "@/types/exam"

interface PartPreviewProps {
  part: ExamPart
  structureName: string
}

export function PartPreview({ part, structureName }: PartPreviewProps): ReactElement {
  const Renderer = PART_RENDERERS[part.kind]
  return (
    <div className="bg-white rounded-3xl p-5 shadow-xl text-slate-900 max-h-[560px] overflow-auto">
      <Renderer
        part={part}
        structureName={structureName}
        answers={{}}
        onChange={() => {}}
      />
    </div>
  )
}
```

Trong `part-card.tsx`: toggle "Xem trước" (mặc định bật) → layout `grid grid-cols-1 xl:grid-cols-2 gap-4`: trái form, phải `sticky top-24` preview. Truyền `structureName` thật từ structure cha (badge tím của matching/multichoice/gapfill hiển thị tên này). KHÔNG đặt `pointer-events-none` — admin "thử chơi" được luôn (onChange no-op).

**Verify:** gõ thêm chữ trong tiêu đề part → preview cập nhật tức thì. Bấm select trong preview không crash.

**Commit:** `feat(editor): live preview qua PART_RENDERERS`

---

## Bước 6 — Form MULTICHOICE

**Mục tiêu:** form trắc nghiệm — tự chọn layout ảnh/hội thoại theo dữ liệu.

`form/part-form-multichoice.tsx` — props `{ structIdx, partIdx }`:

- Banner động: replicate logic player — bất kỳ detail nào có `imageUrl` → *"Kiểu hiển thị: Thẻ ảnh"*, ngược lại *"Kiểu hiển thị: Hội thoại văn bản"*. Hint: *"Để có thẻ ảnh: chọn ảnh cho ít nhất một lựa chọn"*.
- Mỗi question card:
  - Toggle `isExample` — label *"Là ví dụ (hiện đáp án, không chấm)"*.
  - TextInput "Câu hỏi" → `question.title` (hint: hiện trong ngoặc kép — `Daisy: "Where …?"`).
  - Danh sách lựa chọn = details: mỗi hàng = TextInput "Chữ" (`detail.label`, auto A/B/C bằng `nextLetter`) + TextInput "Nội dung" (`detail.text`) + MediaPicker ảnh (`detail.imageUrl`) + **radio "Đáp án đúng"** ghi `question.correctLabel = detail.label` + nút xóa.
  - Nút "+ Thêm lựa chọn" / "+ Thêm câu hỏi".
- **CỐT LÖI — ghi chú in đậm trong code:** đáp án nằm ở `question.correctLabel`, KHÔNG ghi `detail.correctAnswers` cho kind này (grader bỏ qua). Xóa lựa chọn đang là đáp án → `correctLabel = null` (buộc chọn lại).

**Verify:** tạo part multichoice: 1 câu ví dụ + 3 câu thật, mỗi câu 3 lựa chọn text, chọn radio đáp án → Lưu → chơi ở checkpoint → chấm đúng theo radio. Thử 1 part khác: chọn ảnh cho các lựa chọn → preview hiện grid thẻ ảnh.

**Commit:** `feat(editor): form multichoice`

---

## Bước 7 — Form MATCHING

**Mục tiêu:** nối vật phẩm ↔ thẻ chữ.

`form/part-form-matching.tsx`:

- **Khối "Cột phải — thẻ chữ"** = `part.wordBox` (dùng `WordBoxEditor` từ bước 4c): hàng chữ (auto A→B→C) + ảnh (`imageId`). Cảnh báo đỏ inline khi 2 thẻ trùng chữ: *"Hai thẻ cùng chữ 'B' gây hiển thị sai"* (player render `key={label}` — trùng = lỗi React + select trùng giá trị).
- **Khối "Cột trái — vật phẩm"**: mỗi item = 1 question có **đúng 1 detail** (form tự bảo đảm — thêm mới dùng `blankQuestion` + 1 `blankDetail`; nếu dữ liệu cũ có >1 detail → gộp cảnh báo): TextInput "Tên vật phẩm" (`detail.label`) + MediaPicker "Ảnh vật phẩm" (`detail.imageUrl`) + Select "Đáp án đúng" (`detail.correctAnswers = [letter]`, options = các chữ wordBox) + toggle isExample + nút xóa.
- Sync: đổi/xóa chữ ở wordBox → các Select tự lọc; validate bước 11 bắt `"Đáp án 'C' không còn tồn tại"`.

**Verify:** tạo matching 6 thẻ chữ + 6 vật phẩm có ảnh, chọn đáp án → Lưu → chơi → preview 2 cột giống player. Thử trùng chữ → thấy cảnh báo đỏ.

**Commit:** `feat(editor): form matching`

---

## Bước 8 — Form DRAGDROP + Box picker (phần khó nhất)

**Mục tiêu:** chọn ảnh nền, quản lý thẻ kéo, **kéo chuột vẽ ô thả** trên ảnh.

### 8a. `src/components/admin/exam/editor/box-picker/box-picker.tsx` (mới)

Props:

```ts
interface BoxPickerProps {
  imageUrl: string | null
  details: ExamDetail[] // các ô của câu chính
  selectedId: string | null
  onSelect: (id: string) => void
  onDraw: (id: string, box: Box) => void
  onClear: (id: string) => void // xóa box, giữ detail
}
```

**BẪY SỐ 1 — container phải clone đúng player** (`part-dragdrop.tsx:102`): `relative w-full aspect-[1.33] max-w-[680px]` + `<Image fill className="object-contain pointer-events-none select-none">`. Ảnh lệch tỉ lệ 4:3 bị letterbox — tọa độ % tính trên **container**, không phải pixel ảnh. Sai lớp này = ô vẽ lệch chỗ player render.

Logic pointer (state local `useState` — layer 3):

```ts
const [rect, setRect] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null)

function pct(e: React.PointerEvent): { x: number; y: number } {
  const r = overlayRef.current?.getBoundingClientRect()
  if (!r) return { x: 0, y: 0 }
  return {
    x: ((e.clientX - r.left) / r.width) * 100,
    y: ((e.clientY - r.top) / r.height) * 100,
  }
}

function onPointerDown(e: React.PointerEvent): void {
  if (!selectedId) return // chưa chọn ô nào thì không vẽ
  e.currentTarget.setPointerCapture(e.pointerId)
  const p = pct(e)
  setRect({ x0: p.x, y0: p.y, x1: p.x, y1: p.y })
}

function onPointerMove(e: React.PointerEvent): void {
  if (!rect) return
  const p = pct(e)
  setRect((r) => (r ? { ...r, x1: p.x, y1: p.y } : r))
}

function onPointerUp(): void {
  if (!rect) return
  const left = Math.min(rect.x0, rect.x1)
  const top = Math.min(rect.y0, rect.y1)
  const width = Math.abs(rect.x1 - rect.x0)
  const height = Math.abs(rect.y1 - rect.y0)
  setRect(null)
  if (width < 1.5 || height < 1.5) return // quá nhỏ = click nhầm
  if (!selectedId) return
  const r2 = (v: number): string => `${Math.round(v * 100) / 100}%`
  onDraw(selectedId, { left: r2(left), top: r2(top), width: r2(width), height: r2(height) })
}
```

Overlay: `absolute inset-0 touch-none cursor-crosshair` + `onPointerDown/Move/Up` như trên. Hiển thị:

- Rect tạm khi đang vẽ: div absolute từ `rect` (viền dashed brand-primary).
- Box có sẵn của từng detail: div absolute style từ `d.box` — đây cũng là **nút chọn detail** (đang chọn: viền nổi bật; khác: mờ 50%) + nút X góc → `onClear`.
- Khi detail đang chọn có box: 4 NumberInput nhỏ "X / Y / Rộng / Cao (%)" chỉnh tay (clamp 0–100, round 2).
- Chưa có ảnh nền: placeholder viền dashed + *"Chọn ảnh nền trước khi vẽ ô thả"* + nút mở media picker (pointer disabled).

### 8b. `form/part-form-dragdrop.tsx`

Form quản lý **đúng 1 câu chính** (tự tạo nếu chưa có; data cũ có >1 câu không-ví-dụ → cảnh báo *"Player chỉ dùng câu đầu tiên, các câu khác bị bỏ qua"*):

| Control | Ghi vào | Label VI | Bẫy |
| --- | --- | --- | --- |
| MediaPicker image | `question.promptHtml` | "Ảnh nền" | caption nhỏ: *field tên promptHtml nhưng là ĐƯỜNG DẪN ẢNH — player bỏ thẳng vào `<Image src>`* |
| Tags/chips | `question.choices[].label` | "Các thẻ kéo (tên vật phẩm)" | nhập `#ff0000` → preview swatch + tên màu (dùng `isColorCode`/`getColorName` từ `@/lib/exam`) |
| BoxPicker | `question.details[].box` | "Ô thả trên ảnh" | chọn ô → vẽ; mỗi ô có Select "Đáp án đúng" (`detail.correctAnswers = [label]`, options = các thẻ kéo) |

Nút "+ Thêm ô thả" tạo `blankDetail("dragdrop", ...)` rồi chọn nó để vẽ.

**Verify:** tạo part dragdrop: chọn ảnh nền (dùng sẵn `read5_pic1.png`), 3 thẻ kéo, vẽ 5 ô, gán đáp án → Lưu → chơi ở checkpoint → ô hiện đúng vị trí đã vẽ, thả tên đúng → chấm điểm.

**Commit:** `feat(editor): form dragdrop + box picker kéo-vẽ-rect`

---

## Bước 9 — "Chế độ nâng cao" JSON (buffer an toàn 2 chiều)

**Mục tiêu:** JSON quay lại như toggle; nguyên tắc **parse-then-commit** — JSON lỗi không bao giờ ghi đè form.

### `src/components/admin/exam/editor/questions-json-editor.tsx` (mới)

- Store thêm `jsonMode: Record<string, boolean>` + `setJsonMode(partId, on)`.
- Bật JSON: `setJsonText(partId, JSON.stringify(questions, null, 2))` rồi hiện textarea (controlled bởi `jsonTexts[partId]`).
- `onChange` textarea → `setJsonText` + parse:
  - Hợp lệ → debounce 400ms `patchPart(...)` ghi `questions` (field thiếu → null/[] — validate bước 11 sẽ bắt).
  - Lỗi → banner đỏ inline: *"JSON chưa hợp lệ — dữ liệu form giữ nguyên"* + nút **"Bỏ thay đổi"** reset buffer về `stringify(draft)`.
- Tắt JSON khi buffer đang lỗi → chặn + toast/banner tương tự.
- `changePartKind` phải `setJsonText(partId, stringify(questions mới))` + tắt jsonMode (buffer cũ không áp lại part mới).

**Verify:** bật JSON, gõ `{{{` → banner đỏ, toggle về Form bị chặn, bấm "Bỏ thay đổi" → hết lỗi; sửa `"title": "ABC"` hợp lệ → về Form thấy field cập nhật; F12 không có uncaught error.

**Commit:** `feat(editor): advanced JSON mode an toàn 2 chiều`

---

## Bước 10 — Autosave nháp + dirty

### `src/lib/exam/draft.ts` (mới)

```ts
import type { Exam } from "@/types/exam"

const DRAFT_KEY = "ela.exam-draft.v1"

export interface EditorDraft {
  examId: string // literal "new" cho đề mới
  draft: Exam
  jsonTexts: Record<string, string>
  savedAt: string
}

export function loadDraft(): EditorDraft | null { /* guard typeof window, try/catch JSON.parse */ }
export function saveDraft(d: EditorDraft): void { /* try/catch QuotaExceeded → alert 1 lần */ }
export function clearDraft(): void { /* removeItem */ }
```

Wiring trong store: mọi action `patch*`/`setJsonText` → `schedulePersist()` (setTimeout clear-and-set 800ms; force khi bấm "Lưu nháp"). `examId === "new"` dùng literal `"new"` cố định — **BẪY:** `blankExam()` sinh id mới mỗi mount, key theo id thì restore không bao giờ khớp.

- Header thêm nút **"Lưu nháp"**: force persist + toast "Đã lưu nháp", không rời trang, không validate. Nút "Lưu đề" (đổi tên **"Hoàn tất"** ở bước 11) vẫn redirect như cũ.
- Mount editor: `loadDraft()` khớp examId → banner vàng *"Phát hiện bản nháp lúc HH:MM — [Khôi phục] [Bỏ qua]"*; lưu đề thành công → `clearDraft()`.
- `useEffect` đăng ký `beforeunload` khi `dirty` (`e.preventDefault()`).

**Verify:** gõ vài ký tự → đợi 1s → F5 → banner khôi phục hiện → Khôi phục → chữ còn. Lưu đề xong F5 → không còn banner.

**Commit:** `feat(editor): autosave nháp + dirty + beforeunload`

---

## Bước 11 — Validation "Hoàn tất"

### `src/lib/exam/validate.ts` (mới) + `validate.test.ts`

```ts
export interface ValidationIssue {
  level: "error" | "warning"
  partId: string
  questionId?: string
  detailId?: string
  title: string // "Listening — Phần 2 (Kéo & thả)"
  message: string // tiếng Việt: sai ở đâu + cách sửa
}

export function validateExamComplete(exam: Exam): ValidationIssue[]
```

Errors (chặn "Hoàn tất"):

- Chung: tên đề / level trống; structure tên trống, `minutes < 1`; **câu không ví dụ** có detail thiếu `correctAnswers`.
- dragdrop: câu chính thiếu ảnh nền; detail thiếu box — *"Ô số 2 chưa vẽ vị trí trên ảnh"*; đáp án không nằm trong thẻ kéo — *"Ô 1 gán thẻ 'Red' nhưng thẻ không còn tồn tại"*.
- matching: wordBox < 2; trùng chữ; item thiếu cả tên lẫn ảnh; `correctAnswers[0]` không thuộc letters.
- multichoice: câu không ví dụ thiếu title; < 2 lựa chọn; thiếu/label-lạc `correctLabel`.
- gapfill: `{{n}}` không có ô; ô không tham chiếu + không options — *"Ô số 2 sẽ không hiển thị ở đâu"*.
- Media URL không bắt đầu `/` → error (next/image chưa cấu hình remote).

Warnings (không chặn): dragdrop > 1 câu chính; ô có options + không tham chiếu (khối "Choose the best name"); tiêu đề part trống.

UI: bấm "Hoàn tất" → có lỗi: panel đỏ đầu trang nhóm theo part, mỗi issue là nút `scrollIntoView` tới `part-card` (ref map `id="part-<partId>"`) + viền đỏ card + badge số lỗi. Sạch → chạy `examSchema.safeParse` (cửa cuối phòng field lạ) → lưu. Viết test theo pattern `grade.test.ts`: đề trống, đủ-sạch, từng kind 1 lỗi.

**Verify:** bấm "Hoàn tất" với đề thiếu đáp án → danh sách lỗi tiếng Việt, click lỗi → scroll đúng part. Sửa hết → lưu được. `npm run test` xanh.

**Commit:** `feat(editor): validation hoàn tất + panel lỗi tiếng Việt`

---

## Bước 12 — Polish + gates

- Barrel `index.ts` cho `editor/`, `editor/form/`, `box-picker/`, `admin/media/` (nếu chưa) + export `src/lib/exam/index.ts` thêm `validateExamComplete`, draft helpers, factories.
- Dọn: xóa field MediaPicker "tạm" bước 3 (đã có chỗ đúng), xóa code chết.
- Gates:

```bash
npm run format && npm run lint && npx tsc --noEmit && npm run build && npm run test
```

(7 lỗi lint cũ ở `testlevels/*` + `_webclone/capture-flyer.js` không liên quan — muốn xanh hẳn: `npx eslint src/components/testlevels src/app/testlevels --fix`.)

### Checklist tay cuối (kịch bản non-tech trọn vẹn)

1. Tạo đề mới → 2 structure → thêm 4 part (mỗi kind 1 cái) **không đụng JSON lần nào** → Hoàn tất sạch lỗi.
2. `/check-point/{id}` làm bài đủ 4 part → submit → điểm đúng → Xem đáp án tick/X đủ 4 kind.
3. Box picker: vẽ 5 ô trên ảnh → ô player hiện đúng chỗ đã vẽ.
4. Media picker: chọn 1 audio cho part Listening (phát được), 1 ảnh ngoài cho part Reading (bị chặn/cảnh báo).
5. Bật "Chế độ nâng cao" → gõ JSON sai → form không mất → sửa đúng → form cập nhật.
6. Gõ nửa chừng → F5 → banner khôi phục nháp → Khôi phục được.

---

## Bảng bẫy tổng hợp (in ra nhắc khi code)

| # | Bẫy | Chỗ |
| --- | --- | --- |
| 1 | `promptHtml` của dragdrop là **Image src**, không phải HTML | form-dragdrop |
| 2 | Box % tính trên container `aspect-[1.33]` + `object-contain` (letterbox!) — clone đúng lớp player | box-picker |
| 3 | Matching: player chỉ dùng `details[0]`; đáp án = letter wordBox; trùng chữ = React key trùng | form-matching |
| 4 | Multichoice: đáp án ở `question.correctLabel`; grader bỏ qua `detail.correctAnswers` | form-multichoice |
| 5 | Gapfill: `detail.label` phải là **số** (regex `{{\d+}}`); form-rows chỉ replace lần đầu `{{n}}` | form-gapfill |
| 6 | `loadExams` filter `examSchema.safeParse` — **field lạ làm đề biến mất** | mọi form |
| 7 | Audio chỉ phát ở structure 0 | part-settings |
| 8 | URL remote → next/image crash (chưa cấu hình `images.remotePatterns`) | media-picker |
| 9 | Draft key đề mới = literal `"new"` | draft.ts |
| 10 | Đổi kind: `blankPart` giữ mỗi id/title — mất wordBox/imageUrl/audioUrl → confirm nêu đủ | part-card |
| 11 | dragdrop: player chỉ render câu không-ví-dụ **đầu tiên** | form-dragdrop |
| 12 | `output: 'standalone'` deploy không copy `public/` → API media trả rỗng — ghi hướng dẫn copy trong thông báo lỗi | route.ts |
