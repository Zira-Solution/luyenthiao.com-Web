import type { Metadata } from "next";

import { TasksView } from "@/components/tasks";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Nhiệm vụ hằng ngày",
  description: "Hoàn thành nhiệm vụ mỗi ngày để nhận kim cương và xu.",
  keywords: ["nhiệm vụ hằng ngày", "phần thưởng", "luyện thi tiếng Anh"],
  alternates: { canonical: ROUTES.TASKS },
  openGraph: {
    title: "Nhiệm vụ hằng ngày | luyenthiao.com",
    description: "Hoàn thành nhiệm vụ mỗi ngày để nhận kim cương và xu.",
    url: ROUTES.TASKS,
    type: "website",
  },
};

export default function TasksPage(): React.ReactElement {
  return <TasksView />;
}
