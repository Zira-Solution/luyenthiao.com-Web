import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import speakingDataJson from "../../../../../../_webclone/design-model/mocks/speaking.json";

import { SpeakingPreview } from "@/components/speaking";
import type { SpeakingTest } from "@/types/speaking";


const speakingData: SpeakingTest = speakingDataJson as SpeakingTest;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const found = id === speakingData.attempt.id;
  return {
    title: found ? "Chi tiết đáp án bài Nói - Luyện thi" : "Không tìm thấy",
    description: "Chi tiết đáp án và câu trả lời của bài thi Nói.",
    keywords: ["tieng anh", "luyen thi", "flyer", "dap an", "bai noi"],
    alternates: { canonical: `/speaking/result/${id}/preview` },
    openGraph: {
      title: found ? "Chi tiết đáp án bài Nói" : "Không tìm thấy",
      description: "Chi tiết đáp án và câu trả lời của bài thi Nói.",
    },
  };
}

export default async function SpeakingPreviewPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  if (id !== speakingData.attempt.id) notFound();

  return (
    <>
      <SpeakingPreview attempt={speakingData.attempt} />
      <Link href={`/speaking/result/${id}`} className="sr-only">
        Về kết quả bài nói
      </Link>
    </>
  );
}