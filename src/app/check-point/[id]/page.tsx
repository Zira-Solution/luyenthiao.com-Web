import type { Metadata } from 'next'

import { ExamCheckpoint } from '@/components/exam'
import checkpointData from '@/mocks/checkpoints.json'

type CheckpointKey = keyof typeof checkpointData

interface PageProps {
  params: Promise<{ id: string }>
}

const DEFAULT_CHECKPOINT_META = {
  level: 'movers',
  levelName: 'LUYỆN THI',
  challengeNumber: 1,
  totalMinutes: 45,
  parts: [],
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const data = checkpointData[id as CheckpointKey]
  if (id === 'demo') {
    return {
      title: 'Đề thi Demo miễn phí',
      description: 'Trải nghiệm làm đề thi thử chính thức trực tuyến trên Luyenthiao.',
    }
  }
  if (!data) {
    return {
      title: 'Phòng thi trực tuyến',
      description: 'Làm bài thi thử tiếng Anh theo cấu trúc chuẩn Cambridge / TOEFL Primary.',
    }
  }
  return {
    title: `${data.levelName} - Thử thách ${data.challengeNumber}`,
    description: `Chọn chế độ làm bài: ${data.levelName} thử thách ${data.challengeNumber}`,
  }
}

export default async function CheckPointPage({ params }: PageProps) {
  const { id } = await params
  const data = checkpointData[id as CheckpointKey] ?? DEFAULT_CHECKPOINT_META

  return <ExamCheckpoint id={id} initialData={data} />
}
