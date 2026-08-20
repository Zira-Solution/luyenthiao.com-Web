"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import examMock from "../../../_webclone/design-model/mocks/exam-7778495e.json";

import { ExamPlayer } from "./exam-player";
import { ModeSelectModal } from "./mode-select-modal";

import { loadAttempt, loadExams, normalizeExam, type RawCheckPoint } from "@/lib/exam";
import type { Exam } from "@/types/exam";

interface CheckpointClientWrapperProps {
  id: string;
  initialData: {
    level: string;
    levelName: string;
    challengeNumber: number;
    totalMinutes: number;
    parts: { name: string; maxScore: number; minutes: number }[];
  };
}

export function CheckpointClientWrapper({ id, initialData }: CheckpointClientWrapperProps) {
  const [started, setStarted] = useState(false);
  const [reviewRequested, setReviewRequested] = useState(false);

  const exam = useMemo<Exam | null>(() => {
    // Ưu tiên exam do admin tạo (lưu localStorage)
    const stored = loadExams().find((e) => e.id === id)
    if (stored) return stored

    // Fallback: exam mock gốc
    try {
      const raw = (examMock as unknown as { data: { checkPoint: RawCheckPoint } })?.data?.checkPoint
      if (!raw) return null
      const normalized = normalizeExam(raw)
      if (normalized) {
        normalized.id = id
        if (!normalized.name) {
          normalized.name = `${initialData.levelName ?? "MOVERS"} - Thử thách ${initialData.challengeNumber ?? 1}`
        }
      }
      return normalized
    } catch {
      return null
    }
  }, [id, initialData])

  // Detect review mode from query param on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const review = new URLSearchParams(window.location.search).get("review") === "true";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Đồng bộ trạng thái từ query param lúc mount
    if (review) setReviewRequested(true);
  }, []);

  // In review mode: load the saved attempt and render directly
  if (reviewRequested) {
    if (!exam) {
      return <LoadingScreen />;
    }
    const attempt = loadAttempt(id) ?? null;
    return <ExamPlayer exam={exam} attempt={attempt} mode="review" onExit={() => setReviewRequested(false)} />;
  }

  if (started && exam) {
    return <ExamPlayer exam={exam} mode="exam" onExit={() => setStarted(false)} />;
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

function LoadingScreen() {
  return (
    <main className="w-full h-[100dvh] bg-[#16143c] flex items-center justify-center text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white" />
    </main>
  );
}