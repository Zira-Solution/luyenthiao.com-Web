import type { ReactElement } from "react";

import Image from "next/image";
import Link from "next/link";

interface LevelHeaderProps {
  levelName: string;
}

export function LevelHeader({ levelName }: LevelHeaderProps): ReactElement {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 w-full flex justify-between items-center px-[3%] pt-2 md:pt-4 pointer-events-none">
      {/* Back Button */}
      <div className="w-[25%] max-w-[415px] pointer-events-auto">
        {/* Desktop Back Button */}
        <Link href="/" className="hidden sm:block w-full max-w-[330px] hover:scale-105 active:scale-95 transition-transform block">
          <div className="relative aspect-[357/113] w-full">
            <Image
              src="/clone-assets/exam/bg-back.13414e49.webp"
              alt="Trở về"
              fill
              priority
              className="object-contain"
            />
            <div className="absolute inset-0 top-[14%] left-[50%] right-[16.5%] bottom-[42%] flex justify-center items-center">
              <span className="text-white font-heading font-black text-xs md:text-sm lg:text-base uppercase tracking-wider select-none">
                Trở về
              </span>
            </div>
          </div>
        </Link>
        {/* Mobile Back Button */}
        <Link href="/" className="sm:hidden w-[55%] max-w-[169px] hover:scale-105 active:scale-95 transition-transform block">
          <div className="relative aspect-[189/113] w-full">
            <Image
              src="/clone-assets/exam/bg-back-m.1d28391b.webp"
              alt="Trở về"
              fill
              priority
              className="object-contain"
            />
          </div>
        </Link>
      </div>

      {/* Center Title & Speaking Banner */}
      <div className="relative w-[46%] max-w-[654px] -translate-y-[15%] sm:-translate-y-[27%] pointer-events-auto flex flex-col items-center">
        {/* Ribbon Title */}
        <div className="relative aspect-[632/140] w-full">
          <Image
            src="/clone-assets/exam/bg-title.de447cb5.webp"
            alt="Tiêu đề"
            fill
            priority
            className="object-contain"
          />
          <div className="absolute inset-0 pt-[5.5%] flex items-center justify-center">
            <span className="text-white font-heading font-black text-xs sm:text-lg md:text-2xl lg:text-3xl uppercase tracking-widest drop-shadow-[0_2px_3px_rgba(0,0,0,0.6)] select-none">
              {levelName}
            </span>
          </div>
        </div>

        {/* Video Speaking Button (Positioned absolute below ribbon) */}
        <div className="absolute z-10 w-[70%] bottom-0 left-1/2 -translate-x-1/2 translate-y-[65%] sm:translate-y-[70%]">
          <Link
            href="/speaking-listing/PLx6shCnHxKsrgZwgS5W9aDLRnT3_lg6GB__9e6839c3-7cf9-4d34-a198-e2f01575f95b"
            className="relative aspect-[456/126] w-full block hover:scale-105 active:scale-95 transition-transform"
          >
            <Image
              src="/clone-assets/exam/bg-speaking-video-btn.80759ee2.webp"
              alt="Video bài thi nói"
              fill
              className="object-contain"
            />
            <div className="absolute inset-0 top-[30%] left-[14%] right-[16%] bottom-[37%] flex justify-center items-center">
              <span className="text-white font-heading font-black text-[8px] sm:text-[10px] md:text-[13px] uppercase tracking-wider drop-shadow-md select-none">
                🎬 Video bài thi nói
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* Random Button */}
      <div className="w-[25%] max-w-[415px] pointer-events-auto flex justify-end">
        {/* Desktop Random Button */}
        <button className="hidden sm:block w-full max-w-[330px] hover:scale-105 active:scale-95 transition-transform relative aspect-[415/112] cursor-pointer">
          <Image
            src="/clone-assets/exam/bg-random.66cd8920.webp"
            alt="Ngẫu nhiên"
            fill
            priority
            className="object-contain"
          />
          <div className="absolute inset-0 top-[14%] left-[11%] right-[43%] bottom-[42%] flex justify-center items-center">
            <span className="text-white font-heading font-black text-xs md:text-sm lg:text-base uppercase tracking-wider select-none">
              🎲 Ngẫu nhiên
            </span>
          </div>
        </button>
        {/* Mobile Random Button */}
        <button className="sm:hidden w-[55%] max-w-[169px] hover:scale-105 active:scale-95 transition-transform relative aspect-[186/112] cursor-pointer">
          <Image
            src="/clone-assets/exam/bg-random-m.dc004e87.webp"
            alt="Ngẫu nhiên"
            fill
            priority
            className="object-contain"
          />
        </button>
      </div>
    </header>
  );
}
