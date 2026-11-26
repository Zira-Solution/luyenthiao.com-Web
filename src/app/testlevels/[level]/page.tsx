import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { LevelHeader, LevelMap } from '@/components/testlevels'
import { getPlanets, getPublicExams } from '@/lib/api/public'
import levelData from '@/mocks/testlevels.json'

type LevelKey = keyof typeof levelData

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ level: string }>
}

const DEFAULT_MAP_BG = '/clone-assets/exam/bg-map.73c46437.jpg'
const DEFAULT_MOBILE_BG = '/clone-assets/exam/bg-back-m.1d28391b.png'

async function resolveLevelData(level: string) {
  const [planetsRes, examsRes] = await Promise.all([getPlanets(), getPublicExams(level)])
  const remotePlanet = planetsRes.ok ? planetsRes.data.find((p) => p.slug === level) : undefined
  const mockFallback = levelData[level as LevelKey]

  if (!remotePlanet && !mockFallback) {
    return null
  }

  const name = remotePlanet?.name || mockFallback?.name || level.toUpperCase()
  const total = remotePlanet?.mapTotal ?? mockFallback?.total ?? 200
  const mapBackground = remotePlanet?.mapBackground || mockFallback?.mapBackground || DEFAULT_MAP_BG
  const mobileBackground = mockFallback?.mobileBackground || DEFAULT_MOBILE_BG
  const exams = examsRes.ok ? examsRes.data : undefined

  return {
    exams,
    mapData: {
      name,
      total: Math.max(total, exams?.length ?? 0),
      unlocked: exams ? exams.length : (mockFallback?.unlocked ?? 0),
      mapBackground,
      mobileBackground,
    },
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { level } = await params
  const resolved = await resolveLevelData(level)

  if (!resolved) {
    return {
      title: 'Không tìm thấy cấp độ',
      description: 'Cấp độ học không tồn tại.',
      keywords: ['tieng anh', 'luyen thi', 'luyenthiao', 'movers'],
      alternates: { canonical: `/testlevels/${level}` },
      openGraph: {
        title: 'Không tìm thấy cấp độ',
        description: 'Cấp độ học không tồn tại.',
      },
    }
  }

  const { mapData } = resolved
  return {
    title: `${mapData.name} - Luyện thi`,
    description: `Chọn thử thách cho bộ đề ${mapData.name}`,
    keywords: ['tieng anh', 'luyen thi', 'luyenthiao', level, mapData.name.toLowerCase()],
    alternates: { canonical: `/testlevels/${level}` },
    openGraph: {
      title: `${mapData.name} - Luyện thi`,
      description: `Chọn thử thách cho bộ đề ${mapData.name}`,
      images: [
        {
          url: mapData.mapBackground,
          width: 1200,
          height: 630,
          alt: `${mapData.name} map`,
        },
      ],
    },
  }
}

export default async function TestLevelsPage({ params }: PageProps): Promise<React.ReactElement> {
  const { level } = await params
  const resolved = await resolveLevelData(level)

  if (!resolved) notFound()

  const { mapData, exams } = resolved

  return (
    <main className="bg-page-bg relative min-h-screen w-full overflow-x-hidden">
      <LevelHeader levelName={mapData.name} examIds={exams?.map((e) => e.id)} />
      {exams && exams.length === 0 && (
        <div className="fixed bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-amber-300/60 bg-slate-900/85 px-4 py-2.5 text-xs font-bold text-white shadow-xl backdrop-blur">
          <span>Hành tinh này chưa có đề chính thức —</span>
          <Link
            href="/check-point/demo"
            className="rounded-xl bg-amber-400 px-3 py-1 text-slate-950 transition hover:bg-amber-300"
          >
            Thử Đề Demo
          </Link>
        </div>
      )}
      <LevelMap level={mapData} exams={exams} />
    </main>
  )
}
