import type { Metadata } from "next";

import { NotificationsView } from "@/components/notifications";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Thông báo",
  description: "Theo dõi kết quả bài thi, lời mời thách đấu và phần thưởng mới.",
  keywords: ["thông báo", "luyện thi tiếng Anh"],
  alternates: { canonical: ROUTES.NOTIFICATIONS },
  openGraph: {
    title: "Thông báo | luyenthiao.com",
    description: "Theo dõi kết quả bài thi, lời mời thách đấu và phần thưởng mới.",
    url: ROUTES.NOTIFICATIONS,
    type: "website",
  },
};

export default function NotificationsPage(): React.ReactElement {
  return <NotificationsView />;
}
