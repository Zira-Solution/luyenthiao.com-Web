import type {
  Exam,
  ExamDetail,
  ExamPart,
  ExamQuestion,
  ExamStructure,
  PartKind,
  WordBoxItem,
} from "@/types/exam"

/**
 * Mô tả dữ liệu JSON gốc kiểu GraphQL-ish (từ mock `exam-*.json`).
 * Chỉ khai báo những trường normalize cần đọc.
 */

interface RawFormattedText {
  format?: string | null
  label?: string | null
  text?: string | null
}

interface RawBox {
  left: string
  top: string
  width: string
  height: string
}

interface RawImage {
  imageId?: string | null
  label?: string | null
}

interface RawContentBody {
  formattedText?: RawFormattedText | null
  images?: RawImage[] | null
}

interface RawContent {
  body?: RawContentBody | null
}

interface RawDetailResult {
  isSelected?: boolean | null
  value?: string[] | null
  formattedValue?: RawFormattedText | null
}

interface RawQuestionDetail {
  id: string
  labelOrder?: string | null
  detail?: {
    formattedText?: RawFormattedText | null
    box?: RawBox | null
  } | null
  result?: RawDetailResult | null
}

interface RawRawQuestion {
  isExample?: boolean | null
  id: string
  title?: string | null
  content?: RawFormattedText | null
  choices?: RawFormattedText[] | null
  details?: RawQuestionDetail[] | null
}

interface RawNode {
  examPartId?: string | null
  partType?: string | null
  title?: string | null
  contents?: RawContent[] | null
  questions?: RawRawQuestion[] | null
}

interface RawPartEntry {
  node: RawNode
}

interface RawStructure {
  structureType?: { name?: string | null } | null
  time?: string | null
  parts?: RawPartEntry[] | null
}

export interface RawCheckPoint {
  id?: string | null
  checkPointId?: string | null
  checkPointID?: string | null
  name?: string | null
  testLevel?: { slug?: string | null; name?: string | null } | null
  examStructures?: RawStructure[] | null
}

const partKindMap: Record<string, PartKind> = {
  dragdrop: "dragdrop",
  matching_images: "matching",
  matching: "matching",
  multichoice: "multichoice",
  gapfill: "gapfill",
}

function parseMinutes(structureName: string, time?: string | null): number {
  const matchTime = /PT(\d+)M/.exec(time ?? "")
  if (matchTime?.[1]) return Number(matchTime[1])
  return structureName.toLowerCase().includes("listening") ? 35 : 30
}

function stripTags(input: string): string {
  return input.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

/**
 * MOCK_FIXUP: các URL ảnh `/image/<hash>` trong data mock trỏ tới backend không tồn tại.
 * Map sang file clone-assets có sẵn để giữ render giống bản cũ.
 */
const MOCK_IMAGE_FIXUP: Record<string, string> = {
  "/image/9f7d55216cb248e3ab1d3eb51d626daa": "/clone-assets/exam-media/read5_pic1.png",
  "/image/208ecb080ede4876aa4e45e773cd9554": "/clone-assets/exam-media/read5_pic2.png",
  "/image/70895b324fe54794893ff503411a5775": "/clone-assets/exam-media/read5_pic3.png",
  "/image/76b2ef81312b49b1815566018c25a6a9": "/clone-assets/exam-media/read6.png",
}

function applyMockImageFixups(text: string): string {
  let out = text
  Object.entries(MOCK_IMAGE_FIXUP).forEach(([from, to]) => {
    out = out.split(from).join(to)
  })
  return out
}

/** Parse bảng từ (RW4) từ extraHtml → options theo từng label. */
function parseWordOptionRows(html: string): Record<string, string[]> {
  const rows: Record<string, string[]> = {}
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
  let rowMatch: RegExpExecArray | null
  while ((rowMatch = rowRegex.exec(html)) !== null) {
    const rowHtml = rowMatch[1]
    if (!rowHtml) continue
    const cells = Array.from(
      rowHtml.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi),
      (c) => stripTags(c[1] ?? ""),
    )
    if (cells.length < 2) continue
    const key = cells.shift()
    if (key && /^\d+$/.test(key)) rows[key] = cells
  }
  return rows
}

function isHtmlExtra(
  content: RawContent,
): { format?: string | null; text?: string | null; html: boolean } {
  const ft = content.body?.formattedText
  const format = ft?.format ?? null
  const text = ft?.text ?? null
  const looksHtml = format === "HTML" || (format === "TEXT" && (text ?? "").trim().startsWith("<"))
  return { format, text, html: looksHtml }
}

function normalizeDetail(
  raw: RawQuestionDetail,
  kind: PartKind,
  options?: string[],
): ExamDetail {
  const ft = raw.detail?.formattedText
  const box = raw.detail?.box
  const resultValue = raw.result?.value ?? null
  const formattedValue = raw.result?.formattedValue?.text ?? null

  let label = raw.labelOrder ?? ""
  let imageUrl: string | null = null
  let text: string | null = null
  if (kind === "gapfill" && ft?.text) label = ft.text
  else if (kind === "matching") {
    label = ft?.label ?? raw.labelOrder ?? ""
    imageUrl = ft?.text ?? null
  } else if (kind === "multichoice") {
    if (ft?.format === "IMAGE_ID") imageUrl = ft.text ?? null
    else text = ft?.text ?? null
  }

  const correctAnswers = resultValue && resultValue.length > 0
    ? resultValue
    : formattedValue
      ? [formattedValue]
      : []

  return {
    id: raw.id,
    label,
    box: box
      ? { left: box.left, top: box.top, width: box.width, height: box.height }
      : null,
    imageUrl,
    ...(text ? { text } : {}),
    correctAnswers,
    ...(options ? { options } : {}),
  }
}

/**
 * MOCK_FIXUP: RW3 (READ THE STORY) — detail "6" (chọn tên truyện) thiếu text
 * cho 3 lựa chọn A/B/C. Gán options đầy đủ + đáp án đúng là câu (để chấm đúng).
 */
const STORY_TITLE_OPTIONS = [
  "Jim had a weird dream",
  "Jim’s dad visits the castle",
  "Jim fights a monster",
]

function applyStoryTitleFixup(question: ExamQuestion): void {
  for (const detail of question.details) {
    if (detail.label === "6" && detail.options == null) {
      detail.options = STORY_TITLE_OPTIONS
      detail.correctAnswers = [STORY_TITLE_OPTIONS[0] as string]
    }
  }
}

function normalizeQuestion(
  raw: RawRawQuestion,
  kind: PartKind,
  wordBox: WordBoxItem[] | undefined,
  extraHtmlOptions: Record<string, string[]>,
): ExamQuestion {
  const details = (raw.details ?? []).filter((d) => d && d.id)

  const question: ExamQuestion = {
    id: raw.id,
    isExample: Boolean(raw.isExample),
    title: raw.title ?? null,
    promptHtml: raw.content?.text ? applyMockImageFixups(raw.content.text) : null,
    choices: (raw.choices ?? [])
      .filter((c) => c?.text)
      .map((c) => ({ label: c.text as string })),
    correctLabel: null,
    details: details.map((d) => {
      const perDetailOptions =
        extraHtmlOptions[d.labelOrder ?? ""] ?? undefined
      return normalizeDetail(d, kind, perDetailOptions)
    }),
  }

  // multichoice: hoist detail có result.isSelected → correctLabel
  if (kind === "multichoice") {
    const selected = details.find((d) => d.result?.isSelected)
    question.correctLabel = selected?.labelOrder ?? null
  }

  // gapfill: mở rộng options theo dữ liệu có sẵn (wordBox / story fixup)
  if (kind === "gapfill") {
    if (extraHtmlOptions) {
      // đã gán per-detail ở trên
    } else if (wordBox && wordBox.length > 0) {
      for (const detail of question.details) {
        if (detail.options == null) {
          detail.options = wordBox.map((w) => w.label)
        }
      }
    }
    applyStoryTitleFixup(question)
  }

  return question
}

function normalizePart(raw: RawNode): ExamPart {
  const node = raw
  const kind = partKindMap[node.partType ?? ""] ?? "gapfill"

  let audioUrl: string | null = null
  let imageUrl: string | null = null
  let wordBox: WordBoxItem[] | undefined
  let extraHtml: string | null = null
  let extraHtmlOptions: Record<string, string[]> = {}

  for (const content of node.contents ?? []) {
    const { html, text } = isHtmlExtra(content)
    if (html) {
      if (text && /<table/i.test(text)) {
        // bảng từ (RW4) → giữ làm extraHtml + parse options
        extraHtml = text
        extraHtmlOptions = parseWordOptionRows(text)
      } else if (text && !imageUrl) {
        // HTML không phải bảng → trích ảnh bìa (ví dụ RW6)
        const imgMatch = /<img[^>]+src="([^"]+)"/i.exec(text)
        if (imgMatch && imgMatch[1]) imageUrl = applyMockImageFixups(imgMatch[1])
      }
      continue
    }
    const ft = content.body?.formattedText
    if (ft?.format === "AUDIO_ID") audioUrl = ft.text ?? null
    else if (ft?.format === "IMAGE_ID") imageUrl = ft.text ? applyMockImageFixups(ft.text) : null
    if (Array.isArray(content.body?.images)) {
      wordBox = (content.body?.images ?? [])
        .filter((img) => img && img.label)
        .map((img) => ({ label: img.label as string, imageId: img.imageId ?? null }))
    }
  }

  const questions = (node.questions ?? [])
    .filter((q) => q && q.id)
    .map((q) => normalizeQuestion(q, kind, wordBox, extraHtmlOptions))

  return {
    id: node.examPartId ?? "",
    kind,
    title: node.title ?? "",
    ...(audioUrl ? { audioUrl } : {}),
    ...(imageUrl ? { imageUrl } : {}),
    ...(wordBox && wordBox.length > 0 ? { wordBox } : {}),
    ...(extraHtml ? { extraHtml } : {}),
    questions,
  }
}

export function normalizeExam(raw: RawCheckPoint): Exam | null {
  if (!raw) return null
  const structures: ExamStructure[] = (raw.examStructures ?? [])
    .filter((s) => s && s.parts?.length)
    .map((s, idx) => {
      const structureName = s.structureType?.name ?? `Structure ${idx + 1}`
      return {
        id: `${raw.checkPointId ?? raw.id ?? "exam"}:${idx}`,
        name: structureName,
        minutes: parseMinutes(structureName, s.time),
        parts: (s.parts ?? [])
          .filter((p) => p && p.node)
          .map((p) => normalizePart(p.node)),
      }
    })

  const exam: Exam = {
    id: raw.checkPointId ?? raw.checkPointID ?? raw.id ?? "",
    name: raw.name ?? "",
    levelSlug: raw.testLevel?.slug ?? "",
    levelName: raw.testLevel?.name ?? "",
    structures,
  }

  return exam
}