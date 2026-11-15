import type { Metadata } from "next";

import { PlacementTestView } from "@/components/placement-test";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Kiểm tra đầu vào",
  description: "Làm bài kiểm tra ngắn để biết trình độ tiếng Anh hiện tại của bạn.",
  keywords: ["kiểm tra đầu vào", "test trình độ tiếng Anh", "thi thử"],
  alternates: { canonical: ROUTES.PLACEMENT_TEST },
  openGraph: {
    title: "Kiểm tra đầu vào | luyenthiao.com",
    description: "Làm bài kiểm tra ngắn để biết trình độ tiếng Anh hiện tại của bạn.",
    url: ROUTES.PLACEMENT_TEST,
    type: "website",
  },
};

export default function PlacementTestPage(): React.ReactElement {
  return <PlacementTestView />;
}
