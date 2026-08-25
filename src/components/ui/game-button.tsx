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
        shadow: "bg-game-primary-shadow", // Dark brick-red base
        bg: "bg-gradient-to-b from-game-primary-from to-game-primary-to", // Soft orange/coral to medium orange
        border: "border-game-primary-border", // Thick dark red outline
        hoverBg: "hover:from-game-primary-hover-from hover:to-game-primary-hover-to",
      },
      secondary: {
        shadow: "bg-game-secondary-shadow", // Dark indigo base
        bg: "bg-gradient-to-b from-topbar-login-bg to-topbar-login-border", // Royal blue to indigo
        border: "border-ranking-table-border", // Indigo outline
        hoverBg: "hover:from-game-secondary-hover-from hover:to-game-secondary-hover-to",
      },
      cta: {
        shadow: "bg-game-cta-shadow", // Dark green base
        bg: "bg-gradient-to-b from-game-cta-from to-game-cta-to", // Emerald green to forest green
        border: "border-game-cta-border", // Deep green outline
        hoverBg: "hover:from-game-cta-hover-from hover:to-nav-badge-green-to",
      },
      danger: {
        shadow: "bg-game-danger-border", // Dark crimson base
        bg: "bg-gradient-to-b from-game-danger-from to-game-danger-to", // Rose red to dark red
        border: "border-game-danger-border", // Deep crimson outline
        hoverBg: "hover:from-game-danger-hover-from hover:to-topbar-signup-shadow",
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
