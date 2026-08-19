import Image from "next/image";

import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden bg-page-bg">
      
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/clone-assets/bg.1e17df80.png"
          alt="Space Background"
          fill
          className="object-cover"
          priority
        />
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 bg-[radial-gradient(circle,#7c3aed_0%,transparent_70%)]" />
      </div>

      <div className="relative z-10 w-full max-w-[1200px] px-6 lg:px-10 flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20">
        
        {/* Mascot */}
        <div className="hidden lg:flex shrink-0 w-[400px] h-[400px] relative">
          <Image
            src="/clone-assets/bingo-vn.png"
            alt="Bingo Mascot"
            fill
            className="object-contain drop-shadow-2xl animate-in fade-in duration-1000 slide-in-from-left-10"
            priority
          />
        </div>

        {/* Signup Form */}
        <div className="w-full flex-1 flex justify-center animate-in fade-in duration-700 slide-in-from-bottom-10">
          <SignupForm />
        </div>
        
      </div>
    </main>
  );
}
