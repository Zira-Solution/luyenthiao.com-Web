import type { Metadata } from "next";

import { RankingView } from "@/components/ranking";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Bảng xếp hạng",
  description: "Xem thứ hạng học viên theo ngày, tuần, tháng và năm.",
  keywords: ["bảng xếp hạng", "xếp hạng học viên", "luyện thi tiếng Anh"],
  alternates: { canonical: ROUTES.RANKING },
  openGraph: {
    title: "Bảng xếp hạng | luyenthiao.com",
    description: "Xem thứ hạng học viên theo ngày, tuần, tháng và năm.",
    url: ROUTES.RANKING,
    type: "website",
  },
};

export default function RankingPage(): React.ReactElement {
  return <RankingView />;
}
