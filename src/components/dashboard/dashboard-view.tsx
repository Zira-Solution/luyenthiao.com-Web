'use client'

import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { EffectCoverflow, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { PlanetDiorama } from '@/components/dashboard/planet-diorama'
import type { Planet } from '@/schemas/planet'

import 'swiper/css'
import 'swiper/css/effect-coverflow'

interface DashboardViewProps {
  /** `null` when the public API call failed. */
  planets: Planet[] | null
  initialSlug?: string
}

export function DashboardView({ planets, initialSlug }: DashboardViewProps): React.ReactElement {
  const router = useRouter()
  const requestedIdx = initialSlug ? (planets?.findIndex((p) => p.slug === initialSlug) ?? -1) : -1
  const startersIdx = planets?.findIndex((p) => p.slug === 'starters') ?? -1
  const initialIndex =
    requestedIdx >= 0
      ? requestedIdx
      : startersIdx >= 0
        ? startersIdx
        : Math.max(0, Math.min(2, (planets?.length ?? 0) - 1))
  const [activePlanetIndex, setActivePlanetIndex] = useState(initialIndex)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const swiperRef = useRef<any>(null)

  const handlePlanetClick = (href: string | null | undefined) => {
    if (href) router.push(href)
  }

  // Bắt click ở container Swiper. Do hiệu ứng 3D coverflow làm hit-test chuột
  // bị lệch (click không chạm đúng phần tử thẻ), ta dựa vào bounding-rect của
  // từng slide xem tọa độ click rơi vào slide nào rồi điều hướng.
  const handleSwiperClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!e.clientX && !e.clientY) {
      // Synthetic click (no coordinates): trust the event target.
      const card = (e.target as HTMLElement).closest<HTMLElement>('[data-planet-slug]')
      if (card) handlePlanetClick(card.dataset.planetHref)
      return
    }
    const slides = Array.from(document.querySelectorAll('.swiper-slide'))
    for (const slide of slides) {
      const r = (slide as HTMLElement).getBoundingClientRect()
      if (
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      ) {
        const card = slide.querySelector<HTMLElement>('[data-planet-slug]')
        if (card) handlePlanetClick(card.dataset.planetHref)
        break
      }
    }
  }

  if (!planets || planets.length === 0) {
    return (
      <div className="relative flex min-h-full w-full flex-col items-center justify-center overflow-hidden">
        <p className="z-10 px-6 text-center text-lg font-bold text-slate-700">
          {planets
            ? 'Chưa có thế giới nào.'
            : 'Tạm thời không tải được dữ liệu, vui lòng thử lại sau.'}
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Background Glow REMOVED: Center stays crystal clear */}

      {/* Custom Prev Button with Frosted Pearl Gold Capsule Style */}
      <button
        className="absolute top-1/2 left-3 z-30 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 focus:outline-none active:scale-95 sm:left-6 md:left-8"
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Thế giới trước"
      >
        <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-amber-300/80 bg-white/85 shadow-[0_8px_20px_rgba(245,158,11,0.2)] backdrop-blur-md transition-colors hover:bg-amber-50 active:translate-y-[2px] md:h-13 md:w-13">
          <span className="-translate-x-[2px] text-base font-black text-amber-600 select-none md:text-2xl">
            ◀
          </span>
        </div>
      </button>

      {/* Swiper Container */}
      <div
        onClick={handleSwiperClick}
        className="relative z-10 mx-auto flex h-full w-full max-w-[1240px] cursor-pointer items-center justify-center overflow-hidden px-2 sm:px-6 md:px-8"
      >
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper
          }}
          effect={'coverflow'}
          grabCursor={false}
          simulateTouch={false}
          preventClicks={false}
          preventClicksPropagation={false}
          centeredSlides={true}
          slidesPerView={1.05}
          initialSlide={initialIndex}
          mousewheel={true}
          breakpoints={{
            360: { slidesPerView: 1.15 },
            480: { slidesPerView: 1.4 },
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 30,
            modifier: 1,
            slideShadows: false,
          }}
          modules={[EffectCoverflow, Mousewheel]}
          className="h-full w-full !py-0 [&_.swiper-wrapper]:items-center"
          onSlideChange={(swiper) => setActivePlanetIndex(swiper.activeIndex)}
        >
          {planets.map((planet, idx) => {
            const isActive = idx === activePlanetIndex
            const distance = Math.abs(idx - activePlanetIndex)
            const isVisible = distance <= 1

            return (
              <SwiperSlide key={planet.slug} className="flex h-full items-center justify-center">
                <div
                  data-planet-slug={planet.slug}
                  data-planet-href={planet.comingSoon ? undefined : planet.href}
                  aria-disabled={planet.comingSoon ? 'true' : undefined}
                  className="flex h-full w-full items-center justify-center"
                >
                  <PlanetDiorama
                    planet={planet}
                    isActive={isActive}
                    isVisible={isVisible}
                    onSelect={() => handlePlanetClick(planet.comingSoon ? undefined : planet.href)}
                  />
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>

      {/* Custom Next Button with Frosted Pearl Gold Capsule Style */}
      <button
        className="absolute top-1/2 right-3 z-30 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 focus:outline-none active:scale-95 sm:right-6 md:right-8"
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Thế giới tiếp theo"
      >
        <div className="relative flex h-11 w-11 items-center justify-center rounded-full border-2 border-amber-300/80 bg-white/85 shadow-[0_8px_20px_rgba(245,158,11,0.2)] backdrop-blur-md transition-colors hover:bg-amber-50 active:translate-y-[2px] md:h-13 md:w-13">
          <span className="translate-x-[2px] text-base font-black text-amber-600 select-none md:text-2xl">
            ▶
          </span>
        </div>
      </button>
    </div>
  )
}
