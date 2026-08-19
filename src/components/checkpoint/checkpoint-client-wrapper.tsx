"use client";

import { useState } from "react";
import Image from "next/image";
import { ModeSelectModal } from "./mode-select-modal";
import { ExamPlayer } from "./exam-player";

interface CheckpointClientWrapperProps {
  id: string;
  initialData: any;
}

export function CheckpointClientWrapper({ id, initialData }: CheckpointClientWrapperProps) {
  const [started, setStarted] = useState(false);

  if (started) {
    return <ExamPlayer id={id} onExit={() => setStarted(false)} />;
  }

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden bg-dashboard-bg">
      {/* Full-screen background */}
      <Image
        src="/clone-assets/exam/bg-checkpoint-page.d7e3979b.jpg"
        alt=""
        fill
        priority
        className="object-cover"
      />

      {/* Scaled modal container */}
      <div className="absolute inset-0 overflow-y-auto font-sans">
        <div className="flex flex-col items-center w-full h-full pt-[30px] max-md:-mt-[90px]">
          <div className="origin-top scale-[0.9] max-md:scale-[0.75]">
            <ModeSelectModal data={initialData} onStart={() => setStarted(true)} />
          </div>
        </div>
      </div>
    </main>
  );
}
