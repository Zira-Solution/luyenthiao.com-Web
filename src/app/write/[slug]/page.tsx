import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { WritingFlow } from "@/components/writing";
import writingDataJson from "@/mocks/writing.json";
import type { WritingTest } from "@/types/writing";



const writingData: WritingTest = writingDataJson as WritingTest

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== writingData.id) {
    return {
      title: "Không tìm thấy bài viết",
      description: "Bài thi viết không tồn tại.",
      keywords: ["tieng anh", "luyen thi", "flyer", "bai viet"],
      alternates: { canonical: `/write/${slug}` },
      openGraph: {
        title: "Không tìm thấy bài viết",
        description: "Bài thi viết không tồn tại.",
      },
    };
  }
  return {
    title: `${writingData.name} - Luyện thi`,
    description: "Bài thi viết theo chủ đề FLYER — viết câu chuyện dựa trên ba bức tranh.",
    keywords: ["tieng anh", "luyen thi", "flyer", "bai viet", "writing"],
    alternates: { canonical: `/write/${slug}` },
    openGraph: {
      title: `${writingData.name} - Luyện thi`,
      description: "Bài thi viết theo chủ đề FLYER.",
    },
  };
}

export default async function WritingTestPage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params;
  if (slug !== writingData.id) notFound();

  return <WritingFlow test={writingData} />;
}