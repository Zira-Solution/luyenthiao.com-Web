import type { SpeakingTest } from "@/types/speaking"

const P = "/placeholders/speaking"

const SCENE = `${P}/park-scene.svg`

const MARK_SLOTS = [
  { id: "slot-ball", src: `${P}/ball.svg`, label: "ball", top: 79.44, left: 23.75, width: 7.5, height: 10 },
  { id: "slot-cat", src: `${P}/cat.svg`, label: "cat", top: 80.8, left: 49.5, width: 11.6, height: 12 },
  { id: "slot-kite", src: `${P}/kite.svg`, label: "kite", top: 12.7, left: 49.5, width: 7.6, height: 16.7 },
]

const DROP_TARGETS = [
  { id: "target-bench", src: "", label: "bench", top: 60, left: 40, width: 25, height: 11.2 },
  { id: "target-pond", src: "", label: "pond", top: 72.2, left: 65, width: 28.4, height: 15.6 },
  { id: "target-tree", src: "", label: "tree", top: 18.8, left: 1.6, width: 21.8, height: 46.8 },
]

export const speakingTestMock = {
  id: "speaking-demo-1",
  name: "Bài thi Nói mẫu",
  attempt: {
    id: "speaking-demo-1-attempt",
    userName: "Bạn nhỏ",
    flyerId: "DEMO-0001",
    testTitle: "[STARTERS] Bài thi Nói mẫu",
    testName: "Speaking Demo 1",
    diamond: 10,
    time: "05:00",
    submittedAt: "2026-11-15T09:00:00.000Z",
    parts: [
      {
        id: "part-1a",
        indexLabel: "Part 1a",
        title: "Tìm đồ vật trong tranh",
        instruction: "Nghe câu hỏi và bấm vào đúng đồ vật trong bức tranh.",
        questions: [
          { id: "q-1a-1", kind: "scene-mark", partTitle: "Tìm đồ vật trong tranh", text: "Where is the ball?", vi: "Quả bóng ở đâu?", sceneBg: SCENE, scene: MARK_SLOTS, correctSlotId: "slot-ball" },
          { id: "q-1a-2", kind: "scene-mark", text: "Where is the cat?", vi: "Con mèo ở đâu?", sceneBg: SCENE, scene: MARK_SLOTS, correctSlotId: "slot-cat" },
        ],
      },
      {
        id: "part-1b",
        indexLabel: "Part 1b",
        title: "Chọn đúng hình",
        instruction: "Nghe câu hỏi và chọn đúng hình.",
        questions: [
          {
            id: "q-1b-1",
            kind: "choose-object",
            partTitle: "Chọn đúng hình",
            text: "Which one is an apple?",
            vi: "Hình nào là quả táo?",
            choices: [
              { id: "choice-apple", src: `${P}/apple.svg`, label: "apple", correct: true },
              { id: "choice-ball", src: `${P}/ball.svg`, label: "ball", correct: false },
              { id: "choice-book", src: `${P}/book.svg`, label: "book", correct: false },
              { id: "choice-hat", src: `${P}/hat.svg`, label: "hat", correct: false },
            ],
          },
        ],
      },
      {
        id: "part-1c",
        indexLabel: "Part 1c",
        title: "Đặt đồ vật vào tranh",
        instruction: "Chọn đúng đồ vật rồi bấm vào vị trí đúng trong tranh.",
        questions: [
          {
            id: "q-1c-1",
            kind: "drag-object",
            partTitle: "Đặt đồ vật vào tranh",
            text: "Put the cat on the bench.",
            vi: "Đặt con mèo lên ghế.",
            sceneBg: SCENE,
            scene: DROP_TARGETS,
            palette: [
              { id: "obj-cat", src: `${P}/cat.svg`, label: "cat" },
              { id: "obj-dog", src: `${P}/dog.svg`, label: "dog" },
              { id: "obj-book", src: `${P}/book.svg`, label: "book" },
            ],
            correctDraggableId: "obj-cat",
            correctTargetId: "target-bench",
          },
        ],
      },
      {
        id: "part-2",
        indexLabel: "Part 2",
        title: "Trả lời về bức tranh",
        instruction: "Nhìn mũi tên và trả lời câu hỏi bằng giọng nói.",
        questions: [
          // `pointer` is in the 0..100 viewBox of the overlay in `PointerPrompt`, not a percentage
          // of the picture. The overlay is letterboxed (`xMidYMid meet`), so in the 1200x900 scene
          // `x = 150 + left * 9` and `y = top * 9`, and the pin disc is 90px across — wider than
          // most objects. Put the pin DOWN-RIGHT of its target (the pin's spike points up-left, so
          // it then aims at the object) and far enough away not to cover it.
          // q-2-1 -> (321, 468), spike aims at the tree crown (150, 300).
          { id: "q-2-1", kind: "mic-answer", partTitle: "Trả lời về bức tranh", text: "What's this?", vi: "Đây là gì?", sceneBg: SCENE, pointer: { top: 52, left: 19 } },
          // q-2-2 -> (780, 306), spike aims at the kite (640, 170) without touching it: the
          // question asks about the kite's colour, so the red pin must not sit on top of it.
          { id: "q-2-2", kind: "mic-answer", text: "What colour is the kite?", vi: "Con diều màu gì?", sceneBg: SCENE, pointer: { top: 34, left: 70 } },
        ],
      },
      {
        id: "part-3",
        indexLabel: "Part 3",
        title: "Nói về thẻ hình",
        instruction: "Nhìn thẻ hình được phóng to và trả lời câu hỏi.",
        questions: [
          {
            id: "q-3-1",
            kind: "mic-zoom",
            partTitle: "Nói về thẻ hình",
            text: "Tell me about the dog.",
            vi: "Hãy nói về chú chó.",
            cards: [
              { src: `${P}/dog.svg`, label: "dog" },
              { src: `${P}/bike.svg`, label: "bike" },
              { src: `${P}/hat.svg`, label: "hat" },
              { src: `${P}/book.svg`, label: "book" },
            ],
            zoomCard: `${P}/dog.svg`,
          },
        ],
      },
      {
        id: "part-4",
        indexLabel: "Part 4",
        title: "Nói về bản thân",
        instruction: "Trả lời câu hỏi về bản thân bằng giọng nói.",
        questions: [
          { id: "q-4-1", kind: "mic-plain", partTitle: "Nói về bản thân", text: "What's your name?", vi: "Bạn tên là gì?" },
          { id: "q-4-2", kind: "mic-plain", text: "How old are you?", vi: "Bạn bao nhiêu tuổi?" },
        ],
      },
    ],
  },
} satisfies SpeakingTest
