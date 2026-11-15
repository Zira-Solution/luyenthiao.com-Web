import type { Metadata } from "next";

import { DashboardView } from "@/components/dashboard";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Trang chủ",
  description: "Chọn hành tinh và bắt đầu luyện thi tiếng Anh theo từng cấp độ.",
  keywords: ["luyện thi tiếng Anh", "học tiếng Anh", "thi thử", "trang chủ"],
  alternates: { canonical: ROUTES.HOME },
  openGraph: {
    title: "Trang chủ | luyenthiao.com",
    description: "Chọn hành tinh và bắt đầu luyện thi tiếng Anh theo từng cấp độ.",
    url: ROUTES.HOME,
    type: "website",
  },
};

export default function DashboardPage(): React.ReactElement {
  return <DashboardView />;
}
