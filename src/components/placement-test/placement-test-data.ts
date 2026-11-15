/** Placement-test content shown until the backend serves real questions. */
export interface Question {
  id: number;
  text: string;
  type: "text" | "image";
  options: string[];
  correct: number;
  explanation: string;
  audioText?: string;
}

/** Placement-test content shown until the backend serves real questions. */
export const LEVEL_TESTS = [
  { id: "starters", name: "Starters (Pre A1)", desc: "Dành cho lớp 1, 2. Kiểm tra từ vựng cơ bản và phản xạ nghe.", questionsCount: 3, timeLimit: 60, icon: "🍭" },
  { id: "movers", name: "Movers (A1)", desc: "Dành cho lớp 3, 4. Từ vựng nâng cao và câu đơn.", questionsCount: 3, timeLimit: 90, icon: "🦖" },
  { id: "flyers", name: "Flyers (A2)", desc: "Dành cho lớp 5. Kỹ năng đọc hiểu và đặt câu hỏi phức tạp.", questionsCount: 3, timeLimit: 120, icon: "☁️" },
  { id: "toefl", name: "TOEFL Primary", desc: "Chuẩn quốc tế. Đo lường kỹ năng giao tiếp và ngữ pháp chuẩn.", questionsCount: 3, timeLimit: 150, icon: "🚀" }
];

/** Placement-test content shown until the backend serves real questions. */
export const MOCK_QUESTIONS: Record<string, Question[]> = {
  starters: [
    { id: 1, text: "Chọn từ đúng với hình sau: 🍎", type: "text", options: ["Banana", "Apple", "Orange", "Grape"], correct: 1, explanation: "Apple nghĩa là quả táo." },
    { id: 2, text: "Điền vào chỗ trống: 'This is ___ elephant.'", type: "text", options: ["a", "an", "the", "some"], correct: 1, explanation: "Elephant bắt đầu bằng nguyên âm 'e' nên dùng 'an'." },
    { id: 3, text: "Nhìn vào màu sắc sau 🟦. Đây là màu gì?", type: "text", options: ["Red", "Green", "Blue", "Yellow"], correct: 2, explanation: "Màu xanh dương trong tiếng Anh là Blue." }
  ],
  movers: [
    { id: 1, text: "Chọn từ trái nghĩa với 'heavy' (nặng):", type: "text", options: ["Light", "Hard", "Soft", "Small"], correct: 0, explanation: "Light nghĩa là nhẹ, trái nghĩa với heavy." },
    { id: 2, text: "Điền vào chỗ trống: 'She ___ to school every day.'", type: "text", options: ["go", "goes", "going", "gone"], correct: 1, explanation: "Chủ ngữ ngôi thứ ba số ít 'She' chia động từ thêm -es." },
    { id: 3, text: "Câu nào đúng ngữ pháp?", type: "text", options: ["They is playing soccer.", "They are playing soccer.", "They playing soccer.", "They am playing soccer."], correct: 1, explanation: "Chủ ngữ 'They' đi kèm động từ tobe 'are'." }
  ],
  flyers: [
    { id: 1, text: "Tìm từ đồng nghĩa với 'quick':", type: "text", options: ["Slow", "Fast", "Quiet", "Heavy"], correct: 1, explanation: "Fast đồng nghĩa với quick (nhanh chóng)." },
    { id: 2, text: "Điền vào chỗ trống: 'If it ___ tomorrow, we will stay at home.'", type: "text", options: ["rain", "rains", "will rain", "rained"], correct: 1, explanation: "Mệnh đề điều kiện loại 1 (If + HTĐ)." },
    { id: 3, text: "Chọn từ phù hợp: 'The book ___ was on the table is mine.'", type: "text", options: ["who", "which", "whom", "whose"], correct: 1, explanation: "Mệnh đề quan hệ chỉ vật dùng 'which'." }
  ],
  toefl: [
    { id: 1, text: "Which sentence is correct?", type: "text", options: ["Although she was tired, but she finished her homework.", "Although she was tired, she finished her homework.", "She was tired, although she finished her homework.", "Despite she was tired, she finished her homework."], correct: 1, explanation: "Cấu trúc Although không đi cùng 'but' trong cùng một câu." },
    { id: 2, text: "Choose the correct preposition: 'He is interested ___ studying languages.'", type: "text", options: ["in", "on", "at", "with"], correct: 0, explanation: "Cấu trúc 'interested in' (thích thú với cái gì)." },
    { id: 3, text: "Complete the sentence: 'She hasn't seen her cousin ___ two years.'", type: "text", options: ["since", "for", "ago", "during"], correct: 1, explanation: "Dùng 'for' kèm khoảng thời gian (two years) trong thì Hiện tại hoàn thành." }
  ]
};
