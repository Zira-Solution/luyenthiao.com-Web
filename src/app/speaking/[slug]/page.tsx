import type { Metadata } from 'next'

import { SpeakingFlowRoute } from '@/components/speaking'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  return {
    title: 'Bài thi Nói - Luyện thi',
    description: 'Bài thi Nói tiếng Anh trực tuyến — nghe và trả lời bằng giọng nói.',
    alternates: { canonical: `/speaking/${slug}` },
  }
}

export default async function SpeakingTestPage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params
  return <SpeakingFlowRoute slug={slug} />
}
