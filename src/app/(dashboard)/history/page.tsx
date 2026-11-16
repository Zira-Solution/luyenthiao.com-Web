import type { Metadata } from "next";

import { HistoryView } from "@/components/history";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Lịch sử làm bài",
  description: "Xem lại các bài thi đã làm, lọc theo cấp độ, kỹ năng và thời gian.",
  keywords: ["lịch sử làm bài", "kết quả thi thử", "luyện thi tiếng Anh"],
  alternates: { canonical: ROUTES.HISTORY },
  openGraph: {
    title: "Lịch sử làm bài | luyenthiao.com",
    description: "Xem lại các bài thi đã làm, lọc theo cấp độ, kỹ năng và thời gian.",
    url: ROUTES.HISTORY,
    type: "website",
  },
};

export default function HistoryPage(): React.ReactElement {
  return <HistoryView />;
}
