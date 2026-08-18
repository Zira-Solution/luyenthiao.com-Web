import * as React from "react";

import { cn } from "@/lib/utils";

export interface GameButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const GameButton = React.forwardRef<HTMLButtonElement, GameButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={cn(
          "relative rounded-[8px] p-[3px] flex justify-center font-semibold bg-gradient-to-b h-fit",
          "from-[#FDDBD4] to-[#BF381C] hover:opacity-90 active:scale-95 transition-all",
          "disabled:pointer-events-none disabled:cursor-not-allowed",
          "[&>.btn-content]:from-[#F48E77] [&>.btn-content]:to-[#E36245]",
          "[&>.left-corner>svg>path:nth-child(1)]:fill-[#F8957F]",
          "[&>.left-corner>svg>path:nth-child(2)]:fill-[#FFD5B9]",
          "[&>.left-corner>svg>path:nth-child(3)]:fill-[#E66549]",
          "[&>.left-corner>svg>path:nth-child(4)]:fill-[#E66549]",
          "[&>.right-corner>svg>path:nth-child(1)]:fill-[#CB300E]",
          "[&>.right-corner>svg>path:nth-child(2)]:fill-[#FFD5B9]",
          "[&>.right-corner>svg>path:nth-child(3)]:fill-[#AE1F00]",
          className
        )}
      >
        <div className="absolute left-0 top-0 lg:w-[32px] w-[20px] left-corner pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 33 19">
            <path d="M19.099 18.13H.106v-.89h18.362l11.254-9.905V0h1.3v7.642z" />
            <path d="M19.768 19H.106v-.89h19.005l11.65-10.533V.242h1.345v7.642z" opacity="0.2" />
            <path d="M18.416 17.2H.398v-.847h17.42l10.676-9.397V0h1.234v7.246z" />
            <path d="m21.816 11.273-4.282 4.56h-4.522l4.522-4.56z" />
          </svg>
        </div>
        
        <div className="absolute bottom-0 right-0 lg:w-[32px] w-[20px] right-corner pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 12">
            <path d="m40 5.637-6.944-3.485h-4.474L26.9.694h-5.597l-2.46 1.585H9.666L2.275 6.84V12h1.46V6.84l6.044-3.929h21.823l7.275 3.421z" />
            <path d="m38.88 6.331-7.275-3.42H9.782L3.738 6.84V12h1.23V6.902l5.15-3.357h20.146l7.833 3.357z" opacity="0.2" />
            <path d="M30.71 2.153 27.572 0H20.41l-2.572 1.645H8.993L0 6.791l2.277.05 7.392-4.56h9.176l2.46-1.585h5.597l1.683 1.457z" />
          </svg>
        </div>

        <div className="lg:px-3 sm:py-2 sm:text-[14px] lg:text-[16px] p-1 text-[13px] w-full rounded-[inherit] transition-all btn-content bg-gradient-to-b">
          <div className="whitespace-nowrap uppercase text-white font-extrabold tracking-wide">
            {children}
          </div>
        </div>
      </button>
    );
  }
);
GameButton.displayName = "GameButton";
