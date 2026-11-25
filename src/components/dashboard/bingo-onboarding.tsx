'use client'

import Image from 'next/image'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function BingoOnboarding() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/clone-assets/bg.1e17df80.webp"
          alt="Space Background"
          fill
          className="object-cover"
          priority
        />

        {/* Glow Effects */}
        <div className="absolute -bottom-[200px] -left-[100px] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,#7c3aed_0%,transparent_70%)] opacity-30 blur-[80px]" />
        <div className="absolute -top-[100px] -right-[100px] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle,#6366f1_0%,transparent_70%)] opacity-30 blur-[80px]" />
        <div className="absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#a78bfa_0%,transparent_70%)] opacity-15 blur-[80px]" />
      </div>

      {/* Logout Button */}
      <div className="absolute top-6 right-6 md:right-28">
        <Button
          variant="outline"
          className="flex items-center gap-2 border-none bg-white/10 px-4 py-2 font-bold text-white hover:bg-white/20"
          onClick={() => {}}
        >
          <Image src="/clone-assets/ic-logout.7baec1b3.webp" alt="Logout" width={24} height={24} />
          Đăng xuất
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative flex w-full max-w-[1200px] flex-col items-center justify-center gap-8 px-4 md:flex-row md:px-10">
        {/* Bingo Mascot */}
        <div className="relative h-[300px] w-[300px] shrink-0 md:h-[500px] md:w-[500px]">
          <Image
            src="/clone-assets/logo.46df16c4.webp"
            alt="Bingo Mascot"
            fill
            className="object-contain drop-shadow-2xl"
          />
        </div>

        {/* Speech Bubble */}
        <div className="animate-in slide-in-from-bottom-10 fade-in relative max-w-[600px] flex-1 duration-500">
          {/* Bubble Tail */}
          <div className="absolute top-1/2 -left-4 hidden h-0 w-0 -translate-y-1/2 border-y-[15px] border-r-[20px] border-y-transparent border-r-white md:block" />

          <Card className="rounded-2xl border-none bg-white p-6 shadow-[0_8px_0_0_var(--color-onboarding-card-shadow)] md:p-8">
            <h1 className="text-game-text-dark text-shadow-game-title mb-4 text-4xl font-extrabold tracking-wide uppercase md:text-[40px]">
              BINGO
            </h1>

            <div className="text-game-text-dark space-y-4 text-lg leading-relaxed font-bold md:text-[24px]">
              <p>Xin chào! Mình là Bingo đến từ Thế Giới Luyện Thi Ảo.</p>
              <p>
                Một con quái vật đã lấy mất những Viên Đá Tri Thức của chúng mình. Không có chúng,
                thế giới của mình trở nên tăm tối!
              </p>
              <p>Mình không thể lấy lại chúng một mình…</p>
              <p>Bạn có muốn tham gia cuộc phiêu lưu với mình không?</p>
              <p>Bắt đầu nào!</p>
            </div>

            <div className="mt-8">
              <Button
                onClick={() => setIsVisible(false)}
                className="from-onboarding-btn-from to-onboarding-btn-to border-onboarding-btn-border h-14 w-[200px] rounded-2xl border-2 bg-gradient-to-b text-lg font-black tracking-wider text-white uppercase shadow-[0_4px_0_0_var(--color-onboarding-btn-shadow)] transition-all hover:scale-105 hover:opacity-95 active:scale-95"
              >
                Đi thôi!
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
