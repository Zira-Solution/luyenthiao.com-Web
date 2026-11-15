import type { WritingTest } from "@/types/writing"

const W = "/placeholders/writing"

export const writingTestMock = {
  id: "writing-demo-1",
  name: "Bài thi Viết mẫu",
  attempt: {
    id: "writing-demo-1-attempt",
    headerBadge: "[FLYERS] Bài thi Viết mẫu",
    headerTitle: "Bài thi Viết mẫu - Writing",
    badge: "Writing",
    maxScore: 5,
    score: 3,
    prompt: {
      title: "Phần 1",
      instruction: "Nhìn ba bức tranh và viết một câu chuyện ngắn (từ 20 từ trở lên).",
      images: [
        { slot: "story-img-1", src: `${W}/story-1.svg`, alt: "A child is flying a kite in the park." },
        { slot: "story-img-2", src: `${W}/story-2.svg`, alt: "The kite is stuck in a tree." },
        { slot: "story-img-3", src: `${W}/story-3.svg`, alt: "Dad helps to get the kite down." },
      ],
      sampleAnswer:
        "Tom is flying his red kite in the park. The wind is very strong and the kite flies into a big tree. Tom is sad. His dad comes and gets the kite down. Tom is happy again.",
    },
    userAnswer: "",
    feedback: {
      comment: "Bài viết kể đủ ba bức tranh và dùng câu đơn giản, dễ hiểu.",
      errors: "Một số động từ chưa chia đúng thì hiện tại tiếp diễn (ví dụ: \"Tom fly\" → \"Tom is flying\").",
      tips: "Thêm từ nối như \"then\", \"after that\" và tính từ miêu tả cảm xúc để câu chuyện sinh động hơn.",
    },
    minutes: 20,
    submittedAt: "2026-11-15T09:00:00.000Z",
  },
} satisfies WritingTest
