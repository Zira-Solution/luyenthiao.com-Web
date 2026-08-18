"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

interface PlanetCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  className?: string;
}

export function PlanetCard({ title, description, image, category, className }: PlanetCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-end p-4 h-[280px] rounded-3xl cursor-pointer transition-all duration-500 group",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
      
      {/* Floating Image Container */}
      <div 
        className={cn(
          "absolute top-0 left-0 w-full h-[200px] flex items-center justify-center transition-transform duration-500 ease-out",
          isHovered ? "-translate-y-6 scale-110" : "animate-[floating_3s_ease-in-out_infinite]"
        )}
      >
        <div className="relative w-4/5 h-4/5 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-300">
          <Image
            src={image}
            alt={title}
            fill
            className="object-contain"
            // Use unoptimized or handle missing images gracefully for mock data
            unoptimized
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full text-center mt-auto translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        <span className="inline-block px-3 py-1 mb-2 text-[10px] font-bold tracking-wider text-primary bg-primary/20 rounded-full backdrop-blur-md border border-primary/30 uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
          {category}
        </span>
        <h3 className="text-xl md:text-2xl font-extrabold text-white drop-shadow-md tracking-wide">
          {title}
        </h3>
        <p className="text-sm text-white/80 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150 line-clamp-2">
          {description}
        </p>
      </div>

      {/* Action Button (Appears on hover) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 group-hover:-translate-y-4 transition-all duration-300 delay-200">
        <button className="px-6 py-2 bg-gradient-to-r from-primary to-orange-500 text-white font-bold rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-105 active:scale-95 transition-all">
          THAM GIA
        </button>
      </div>
    </div>
  );
}
