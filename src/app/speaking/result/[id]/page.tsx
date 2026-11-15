import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SpeakingResultRoute } from "@/components/speaking";
import { speakingTestMock } from "@/mocks/speaking";
import type { SpeakingTest } from "@/types/speaking";


const speakingData: SpeakingTest = speakingTestMock;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const found = id === speakingData.attempt.id;
  return {
    title: found ? "Kết quả bài Nói - Luyện thi" : "Không tìm thấy kết quả",
    description: "Kết quả và nhận xét bài thi Nói.",
    keywords: ["tieng anh", "luyen thi", "flyer", "ket qua", "bai noi"],
    alternates: { canonical: `/speaking/result/${id}` },
    openGraph: {
      title: found ? "Kết quả bài Nói" : "Không tìm thấy kết quả",
      description: "Kết quả và nhận xét bài thi Nói.",
    },
  };
}

export default async function SpeakingResultPage({ params }: PageProps): Promise<React.ReactElement> {
  const { id } = await params;
  if (id !== speakingData.attempt.id) notFound();

  return <SpeakingResultRoute test={speakingData} />;
}