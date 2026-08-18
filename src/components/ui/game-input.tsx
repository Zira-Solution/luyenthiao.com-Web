"use client";

import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import React, { forwardRef, useState } from "react";

import { cn } from "@/lib/utils";


export interface GameInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const GameInput = forwardRef<HTMLInputElement, GameInputProps>(
  ({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const actualType = isPassword && showPassword ? "text" : type;

    return (
      <div className="relative">
        <div className="relative flex w-full h-full justify-between items-center px-5 sm:px-7 2xl:px-10 py-5 z-[2] max-h-[60px]">
          
          <div className="flex flex-col flex-1 min-w-0 relative z-[2]">
            <input
              type={actualType}
              className={cn(
                "w-full bg-transparent focus:outline-none text-[12px] xl:text-[14px] font-semibold text-white placeholder:text-[#7BFAFC]",
                className
              )}
              ref={ref}
              {...props}
            />
          </div>

          {isPassword && (
            <div className="min-w-5 shrink-0 pl-2 flex justify-center items-center text-sm z-[2]">
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="text-white hover:text-white/80 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
          )}

          {/* Background Images Layer */}
          <div className="absolute top-0 left-0 w-full h-full -z-[1]">
            <div className="relative h-full w-full flex">
              <Image 
                src="/clone-assets/bg-input-header.png" 
                alt="" 
                width={30} 
                height={60} 
                className="h-full w-auto" 
              />
              <Image 
                src="/clone-assets/bg-input-body.png" 
                alt="" 
                width={300} 
                height={60} 
                className="h-full w-full min-w-0" 
              />
              <Image 
                src="/clone-assets/bg-input-footer.png" 
                alt="" 
                width={30} 
                height={60} 
                className="h-full w-auto" 
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

GameInput.displayName = "GameInput";
