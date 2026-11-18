'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useRef } from 'react'
import { EffectCoverflow, Mousewheel } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { cn } from '@/lib/utils'
import type { Planet } from '@/schemas/planet'

import 'swiper/css'
import 'swiper/css/effect-coverflow'

const ABSOLUTE_URL = /^https?:\/\//

interface DashboardViewProps {
  /** `null` when the public API call failed. */
  planets: Planet[] | null
}

export function DashboardView({ planets }: DashboardViewProps): React.ReactElement {
  const router = useRouter()
  const initialIndex = Math.max(0, Math.min(2, (planets?.length ?? 0) - 1)) // middle slide when there are enough planets
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
        <p className="z-10 px-6 text-center text-lg font-bold text-white">
          {planets
            ? 'Chưa có hành tinh nào.'
            : 'Tạm thời không tải được dữ liệu, vui lòng thử lại sau.'}
        </p>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-full w-full flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Background Glow based on active planet - Creates an immersive atmosphere */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-40 transition-all duration-1000 ease-in-out md:opacity-50"
        style={{
          // clone-gate-ignore
          background: `radial-gradient(circle, ${planets[activePlanetIndex]?.glowColor || '#7c3aed'} 0%, transparent 60%)`,
          filter: 'blur(60px)',
        }}
      />

      {/* Custom Prev Button with Claymorphic Gold Border Arrow Style */}
      <button
        className="absolute left-6 z-30 transform cursor-pointer transition-all hover:scale-110 focus:outline-none active:scale-95 md:left-14"
        onClick={() => swiperRef.current?.slidePrev()}
      >
        <div className="from-topbar-purple-hover to-topbar-purple-active border-topbar-yellow-hover relative flex h-12 w-12 items-center justify-center rounded-2xl border-3 bg-gradient-to-b shadow-[0_6px_0_var(--color-topbar-purple-shadow),0_8px_16px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:border-b-2 md:h-16 md:w-16">
          {/* Arrow Left Symbol */}
          <span className="-translate-x-[2px] transform text-xl font-black text-white select-none md:text-3xl">
            ◀
          </span>
        </div>
      </button>

      {/* Swiper Container */}
      <div
        onClick={handleSwiperClick}
        className="z-10 mx-auto flex h-full w-full max-w-[100vw] cursor-pointer items-center justify-center sm:max-w-[85vw]"
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
          slidesPerView={1.5}
          initialSlide={initialIndex}
          mousewheel={true}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          coverflowEffect={{
            rotate: 0,
            stretch: 60,
            depth: 200,
            modifier: 1,
            slideShadows: false,
          }}
          modules={[EffectCoverflow, Mousewheel]}
          className="h-full w-full !py-12 md:!py-20"
          onSlideChange={(swiper) => setActivePlanetIndex(swiper.activeIndex)}
        >
          {planets.map((planet, idx) => {
            const isActive = idx === activePlanetIndex

            return (
              <SwiperSlide key={planet.slug} className="flex items-center justify-center">
                <div
                  data-planet-slug={planet.slug}
                  data-planet-href={planet.comingSoon ? undefined : planet.href}
                  aria-disabled={planet.comingSoon ? 'true' : undefined}
                  className={`relative transition-all duration-700 ease-out ${planet.comingSoon ? 'cursor-default' : 'cursor-pointer'} flex flex-col items-center ${isActive ? 'z-30 scale-100' : 'scale-75 opacity-30 hover:opacity-50'} `}
                >
                  {/* Planet Image Layer with high-end glow and smooth float */}
                  <div className="relative flex h-60 w-60 items-center justify-center sm:h-76 sm:w-76 md:h-[380px] md:w-[380px]">
                    {/* Behind planet aura glow (only for active planet) */}
                    {isActive && (
                      <div
                        className="absolute inset-4 -z-10 animate-pulse rounded-full opacity-45 blur-2xl"
                        style={{
                          // clone-gate-ignore
                          background: `radial-gradient(circle, ${planet.glowColor} 0%, transparent 70%)`,
                        }}
                      />
                    )}

                    {ABSOLUTE_URL.test(planet.image) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={planet.image}
                        alt={planet.name}
                        className={`absolute inset-0 h-full w-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] transition-transform duration-[4000ms] ease-in-out ${
                          isActive ? 'animate-[floating_5s_ease-in-out_infinite]' : ''
                        }`}
                      />
                    ) : (
                      <Image
                        src={planet.image}
                        alt={planet.name}
                        fill
                        className={`object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] transition-transform duration-[4000ms] ease-in-out ${
                          isActive ? 'animate-[floating_5s_ease-in-out_infinite]' : ''
                        }`}
                        priority={isActive}
                      />
                    )}
                  </div>

                  {/* 3D Ribbon & Details underneath */}
                  <div
                    className={cn(
                      'absolute bottom-[0px] flex w-[240px] flex-col items-center transition-all duration-500 md:bottom-[-15px] md:w-[300px]',
                      isActive
                        ? 'translate-y-0 scale-100 opacity-100'
                        : 'pointer-events-none translate-y-6 scale-95 opacity-0',
                    )}
                  >
                    {/* Ribbon Title */}
                    <div className="relative flex h-[60px] w-full items-center justify-center drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)] filter md:h-[75px]">
                      {/* Bubbly 3D Claymorphic Banner */}
                      <div
                        className="absolute inset-x-2 inset-y-0 z-10 flex flex-col items-center justify-center rounded-2xl border-t border-r border-b-4 border-l border-black/20 px-4 pt-2 pb-3 shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                        style={{
                          // clone-gate-ignore
                          background: `linear-gradient(to right, ${planet.ribbonFrom}, ${planet.ribbonTo})`,
                        }}
                      >
                        {planet.comingSoon && (
                          <span className="absolute -top-3 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                            Sắp ra mắt
                          </span>
                        )}
                        <h2 className="font-heading text-center text-lg leading-tight font-black tracking-wider text-white uppercase drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] md:text-2xl">
                          {planet.name}
                        </h2>
                        <p className="mt-0.5 text-center text-[9px] font-bold tracking-wider text-white/95 uppercase drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] md:text-xs">
                          {planet.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>

      {/* Custom Next Button with Claymorphic Gold Border Arrow Style */}
      <button
        className="absolute right-6 z-30 transform cursor-pointer transition-all hover:scale-110 focus:outline-none active:scale-95 md:right-14"
        onClick={() => swiperRef.current?.slideNext()}
      >
        <div className="from-topbar-purple-hover to-topbar-purple-active border-topbar-yellow-hover relative flex h-12 w-12 items-center justify-center rounded-2xl border-3 bg-gradient-to-b shadow-[0_6px_0_var(--color-topbar-purple-shadow),0_8px_16px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:border-b-2 md:h-16 md:w-16">
          {/* Arrow Right Symbol */}
          <span className="translate-x-[2px] transform text-xl font-black text-white select-none md:text-3xl">
            ▶
          </span>
        </div>
      </button>
    </div>
  )
}
