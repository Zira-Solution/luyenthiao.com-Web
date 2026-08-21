/**
 * Kiểu dữ liệu cho đề bài thi Nói (STARTERS Speaking Test) — dữ liệu thật lấy
 * từ API exam.flyer.us/speaking (GraphQL checkPoint). Mọi hình ảnh là asset thật
 * đã thu hoạch về public/clone-assets/speaking/.
 */

/** Dạng thao tác (phần tương tác không cần ghi âm). */
export type SpeakingSlideKind =
  | "scene-mark" // Phần 1a (find_object_1): bấm vào đúng vật trong bức tranh cảnh.
  | "choose-object" // Phần 1b (find_object_2): chọn đúng ảnh trong các lựa chọn.
  | "drag-object" // Phần 1c (move_object): kéo đồ vật thả vào đúng vị trí trong cảnh.

/** Dạng trả lời bằng ghi âm giọng nói. */
export type SpeakingRecordKind = "mic-answer" | "mic-zoom" | "mic-plain"

export type SpeakingQuestionKind = SpeakingSlideKind | SpeakingRecordKind

/** Một lựa chọn ảnh (Phần 1b). */
export interface SpeakingChoice {
  /** Id ảnh thật từ API (imageId). */
  id: string
  /** Đường dẫn asset đã thu hoạch. */
  src: string
  label: string
  correct: boolean
}

/** Một vật (ô trả lời) nằm trong bức tranh cảnh (Phần 1a/1c). */
export interface SpeakingSceneSlot {
  id: string
  src: string
  label: string
  /** Toạ độ phần trăm so với bức tranh cảnh. */
  top: number
  left: number
  width: number
  height: number
}

/** Đồ vật cần kéo (Phần 1c). */
export interface SpeakingDraggable {
  src: string
  label: string
}

/** Vật được mũi tên chỉ vào (Phần 2). */
export interface SpeakingPointer {
  top: number
  left: number
}

/** Dưới kỳ mục phóng to (Phần 3). */
export interface SpeakingBigImage {
  src: string
  label: string
}

export interface SpeakingQuestion {
  /** Id câu hỏi thật (202, 203, ...). */
  id: string
  kind: SpeakingQuestionKind
  /** Tiêu đề dạng thẻ phần (chỉ hiển thị cho câu đầu mỗi phần). */
  partTitle?: string
  /** Câu tiếng Anh (real: audioSubtitle of the examiner). */
  text: string
  /** Nhãn tiếng Việt ngắn dưới câu (nếu có). */
  vi?: string
  /** Nền bức tranh cảnh (scene image). */
  sceneBg?: string
  /** Phần 1a/1c: các vật trong cảnh. */
  scene?: SpeakingSceneSlot[]
  /** Id vật đáp án đúng (scene-mark). */
  correctSlotId?: string
  /** Phần 1c: đồ vật cần kéo. */
  draggable?: SpeakingDraggable
  /** Id ô đích đúng (drag-object). */
  correctTargetId?: string
  /** Phần 1b: các lựa chọn ảnh. */
  choices?: SpeakingChoice[]
  /** Phần 2: mũi tên chỉ vật. */
  pointer?: SpeakingPointer
  /** Phần 3: dải các thẻ gợi ý + ảnh phóng to. */
  cards?: SpeakingBigImage[]
  zoomCard?: string
}

export interface SpeakingPart {
  id: string
  indexLabel: string // "Part 1a", "Part 2", ...
  title: string
  instruction: string
  questions: SpeakingQuestion[]
}

export interface SpeakingAttempt {
  id: string
  userName: string // "PHÚC"
  flyerId: string
  testTitle: string
  testName: string
  diamond: number
  time: string
  parts: SpeakingPart[]
  submittedAt: string
}

export interface SpeakingTest {
  id: string
  name: string
  attempt: SpeakingAttempt
}

/** Đáp án một câu hỏi trong phiên làm bài (không có backend → giữ ở client). */
export interface SpeakingAnswer {
  questionId: string
  answered: boolean
  detail?: string
  selected?: string
  recorded?: boolean
  duration?: number
}