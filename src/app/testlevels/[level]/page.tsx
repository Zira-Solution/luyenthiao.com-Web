import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LevelHeader, LevelMap } from "@/components/testlevels";

import levelData from "../../../../_webclone/design-model/mocks/testlevels.json";

type LevelKey = keyof typeof levelData;

interface PageProps {
  params: Promise<{ level: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level } = await params;
  const data = levelData[level as LevelKey];
  
  if (!data) {
    return {
      title: "Không tìm thấy cấp độ",
      description: "Cấp độ học không tồn tại.",
      keywords: ["tieng anh", "luyen thi", "flyer", "movers"],
      alternates: { canonical: `/testlevels/${level}` },
      openGraph: {
        title: "Không tìm thấy cấp độ",
        description: "Cấp độ học không tồn tại.",
      },
    };
  }

  return {
    title: `${data.name} - Luyện thi`,
    description: `Chọn thử thách cho bộ đề ${data.name}`,
    keywords: ["tieng anh", "luyen thi", "flyer", "movers", data.name.toLowerCase()],
    alternates: { canonical: `/testlevels/${level}` },
    openGraph: {
      title: `${data.name} - Luyện thi`,
      description: `Chọn thử thách cho bộ đề ${data.name}`,
      images: [
        {
          url: data.mapBackground,
          width: 1200,
          height: 630,
          alt: `${data.name} map`,
        },
      ],
    },
  };
}

export default async function TestLevelsPage({ params }: PageProps): Promise<React.ReactElement> {
  const { level } = await params;
  const data = levelData[level as LevelKey];
  
  if (!data) notFound();

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden bg-page-bg">
      <LevelHeader levelName={data.name} />
      <LevelMap level={data} />
    </main>
  );
}
