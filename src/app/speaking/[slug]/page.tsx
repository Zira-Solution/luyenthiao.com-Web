import type { Metadata } from "next";
import { notFound } from "next/navigation";

import speakingDataJson from "../../../../_webclone/design-model/mocks/speaking.json";

import { SpeakingFlow } from "@/components/speaking";
import type { SpeakingTest } from "@/types/speaking";


const speakingData: SpeakingTest = speakingDataJson as SpeakingTest;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const found = slug === speakingData.id;
  return {
    title: found ? `${speakingData.name} - Luyện thi` : "Không tìm thấy bài Nói",
    description: "Bài thi Nói theo chủ đề STARTERS — nghe và trả lời bằng giọng nói.",
    keywords: ["tieng anh", "luyen thi", "flyer", "starters", "bai noi", "speaking"],
    alternates: { canonical: `/speaking/${slug}` },
    openGraph: {
      title: found ? `${speakingData.name} - Luyện thi` : "Không tìm thấy bài Nói",
      description: "Bài thi Nói theo chủ đề STARTERS.",
    },
  };
}

export default async function SpeakingTestPage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  if (slug !== speakingData.id) notFound();

  return <SpeakingFlow test={speakingData} />;
}