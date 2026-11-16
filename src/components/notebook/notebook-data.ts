/** Sample vocabulary shown in the notebook until the backend provides the user's own words. */
export interface VocabWord {
  id: string;
  word: string;
  type: string; // noun, verb, adj, etc.
  ipa: string;
  vietnamese: string;
  example: string;
  exampleVietnamese: string;
  level: string;
  starred: boolean;
}

export const MOCK_WORDS: VocabWord[] = [
  {
    id: "1",
    word: "Astronaut",
    type: "noun",
    ipa: "/ˈæstrənɔːt/",
    vietnamese: "Phi hành gia",
    example: "The astronaut floats in outer space.",
    exampleVietnamese: "Phi hành gia trôi nổi trong không gian vũ trụ.",
    level: "Starters (Pre A1)",
    starred: true
  },
  {
    id: "2",
    word: "Adventure",
    type: "noun",
    ipa: "/ədˈventʃə(r)/",
    vietnamese: "Cuộc phiêu lưu",
    example: "We had a big adventure on the dinosaur planet.",
    exampleVietnamese: "Chúng tôi đã có một cuộc phiêu lưu lớn trên hành tinh khủng long.",
    level: "Movers (A1)",
    starred: false
  },
  {
    id: "3",
    word: "Knowledge",
    type: "noun",
    ipa: "/ˈnɒlɪdʒ/",
    vietnamese: "Tri thức, kiến thức",
    example: "Books give us valuable knowledge about the world.",
    exampleVietnamese: "Sách mang lại cho chúng ta tri thức quý giá về thế giới.",
    level: "Flyers (A2)",
    starred: true
  },
  {
    id: "4",
    word: "Challenge",
    type: "noun / verb",
    ipa: "/ˈtʃælɪndʒ/",
    vietnamese: "Thách thức, thử thách",
    example: "Completing this grammar quiz is a fun challenge.",
    exampleVietnamese: "Hoàn thành bài trắc nghiệm ngữ pháp này là một thử thách thú vị.",
    level: "TOEFL Primary",
    starred: false
  },
  {
    id: "5",
    word: "Dinosaur",
    type: "noun",
    ipa: "/ˈdaɪnəsɔː(r)/",
    vietnamese: "Khủng long",
    example: "Dinosaurs lived on Earth millions of years ago.",
    exampleVietnamese: "Khủng long đã sống trên Trái đất hàng triệu năm trước.",
    level: "Movers (A1)",
    starred: true
  },
  {
    id: "6",
    word: "Galaxy",
    type: "noun",
    ipa: "/ˈɡæləksi/",
    vietnamese: "Thiên hà",
    example: "Our planet Earth is part of the Milky Way galaxy.",
    exampleVietnamese: "Trái đất của chúng ta là một phần của thiên hà Milky Way.",
    level: "TOEFL Junior",
    starred: false
  }
];
