import type { Metadata } from 'next'

import { SpeakingResultRoute } from '@/components/speaking'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: 'Kết quả bài Nói - Luyện thi',
    description: 'Kết quả và nhận xét bài thi Nói.',
    alternates: { canonical: `/speaking/result/${id}` },
  }
}

export default async function SpeakingResultPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { id } = await params
  return <SpeakingResultRoute submissionId={id} />
}
