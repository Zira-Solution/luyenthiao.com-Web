import type { Metadata } from "next";

import { NotebookView } from "@/components/notebook";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Sổ tay từ vựng",
  description: "Tra cứu và ôn lại những từ vựng tiếng Anh bạn đã lưu.",
  keywords: ["sổ tay từ vựng", "từ vựng tiếng Anh", "ôn từ vựng"],
  alternates: { canonical: ROUTES.NOTEBOOK },
  openGraph: {
    title: "Sổ tay từ vựng | luyenthiao.com",
    description: "Tra cứu và ôn lại những từ vựng tiếng Anh bạn đã lưu.",
    url: ROUTES.NOTEBOOK,
    type: "website",
  },
};

export default function NotebookPage(): React.ReactElement {
  return <NotebookView />;
}
