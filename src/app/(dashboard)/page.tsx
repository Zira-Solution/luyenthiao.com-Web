"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { EffectCoverflow } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import planetsData from "../../../_webclone/design-model/mocks/planets.json";

import { cn } from "@/lib/utils";
import "swiper/css";
import "swiper/css/effect-coverflow";

export default function DashboardPage() {
  const [activePlanetIndex, setActivePlanetIndex] = useState(2); // Start at index 2 (middle slide)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const swiperRef = useRef<any>(null);

  return (
    <div className="relative w-full min-h-full flex flex-col justify-center items-center overflow-hidden">
      
      {/* Dynamic Background Glow based on active planet - Creates an immersive atmosphere */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 transition-all duration-1000 ease-in-out opacity-40 md:opacity-50"
        style={{ // clone-gate-ignore
          background: `radial-gradient(circle, ${planetsData[activePlanetIndex]?.shadowColor || '#7c3aed'} 0%, transparent 60%)`,
          filter: 'blur(60px)'
        }}
      />

      {/* Custom Prev Button with Claymorphic Gold Border Arrow Style */}
      <button 
        className="absolute left-6 md:left-14 z-30 transform hover:scale-110 active:scale-95 transition-all cursor-pointer focus:outline-none"
        onClick={() => swiperRef.current?.slidePrev()}
      >
        <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-2xl bg-gradient-to-b from-topbar-purple-hover to-topbar-purple-active border-3 border-topbar-yellow-hover shadow-[0_6px_0_var(--color-topbar-purple-shadow),0_8px_16px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:border-b-2">
          {/* Arrow Left Symbol */}
          <span className="text-white font-black text-xl md:text-3xl transform -translate-x-[2px] select-none">
            ◀
          </span>
        </div>
      </button>

      {/* Swiper Container */}
      <div className="w-full max-w-[100vw] sm:max-w-[85vw] mx-auto flex items-center justify-center h-full z-10">
        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          effect={"coverflow"}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1.5}
          initialSlide={2}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          coverflowEffect={{
            rotate: 0,
            stretch: 60,
            depth: 200,
            modifier: 1,
            slideShadows: false,
          }}
          modules={[EffectCoverflow]}
          className="w-full h-full !py-12 md:!py-20"
          onSlideChange={(swiper) => setActivePlanetIndex(swiper.activeIndex)}
        >
          {planetsData.map((planet, idx) => {
            const isActive = idx === activePlanetIndex;
            
            return (
              <SwiperSlide key={planet.id} className="flex justify-center items-center">
                <div 
                  className={`relative transition-all duration-700 ease-out cursor-pointer flex flex-col items-center
                    ${isActive ? "scale-100 z-30" : "scale-75 opacity-30 hover:opacity-50"}
                  `}
                >
                  {/* Planet Image Layer with high-end glow and smooth float */}
                  <div className="relative w-60 h-60 sm:w-76 sm:h-76 md:w-[380px] md:h-[380px] flex items-center justify-center">
                    
                    {/* Behind planet aura glow (only for active planet) */}
                    {isActive && (
                      <div 
                        className="absolute inset-4 rounded-full -z-10 animate-pulse opacity-45 blur-2xl"
                        style={{ // clone-gate-ignore
                          background: `radial-gradient(circle, ${planet.shadowColor} 0%, transparent 70%)`
                        }}
                      />
                    )}

                    <Image
                      src={planet.image}
                      alt={planet.name}
                      fill
                      className={`object-contain transition-transform duration-[4000ms] ease-in-out drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] ${
                        isActive ? "animate-[floating_5s_ease-in-out_infinite]" : ""
                      }`}
                      priority={isActive}
                    />
                  </div>

                  {/* 3D Ribbon & Details underneath */}
                  <div className={cn(
                    "absolute bottom-[0px] md:bottom-[-15px] flex flex-col items-center transition-all duration-500 w-[240px] md:w-[300px]",
                    isActive ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95 pointer-events-none"
                  )}>
                    
                    {/* Ribbon Title */}
                    <div className="relative w-full h-[60px] md:h-[75px] flex items-center justify-center filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)]">
                      
                      {/* Bubbly 3D Claymorphic Banner */}
                      <div className={cn(
                        "absolute inset-x-2 inset-y-0 bg-gradient-to-b rounded-2xl border-b-4 border-r border-t border-l flex flex-col items-center justify-center pt-2 pb-3 px-4 z-10",
                        planet.id === "ioe" && "from-blue-400 to-indigo-600 border-indigo-800 border-t-blue-300 border-x-blue-500 shadow-[0_4px_10px_rgba(59,130,246,0.3)]",
                        planet.id === "starters" && "from-nav-badge-green-from to-nav-badge-green-to border-game-cta-border border-t-game-cta-from border-x-game-cta-to shadow-[0_4px_10px_rgba(34,197,94,0.3)]",
                        planet.id === "movers" && "from-topbar-signup-shadow to-game-danger-border border-planet-movers-border border-t-topbar-signup-bg border-x-game-danger-to shadow-[0_4px_10px_rgba(185,28,28,0.3)]",
                        planet.id === "flyers" && "from-violet-400 to-purple-650 border-purple-900 border-t-violet-300 border-x-violet-500 shadow-[0_4px_10px_rgba(139,92,246,0.3)]",
                        planet.id === "toefl_primary" && "from-amber-400 to-orange-650 border-orange-850 border-t-amber-300 border-x-amber-500 shadow-[0_4px_10px_rgba(245,158,11,0.3)]"
                      )}>
                        
                        <h2 className="text-white font-black text-lg md:text-2xl tracking-wider drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] text-center uppercase leading-tight font-heading">
                          {planet.name}
                        </h2>
                        <p className="text-white/95 font-bold text-[9px] md:text-xs tracking-wider text-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)] mt-0.5 uppercase">
                          {planet.description}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {/* Custom Next Button with Claymorphic Gold Border Arrow Style */}
      <button 
        className="absolute right-6 md:right-14 z-30 transform hover:scale-110 active:scale-95 transition-all cursor-pointer focus:outline-none"
        onClick={() => swiperRef.current?.slideNext()}
      >
        <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-2xl bg-gradient-to-b from-topbar-purple-hover to-topbar-purple-active border-3 border-topbar-yellow-hover shadow-[0_6px_0_var(--color-topbar-purple-shadow),0_8px_16px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:border-b-2">
          {/* Arrow Right Symbol */}
          <span className="text-white font-black text-xl md:text-3xl transform translate-x-[2px] select-none">
            ▶
          </span>
        </div>
      </button>

    </div>
  );
}
