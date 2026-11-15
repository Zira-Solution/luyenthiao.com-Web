import type { Metadata } from "next";

import { SchoolRankingView } from "@/components/ranking";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Xếp hạng trường",
  description: "So sánh thành tích luyện thi tiếng Anh giữa các trường.",
  keywords: ["xếp hạng trường", "thi đua", "luyện thi tiếng Anh"],
  alternates: { canonical: ROUTES.SCHOOL_RANKING },
  openGraph: {
    title: "Xếp hạng trường | luyenthiao.com",
    description: "So sánh thành tích luyện thi tiếng Anh giữa các trường.",
    url: ROUTES.SCHOOL_RANKING,
    type: "website",
  },
};

export default function SchoolRankingPage(): React.ReactElement {
  return <SchoolRankingView />;
}
