import type { Metadata } from 'next'

import { SpeakingPreviewRoute } from '@/components/speaking'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: 'Chi tiết đáp án bài Nói - Luyện thi',
    description: 'Chi tiết đáp án và bản ghi âm của bài thi Nói.',
    alternates: { canonical: `/speaking/result/${id}/preview` },
  }
}

export default async function SpeakingPreviewPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { id } = await params
  return <SpeakingPreviewRoute submissionId={id} />
}
