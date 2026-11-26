import type { Metadata } from 'next'

import { WritingFlowRoute } from '@/components/writing'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  return {
    title: 'Bài thi Viết - Luyện thi',
    description: 'Bài thi viết tiếng Anh trực tuyến trên Luyenthiao.',
    alternates: { canonical: `/write/${slug}` },
  }
}

export default async function WritingTestPage({ params }: PageProps): Promise<React.ReactElement> {
  const { slug } = await params
  return <WritingFlowRoute slug={slug} />
}
