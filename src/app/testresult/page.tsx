import type { Metadata } from "next";
import { Suspense } from "react";

import { ExamResultFallback } from "@/components/exam/exam-result-fallback";
import { ExamResultView } from "@/components/exam/exam-result-view";
import { ROUTES } from "@/constants";

export const metadata: Metadata = {
  title: "Kết quả bài thi",
  description: "Xem điểm số và chi tiết kết quả bài thi vừa hoàn thành.",
  keywords: ["kết quả bài thi", "điểm thi thử", "luyện thi tiếng Anh"],
  alternates: { canonical: ROUTES.TEST_RESULT },
  openGraph: {
    title: "Kết quả bài thi | luyenthiao.com",
    description: "Xem điểm số và chi tiết kết quả bài thi vừa hoàn thành.",
    url: ROUTES.TEST_RESULT,
    type: "website",
  },
};

export default function TestResultPage(): React.ReactElement {
  return (
    <Suspense fallback={<ExamResultFallback />}>
      <ExamResultView />
    </Suspense>
  );
}
