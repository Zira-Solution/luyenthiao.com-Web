/** Kiểu dữ liệu cho đề bài thi Viết (FLYERS Writing Test). */

export interface WritingStoryImage {
  /** Tên slot ngữ nghĩa — định danh nơi ảnh sẽ render. */
  slot: "story-img-1" | "story-img-2" | "story-img-3"
  /** Đường dẫn ảnh đã promote. `null` = chưa thu hoạch được → render TODO placeholder. */
  src: string | null
  alt: string
}

export interface WritingPrompt {
  /** Tên phần, VD: "Phần 1". */
  title: string
  /** Gợi ý viết gốc từ đề FLYER. */
  instruction: string
  /** Ảnh minh hoạ câu chuyện (3 tấm). */
  images: WritingStoryImage[]
  /** Đáp án mẫu / bài gợi ý (Gợi ý). */
  sampleAnswer: string
}

export interface WritingFeedback {
  /** Nhận xét chung từ FLYER AI. */
  comment: string
  /** Danh sách lỗi sai (dạng đoạn text). */
  errors: string
  /** Gợi ý cải thiện. */
  tips: string
}

export interface WritingAttempt {
  id: string
  /** Tiêu đề bài thi, VD: "[FLYERS] Bài thi Viết 1 - Writing". */
  headerBadge: string
  headerTitle: string
  badge: string
  /** Số điểm tối đa. */
  maxScore: number
  score: number
  prompt: WritingPrompt
  userAnswer: string
  /** Điểm và nhận xét từ FLYER AI cho phần viết. */
  feedback: WritingFeedback
  /** Thời lượng làm bài (phút) hiển thị trên đồng hồ. */
  minutes: number
  submittedAt: string
}

export interface WritingTest {
  id: string
  name: string
  attempt: WritingAttempt
}