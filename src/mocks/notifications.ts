import type { Notification } from "@/types"

export const notificationsMock = [
  { id: 1, type: "result", title: "Đã có kết quả bài thi", message: "Bài thi Nói mẫu của bạn đã được chấm. Xem điểm và nhận xét ngay nhé!", time: "5 phút trước", read: false },
  { id: 2, type: "challenge", title: "Lời mời thách đấu", message: "Một bạn cùng lớp vừa mời bạn thi đấu từ vựng chủ đề Động vật.", time: "30 phút trước", read: false },
  { id: 3, type: "reward", title: "Nhận thưởng thành công", message: "Bạn đã nhận 20 kim cương từ nhiệm vụ hằng ngày.", time: "2 giờ trước", read: true },
  { id: 4, type: "event", title: "Sự kiện cuối tuần", message: "Tham gia thử thách luyện Nói cuối tuần để nhận huy hiệu đặc biệt.", time: "Hôm qua", read: false },
  { id: 5, type: "system", title: "Bảo trì hệ thống", message: "Hệ thống sẽ bảo trì từ 23:00 đến 23:30 tối thứ Bảy.", time: "2 ngày trước", read: true },
  { id: 6, type: "result", title: "Bài Viết đã được chấm", message: "Bài Viết mẫu đạt 3/5 điểm. Xem gợi ý để cải thiện nhé!", time: "3 ngày trước", read: true },
] satisfies Notification[]
