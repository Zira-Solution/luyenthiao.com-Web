import Image from "next/image";
import { notFound } from "next/navigation";

import checkpointData from "../../../../_webclone/design-model/mocks/checkpoints.json";

import { ModeSelectModal } from "@/components/checkpoint/mode-select-modal";

type CheckpointKey = keyof typeof checkpointData;

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const data = checkpointData[id as CheckpointKey];
  if (!data) return { title: "Không tìm thấy đề thi" };
  return {
    title: `${data.levelName} - Thử thách ${data.challengeNumber}`,
    description: `Chọn chế độ làm bài: ${data.levelName} thử thách ${data.challengeNumber}`,
  };
}

export default async function CheckPointPage({ params }: PageProps) {
  const { id } = await params;
  const data = checkpointData[id as CheckpointKey];
  if (!data) notFound();

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden bg-dashboard-bg">
      {/* Full-screen background */}
      <Image
        src="/clone-assets/exam/bg-checkpoint-page.d7e3979b.jpg"
        alt=""
        fill
        priority
        className="object-cover"
      />

      {/* Scaled modal container */}
      <div className="absolute inset-0 overflow-y-auto font-sans">
        <div className="flex flex-col items-center w-full h-full pt-[30px] max-md:-mt-[90px]">
          <div className="origin-top scale-[0.9] max-md:scale-[0.75]">
            <ModeSelectModal data={data} />
          </div>
        </div>
      </div>
    </main>
  );
}
