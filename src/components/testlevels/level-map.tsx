import type { ReactElement } from "react";

import Image from "next/image";
import Link from "next/link";

interface LevelMapData {
  name: string;
  total: number;
  unlocked: number;
  mapBackground: string;
  mobileBackground: string;
}

interface LevelMapProps {
  level: LevelMapData;
}

const SEGMENT_COORDINATES = [
  { top: 6.960857, left: 60.825363, isRounded: true },
  { top: 8.201304, left: 31.756756, isRounded: false },
  { top: 25.0234, left: 38.825364, isRounded: false },
  { top: 29.916123, left: 62.525987, isRounded: false },
  { top: 47.390494, left: 47.713098, isRounded: false },
  { top: 62.629937, left: 60.631873, isRounded: false },
  { top: 63.000931, left: 35.239085, isRounded: false },
  { top: 79.72973, left: 32.380457, isRounded: false },
  { top: 84.43616, left: 61.746362, isRounded: false },
];

export function LevelMap({ level }: LevelMapProps): ReactElement {
  const segmentSize = 9;
  const totalSegments = Math.ceil(level.total / segmentSize);
  const segments = Array.from({ length: totalSegments }, (_, i) => i);

  return (
    <div className="w-full flex flex-col">
      {segments.map((segmentIndex) => {
        // Calculate which level IDs belong to this segment
        const startLevel = segmentIndex * segmentSize + 1;
        const endLevel = Math.min(startLevel + segmentSize - 1, level.total);
        const segmentButtons = Array.from(
          { length: endLevel - startLevel + 1 },
          (_, btnIdx) => startLevel + btnIdx
        );

        return (
          <div
            key={segmentIndex}
            className="relative w-[150%] -ml-[25%] sm:w-full sm:ml-0 aspect-[1920/1847] overflow-visible"
          >
            {/* Background Image for Segment */}
            <Image
              src={level.mapBackground}
              alt={`Bản đồ phân đoạn ${segmentIndex + 1}`}
              width={1920}
              height={1847}
              priority={segmentIndex < 2}
              className="w-full h-full object-cover select-none pointer-events-none z-0"
            />

            {/* Checkpoints container */}
            <div className="absolute inset-0 z-10">
              {segmentButtons.map((levelNum, index) => {
                const coord = SEGMENT_COORDINATES[index];
                if (!coord) return null;

                const isUnlocked = levelNum <= level.unlocked;
                const isRounded = coord.isRounded;

                return (
                  <div
                    key={levelNum}
                    className={`absolute w-[11.715915%] aspect-square ${
                      isRounded ? "rounded-full" : ""
                    }`}
                    style={{ // clone-gate-ignore
                      top: `${coord.top}%`,
                      left: `${coord.left}%`,
                    }}
                  >
                    {isUnlocked ? (
                      <Link
                        href="/check-point/7778495e-531b-4039-a3ea-321874ba1a7a"
                        className="relative w-full h-full block hover:scale-110 active:scale-95 transition-transform duration-200"
                      >
                        {/* Checkpoint circular badge */}
                        <Image
                          src="/clone-assets/exam/bg-checkpoint.95231678.png"
                          alt={`Thử thách ${levelNum}`}
                          fill
                          className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                        />
                        {/* Checkpoint Number */}
                        <div className="absolute inset-0 top-[28%] flex justify-center">
                          <span className="text-[#000e41] font-heading font-black text-sm sm:text-xl md:text-2xl drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)] select-none">
                            {levelNum}
                          </span>
                        </div>
                        {/* Checkpoint Title ribbon */}
                        <div className="absolute w-[132.743362%] -left-[16.371681%] top-[64.159292%] aspect-[319/113]">
                          <Image
                            src="/clone-assets/exam/bg-checkpoint-title.f554fd72.png"
                            alt=""
                            fill
                            className="object-contain"
                          />
                          <div className="absolute inset-0 px-[15%] pt-[8%] pb-[6%] flex items-center justify-center">
                            <span className="text-white font-heading font-black text-[8px] sm:text-[10px] md:text-xs tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate select-none">
                              Thử thách {levelNum}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="relative w-full h-full opacity-90">
                        {/* Checkpoint circular badge disabled */}
                        <Image
                          src="/clone-assets/exam/bg-checkpoint-disabled.49d83d62.png"
                          alt={`Thử thách ${levelNum} (khoá)`}
                          fill
                          className="object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]"
                        />
                        {/* Checkpoint Number */}
                        <div className="absolute inset-0 top-[28%] flex justify-center">
                          <span className="text-[#000e41]/60 font-heading font-black text-sm sm:text-xl md:text-2xl select-none">
                            {levelNum}
                          </span>
                        </div>
                        {/* Locked Padlock Badge */}
                        <div className="absolute z-10 w-[28.105263%] aspect-[183/231] right-[1%] top-0">
                          <Image
                            src="/clone-assets/exam/bg-locked.451398ce.png"
                            alt="Bị khoá"
                            fill
                            className="object-contain"
                          />
                        </div>
                        {/* Checkpoint Title ribbon disabled */}
                        <div className="absolute w-[132.743362%] -left-[16.371681%] top-[64.159292%] aspect-[319/113]">
                          <Image
                            src="/clone-assets/exam/bg-checkpoint-title-disabled.c4613481.png"
                            alt=""
                            fill
                            className="object-contain"
                          />
                          <div className="absolute inset-0 px-[15%] pt-[8%] pb-[6%] flex items-center justify-center">
                            <span className="text-white/60 font-heading font-black text-[8px] sm:text-[10px] md:text-xs tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)] truncate select-none">
                              Thử thách {levelNum}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
