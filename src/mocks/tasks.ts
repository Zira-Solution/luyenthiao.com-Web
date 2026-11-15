import type { Task } from "@/types"

export const tasksMock = [
  { id: 1, icon: "login", title: "Đăng nhập hôm nay", description: "Đăng nhập vào ứng dụng một lần trong ngày.", progress: 1, target: 1, done: true, rewardType: "coin", rewardValue: 10 },
  { id: 2, icon: "exam", title: "Làm một bài thi thử", description: "Hoàn thành một bài thi thử bất kỳ.", progress: 0, target: 1, done: false, rewardType: "diamond", rewardValue: 20 },
  { id: 3, icon: "vocab", title: "Học 10 từ mới", description: "Lưu 10 từ mới vào sổ tay từ vựng.", progress: 10, target: 10, done: true, rewardType: "coin", rewardValue: 15 },
  { id: 4, icon: "grammar", title: "Ôn ngữ pháp", description: "Làm đúng 5 câu ngữ pháp liên tiếp.", progress: 3, target: 5, done: false, rewardType: "coin", rewardValue: 15 },
  { id: 5, icon: "speaking", title: "Luyện Nói", description: "Hoàn thành một bài thi Nói.", progress: 0, target: 1, done: false, rewardType: "diamond", rewardValue: 25 },
  { id: 6, icon: "writing", title: "Luyện Viết", description: "Nộp một bài thi Viết.", progress: 1, target: 1, done: true, rewardType: "diamond", rewardValue: 25 },
  { id: 7, icon: "challenge", title: "Thách đấu bạn bè", description: "Thắng 2 trận thách đấu.", progress: 1, target: 2, done: false, rewardType: "coin", rewardValue: 30 },
  { id: 8, icon: "trophy", title: "Leo bảng xếp hạng", description: "Đạt 100 điểm trong ngày.", progress: 60, target: 100, done: false, rewardType: "diamond", rewardValue: 40 },
] satisfies Task[]
