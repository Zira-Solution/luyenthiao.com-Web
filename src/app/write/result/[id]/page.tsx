import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { WritingResultContent } from '@/components/writing'
import { writingTestMock } from '@/mocks/writing'
import type { WritingTest } from '@/types/writing'

const writingData: WritingTest = writingTestMock

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const show = id === writingData.attempt.id
  return {
    title: show ? 'Kết quả bài thi Viết - Luyện thi' : 'Không tìm thấy kết quả',
    description: 'Điểm và nhận xét từ Luyện Thi Ảo AI cho bài thi viết.',
    keywords: ['tieng anh', 'luyen thi', 'luyenthiao', 'ket qua', 'bai viet'],
    alternates: { canonical: `/write/result/${id}` },
    openGraph: {
      title: show ? 'Kết quả bài thi Viết' : 'Không tìm thấy kết quả',
      description: 'Điểm và nhận xét từ Luyện Thi Ảo AI cho bài thi viết.',
    },
  }
}

export default async function WritingResultPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { id } = await params
  if (id !== writingData.attempt.id) notFound()

  return (
    <Suspense
      fallback={
        <main className="bg-page-bg flex h-[100dvh] w-full items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-white" />
        </main>
      }
    >
      <WritingResultContent attempt={writingData.attempt} writeSlug={writingData.id} />
    </Suspense>
  )
}
