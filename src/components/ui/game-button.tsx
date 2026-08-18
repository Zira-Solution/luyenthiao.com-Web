import * as React from "react";

import { cn } from "@/lib/utils";

export interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "cta" | "danger";
  children: React.ReactNode;
}

export const GameButton = React.forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ className, children, variant = "primary", ...props }, ref) => {
    
    // 3D Claymorphic game design colors matching Flyer's vibrant theme
    const themeStyles = {
      primary: {
        shadow: "bg-[#BF381C]", // Dark brick-red base
        bg: "bg-gradient-to-b from-[#F48E77] to-[#E36245]", // Soft orange/coral to medium orange
        border: "border-[#9C230C]", // Thick dark red outline
        hoverBg: "hover:from-[#F69E8A] hover:to-[#E86D53]",
      },
      secondary: {
        shadow: "bg-[#0b3b7a]", // Dark indigo base
        bg: "bg-gradient-to-b from-[#3B82F6] to-[#1D4ED8]", // Royal blue to indigo
        border: "border-[#1E3A8A]", // Indigo outline
        hoverBg: "hover:from-[#60A5FA] hover:to-[#2563EB]",
      },
      cta: {
        shadow: "bg-[#166534]", // Dark green base
        bg: "bg-gradient-to-b from-[#4ADE80] to-[#16A34A]", // Emerald green to forest green
        border: "border-[#14532D]", // Deep green outline
        hoverBg: "hover:from-[#86EFAC] hover:to-[#15803D]",
      },
      danger: {
        shadow: "bg-[#7F1D1D]", // Dark crimson base
        bg: "bg-gradient-to-b from-[#F87171] to-[#DC2626]", // Rose red to dark red
        border: "border-[#7F1D1D]", // Deep crimson outline
        hoverBg: "hover:from-[#FCA5A5] hover:to-[#B91C1C]",
      }
    }[variant];

    return (
      <button
        ref={ref}
        {...props}
        className={cn(
          "relative group active:translate-y-[3px] active:shadow-none transition-all duration-150 cursor-pointer outline-none rounded-2xl w-full",
          "disabled:pointer-events-none disabled:opacity-50 select-none",
          className
        )}
      >
        {/* 3D shadow layer underneath */}
        <div className={cn(
          "absolute inset-x-0 -bottom-1 h-full rounded-2xl -z-10 transition-all group-active:bottom-0 shadow-lg",
          themeStyles.shadow
        )} />
        
        {/* Main button text container */}
        <div className={cn(
          "px-6 py-3 border-2 rounded-2xl flex justify-center items-center text-center font-black uppercase text-white tracking-widest text-sm md:text-base transition-all duration-100",
          themeStyles.bg,
          themeStyles.border,
          themeStyles.hoverBg
        )}>
          {children}
        </div>
      </button>
    );
  }
);
GameButton.displayName = "GameButton";
