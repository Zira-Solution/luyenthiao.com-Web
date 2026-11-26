import type { Metadata } from 'next'
import { Suspense } from 'react'

import { WritingResultRoute } from '@/components/writing'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  return {
    title: 'Kết quả bài thi Viết - Luyện thi',
    description: 'Điểm và nhận xét chi tiết cho bài thi Viết.',
    alternates: { canonical: `/write/result/${id}` },
  }
}

export default async function WritingResultPage({
  params,
}: PageProps): Promise<React.ReactElement> {
  const { id } = await params
  return (
    <Suspense
      fallback={
        <main className="bg-page-bg flex h-[100dvh] w-full items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-white" />
        </main>
      }
    >
      <WritingResultRoute id={id} />
    </Suspense>
  )
}
