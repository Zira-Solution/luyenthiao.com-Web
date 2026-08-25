import { notFound } from "next/navigation";

import checkpointData from "../../../../_webclone/design-model/mocks/checkpoints.json";

import { CheckpointClientWrapper } from "@/components/checkpoint/checkpoint-client-wrapper";

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

  return <CheckpointClientWrapper id={id} initialData={data} />;
}
