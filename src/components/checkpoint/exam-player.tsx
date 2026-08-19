"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Pause, ArrowLeft, ArrowRight, Volume2, Clock, AlertTriangle, X, CheckCircle } from "lucide-react";
import examData from "../../../_webclone/design-model/mocks/exam-7778495e.json";

interface ExamPlayerProps {
  id: string;
  onExit: () => void;
}

export function ExamPlayer({ id, onExit }: ExamPlayerProps) {
  const router = useRouter();
  
  // Audio Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Exam Structures & Navigation State
  const structures = examData.data.checkPoint.examStructures;
  const [activeStructIdx, setActiveStructIdx] = useState(0); // 0: Listening, 1: Reading & Writing
  const [activePartIdx, setActivePartIdx] = useState(0); // Part index within structure

  const currentStruct = structures[activeStructIdx];
  const currentPart = currentStruct?.parts?.[activePartIdx];
  const totalPartsInStruct = currentStruct?.parts?.length || 0;

  // Answers State
  // Format: { [partId]: { [questionId_detailId]: value } }
  const [answers, setAnswers] = useState<Record<string, Record<string, any>>>({});

  // Active Click Matching Selection (For Part 1 & 5 matching)
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);

  // Modals & Timers State
  const [listeningTimer, setListeningTimer] = useState(35 * 60); // 35 minutes for Listening
  const [rwTimer, setRwTimer] = useState(30 * 60); // 30 minutes for Reading-Writing
  const [isSubmitWarningOpen, setIsSubmitWarningOpen] = useState(false);
  const [isTransitionOpen, setIsTransitionOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentTimer = activeStructIdx === 0 ? listeningTimer : rwTimer;

  // Log ID to use it
  useEffect(() => {
    console.log(`Starting Exam ID: ${id}`);
  }, [id]);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeStructIdx === 0) {
        setListeningTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleListeningCompleteAuto();
            return 0;
          }
          return prev - 1;
        });
      } else {
        setRwTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeStructIdx]);

  // Audio loading & control effect
  useEffect(() => {
    if (!currentPart) return;
    
    // If current part is Listening and has audio content
    const audioUrl = currentPart.node.contents?.find((c: any) => c.body?.formattedText?.format === "AUDIO_ID")?.body?.formattedText?.text;
    
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.addEventListener("ended", () => setIsPlaying(false));
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [activeStructIdx, activePartIdx, currentPart]);

  // TS Guards for safety
  if (!currentStruct || !currentPart) {
    return (
      <main className="w-full h-[100dvh] bg-[#16143c] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white" />
      </main>
    );
  }

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(err => console.log("Audio play error:", err));
      setIsPlaying(true);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  const handleNextPart = () => {
    if (activePartIdx < totalPartsInStruct - 1) {
      setActivePartIdx(activePartIdx + 1);
    } else {
      if (activeStructIdx === 0) {
        // Listening complete -> Show transition warning modal
        setIsTransitionOpen(true);
      } else {
        // Reading-Writing complete -> Show submit confirmation modal
        setIsSubmitWarningOpen(true);
      }
    }
  };

  const handlePrevPart = () => {
    if (activePartIdx > 0) {
      setActivePartIdx(activePartIdx - 1);
    } else if (activeStructIdx === 1) {
      // Go back to Listening Part 5 from Reading-Writing Part 1
      setActiveStructIdx(0);
      const listeningParts = structures[0]?.parts?.length || 0;
      setActivePartIdx(listeningParts - 1);
    }
  };

  const handleListeningCompleteAuto = () => {
    setIsTransitionOpen(false);
    setActiveStructIdx(1);
    setActivePartIdx(0);
  };

  const handleStartReadingWriting = () => {
    setIsTransitionOpen(false);
    setActiveStructIdx(1);
    setActivePartIdx(0);
  };

  const handleSubmitExam = () => {
    setIsSubmitWarningOpen(false);
    setIsSubmitting(true);
    
    // Simulate grading and redirect to result
    setTimeout(() => {
      // Calculate scores
      let listeningCorrect = 0;
      let rwCorrect = 0;

      const struct1 = structures[0];
      const struct2 = structures[1];
      if (!struct1 || !struct2) return;

      // Grade Listening
      struct1.parts.forEach((part: any) => {
        const partAnswers = answers[part.node.examPartId] || {};
        part.node.questions.forEach((q: any) => {
          if (q.isExample) return;
          q.details?.forEach((d: any) => {
            const userAnswer = partAnswers[d.id];
            const correctAnswers = d.result?.value || [];
            if (correctAnswers.includes(userAnswer)) {
              listeningCorrect++;
            }
          });
        });
      });

      // Grade Reading & Writing
      struct2.parts.forEach((part: any) => {
        const partAnswers = answers[part.node.examPartId] || {};
        part.node.questions.forEach((q: any) => {
          if (q.isExample) return;
          
          if (q.choices && q.choices.length > 0 && !q.details?.length) {
            // Multiple choice on question level
            const userAnswer = partAnswers[q.id];
            // Look up correct choice
            const correctChoice = q.choices.find((c: any) => c.label === "correct" || c.isCorrect)?.text;
            if (userAnswer === correctChoice) {
              rwCorrect++;
            }
          }
          
          q.details?.forEach((d: any) => {
            const userAnswer = String(partAnswers[d.id] || "").trim().toLowerCase();
            const correctAnswers = (d.result?.value || []).map((v: string) => v.toLowerCase().trim());
            if (correctAnswers.includes(userAnswer)) {
              rwCorrect++;
            }
          });
        });
      });

      const totalScore = listeningCorrect + rwCorrect;
      
      // Redirect
      router.push(`/testresult?score=${totalScore}&listening=${listeningCorrect}&rw=${rwCorrect}&total=60`);
    }, 2500);
  };

  // Helper to update answers
  const updateAnswer = (partId: string, itemKey: string, val: any) => {
    setAnswers((prev) => ({
      ...prev,
      [partId]: {
        ...(prev[partId] || {}),
        [itemKey]: val,
      },
    }));
  };

  // Compute progress percentage across both structures
  const totalSteps = structures.reduce((acc, s) => acc + s.parts.length, 0);
  const listeningPartsCount = structures[0]?.parts?.length || 0;
  const currentStepIndex = (activeStructIdx === 0) ? activePartIdx : listeningPartsCount + activePartIdx;
  const progressPercent = Math.min(100, Math.round((currentStepIndex / totalSteps) * 100));

  return (
    <main className="relative w-full h-[100dvh] overflow-hidden bg-[#16143c] flex flex-col justify-between select-none font-sans">
      {/* Background Image */}
      <Image
        src="/clone-assets/exam-media/bg.894c95ef.png"
        alt=""
        fill
        priority
        className="object-cover opacity-80 pointer-events-none"
      />

      {/* 1. Header Bar (Matching Original Flex Container) */}
      <header className="relative z-20 flex px-[3%] pt-[1.5%] justify-between items-center gap-x-[5%] w-full">
        {/* Left Section: Back / Exit & Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="w-11 h-11 rounded-2xl bg-gradient-to-b from-[#8FDDFF] to-[#005CAB] p-[2px] flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            <div className="w-full h-full rounded-[14px] bg-gradient-to-b from-[#4DA7FF] to-[#1985F6] flex items-center justify-center text-white">
              <X className="w-5 h-5" />
            </div>
          </button>

          {/* Title plate matching background decoration */}
          <div className="relative px-5 py-2 rounded-2xl bg-slate-900/60 border border-white/20 backdrop-blur-md flex flex-col text-left">
            <span className="text-white text-[10px] font-bold tracking-wider uppercase opacity-75">Movers Practice Test 1</span>
            <span className="text-[#FFE03B] text-xs font-black uppercase tracking-wide">
              {currentStruct.structureType.name} - Phần {activePartIdx + 1}/{totalPartsInStruct}
            </span>
          </div>
        </div>

        {/* Center Section: Game Style Progress Bar */}
        <div className="relative flex-1 max-w-[35%] h-[18px] bg-slate-950/70 border border-white/10 rounded-full flex items-center p-0.5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-[#4DFF8A] to-[#19F685] rounded-full transition-all duration-500 shadow-md"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Progress tip character dot */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-[#FFE03B] rounded-full border-2 border-white flex items-center justify-center text-xs font-black text-slate-800 shadow-md transition-all duration-500"
            style={{ left: `calc(${progressPercent}% - 12px)` }}
          >
            🦕
          </div>
        </div>

        {/* Right Section: Orange Game Style Timer & Exit Button */}
        <div className="flex items-center gap-3">
          {/* Circular/pill Timer */}
          <div className="relative rounded-[12px] p-[2.5px] bg-gradient-to-b from-[#FDDBD4] to-[#BF381C] shadow-lg">
            <div className="px-4 py-1.5 rounded-[10px] bg-gradient-to-b from-[#F48E77] to-[#E36245] flex items-center gap-2 text-white font-extrabold text-sm tracking-wide">
              <Clock className="w-4 h-4" />
              <span>{formatTime(currentTimer)}</span>
            </div>
          </div>

          <div className="relative w-16 h-10 max-md:hidden">
            <Image
              src="/clone-assets/exam/MOVERS.824079bd.png"
              alt="MOVERS"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </header>

      {/* 2. Main Content Area (Click Navs + Notebook Exam-Book) */}
      <div className="w-full flex-1 flex items-center justify-between px-[2%] relative z-10 my-4">
        
        {/* Left Navigation Arrow */}
        <button
          onClick={handlePrevPart}
          disabled={activePartIdx === 0 && activeStructIdx === 0}
          className="w-12 h-12 rounded-full bg-gradient-to-b from-[#8FDDFF] to-[#005CAB] p-[2.5px] flex items-center justify-center shadow-2xl disabled:opacity-30 disabled:pointer-events-none hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0 z-20"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#4DA7FF] to-[#1985F6] flex items-center justify-center text-white">
            <ArrowLeft className="w-5 h-5 stroke-[3px]" />
          </div>
        </button>

        {/* The Open-Book layout ("exam-book" with linear-gradient borders) */}
        <div className="flex-1 max-w-[88%] h-[74vh] flex flex-col [background-image:linear-gradient(#efeef0,#efeef0),linear-gradient(#f3a770,#f37b70)] [background-origin:padding-box,border-box] [background-clip:padding-box,border-box] border-4 border-transparent rounded-[24px] p-5 shadow-2xl relative overflow-hidden bg-white">
          <div className="flex flex-col h-full overflow-hidden">
            
            {/* Listening Part 1 & 5: Drag & Drop matching name */}
            {activeStructIdx === 0 && (currentPart.node.partType === "dragdrop" || currentPart.node.partType === "matching_images") && (
              <div className="flex flex-col h-full justify-between items-center gap-3">
                {/* Names Picker (Floating Pills) */}
                <div className="flex flex-wrap gap-2.5 justify-center bg-slate-100/80 p-3 rounded-2xl border border-slate-200/60 w-full shadow-sm shrink-0">
                  {currentPart.node.questions[0]?.choices?.map((c: any) => {
                    const matchedName = c.text || c.label;
                    const isSelected = selectedItemName === matchedName;
                    
                    // Check if already matched in any box
                    const isMatched = Object.values(answers[currentPart.node.examPartId] || {}).includes(matchedName);

                    return (
                      <button
                        key={matchedName}
                        onClick={() => setSelectedItemName(isSelected ? null : matchedName)}
                        className={`relative rounded-[10px] p-[2px] transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#1985F6] scale-105"
                            : isMatched
                            ? "bg-slate-200 opacity-50 pointer-events-none"
                            : "bg-gradient-to-b from-[#FFE03B] to-[#E39600] hover:scale-102"
                        }`}
                      >
                        <div className={`px-4 py-1.5 rounded-[8px] text-xs font-black tracking-wide border-b-2 ${
                          isSelected
                            ? "bg-[#4DA7FF] text-white border-[#1985F6]"
                            : "bg-white text-slate-800 border-slate-300"
                        }`}>
                          {matchedName}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Main image content canvas */}
                <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full max-w-[680px] max-h-[460px] aspect-[1.33] border border-slate-200 rounded-2xl overflow-hidden shadow-inner bg-slate-50">
                    {currentPart.node.questions[0]?.content?.text && (
                      <Image
                        src={currentPart.node.questions[0].content.text}
                        alt="Exam content"
                        fill
                        className="object-contain select-none"
                        draggable={false}
                      />
                    )}
                    {/* Absolute Target Areas */}
                    {currentPart.node.questions[0]?.details?.map((d: any) => {
                      const box = d.detail.box;
                      if (!box) return null;
                      
                      const partAnswers = answers[currentPart.node.examPartId] || {};
                      const matchedName = partAnswers[d.id];

                      return (
                        <button
                          key={d.id}
                          onClick={() => {
                            if (selectedItemName) {
                              updateAnswer(currentPart.node.examPartId, d.id, selectedItemName);
                              setSelectedItemName(null);
                            } else if (matchedName) {
                              updateAnswer(currentPart.node.examPartId, d.id, null);
                            }
                          }}
                          style={{
                            position: "absolute",
                            left: box.left,
                            top: box.top,
                            width: box.width,
                            height: box.height,
                          }}
                          className={`border-2 border-dashed rounded-xl flex items-center justify-center transition-all ${
                            matchedName
                              ? "bg-gradient-to-b from-[#4DA7FF] to-[#1985F6] border-[#005CAB] text-white text-xs font-black shadow-lg scale-105"
                              : "bg-white/40 border-slate-400 hover:bg-white/70 hover:border-[#1985F6]"
                          }`}
                          title={matchedName ? "Nhấp để xoá" : "Nhấp để gán tên"}
                        >
                          <span className="truncate max-w-full px-1">
                            {matchedName || ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Listening Part 2: Gap Fill Form (Split Two Columns Page) */}
            {activeStructIdx === 0 && currentPart.node.partType === "gapfill" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full overflow-hidden">
                {/* Left Page (Instructions & Audio Player) */}
                <div className="md:col-span-5 flex flex-col justify-between bg-slate-50 border border-slate-200/80 p-5 rounded-2xl h-full overflow-y-auto">
                  <div>
                    <span className="px-2.5 py-1 bg-violet-600 text-white font-extrabold text-[10px] uppercase rounded-md tracking-wider">
                      Audio Player
                    </span>
                    <h3 className="text-slate-800 text-base font-black mt-3 leading-snug">
                      {currentPart.node.title}
                    </h3>
                  </div>

                  {/* Cute Sound system player */}
                  <div className="my-6 p-5 rounded-3xl bg-slate-100 border border-slate-200 flex flex-col items-center gap-3">
                    <span className="text-slate-500 text-xs font-black tracking-wider uppercase">Nghe Audio</span>
                    <button
                      onClick={toggleAudio}
                      className="w-16 h-16 rounded-full bg-gradient-to-b from-[#FFE03B] to-[#E39600] border-b-4 border-[#B07400] shadow-md flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-7 h-7 fill-white" /> : <Play className="w-7 h-7 fill-white ml-1" />}
                    </button>
                    <span className="text-[#1985F6] text-xs font-bold animate-pulse">
                      {isPlaying ? "Đang phát..." : "Nhấp để phát"}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-semibold italic">
                    * Nhấp vào ô trống bên phải và điền từ khóa nghe được.
                  </div>
                </div>

                {/* Right Page (The Form) */}
                <div className="md:col-span-7 bg-slate-100/50 border border-slate-200/60 p-5 rounded-2xl h-full overflow-y-auto flex flex-col gap-4">
                  {(() => {
                    const imgContent = currentPart.node.contents?.find((c: any) => c.body?.formattedText?.format === "IMAGE_ID");
                    if (!imgContent?.body?.formattedText?.text) return null;
                    return (
                      <div className="relative w-full h-[150px] rounded-xl overflow-hidden border border-slate-200/80 bg-white shrink-0">
                        <Image
                          src={imgContent.body.formattedText.text}
                          alt="Banner"
                          fill
                          className="object-contain"
                        />
                      </div>
                    );
                  })()}

                  <div className="flex flex-col gap-3">
                    {currentPart.node.questions.map((q: any) => {
                      if (q.isExample) {
                        return (
                          <div key={q.id} className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500">
                            <strong>Ví dụ:</strong> <span dangerouslySetInnerHTML={{ __html: q.content?.text }} />
                          </div>
                        );
                      }
                      
                      return (
                        <div key={q.id} className="flex flex-col gap-2">
                          {q.details?.map((d: any) => {
                            const partAnswers = answers[currentPart.node.examPartId] || {};
                            const userVal = partAnswers[d.id] || "";
                            const textPrompt = q.content?.text || "";
                            const label = d.detail.formattedText?.text || "";

                            return (
                              <div key={d.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <span className="w-7 h-7 rounded-full bg-[#1985F6] text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                                  {label}
                                </span>
                                <div className="flex-1 flex items-center justify-between gap-4">
                                  <div dangerouslySetInnerHTML={{ __html: textPrompt.replace(`{{${label}}}`, "______") }} className="text-xs font-bold text-slate-700" />
                                  <input
                                    type="text"
                                    value={userVal}
                                    onChange={(e) => updateAnswer(currentPart.node.examPartId, d.id, e.target.value)}
                                    placeholder="..."
                                    className="w-32 px-3 py-1.5 border-2 border-slate-200 rounded-lg focus:border-[#1985F6] focus:outline-none text-xs font-black text-center bg-slate-50"
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Listening Part 3: Matching (Image with letter box) */}
            {activeStructIdx === 0 && currentPart.node.partType === "matching" && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full overflow-hidden">
                
                {/* Left side: list of item images that need letters */}
                <div className="md:col-span-6 flex flex-col gap-3 overflow-y-auto pr-1">
                  <h3 className="text-slate-800 text-xs font-black uppercase tracking-wider border-b pb-2 mb-1">
                    Điền chữ cái (A-H) tương ứng
                  </h3>
                  
                  {currentPart.node.questions.map((q: any) => {
                    if (q.isExample) return null;
                    const detail = q.details?.[0];
                    if (!detail) return null;

                    const partAnswers = answers[currentPart.node.examPartId] || {};
                    const userLetter = partAnswers[detail.id] || "";

                    return (
                      <div key={q.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          {detail.detail.formattedText?.text && (
                            <div className="relative w-12 h-12 rounded-lg border bg-white overflow-hidden shrink-0">
                              <Image
                                src={detail.detail.formattedText.text}
                                alt=""
                                fill
                                className="object-contain"
                              />
                            </div>
                          )}
                          <span className="font-extrabold text-xs text-slate-700">
                            {detail.detail.formattedText?.label || "Vật phẩm"}
                          </span>
                        </div>

                        <select
                          value={userLetter}
                          onChange={(e) => updateAnswer(currentPart.node.examPartId, detail.id, e.target.value)}
                          className="w-14 h-9 rounded-lg border-2 border-slate-200 bg-white text-center font-black text-xs text-slate-700 focus:outline-none focus:border-[#1985F6]"
                        >
                          <option value="">-</option>
                          {["A", "B", "C", "D", "E", "F", "G", "H"].map(l => (
                            <option key={l} value={l}>{l}</option>
                          ))}
                        </select>
                      </div>
                    );
                  })}
                </div>

                {/* Right side: images options grid (Letters A-H) */}
                <div className="md:col-span-6 bg-slate-100/60 border border-slate-200/50 p-4 rounded-2xl h-full overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3.5">
                    {(() => {
                      const imageContent = currentPart.node.contents?.find((c: any) => c.body?.images);
                      return imageContent?.body?.images?.map((img: any) => (
                        <div key={img.label} className="bg-white p-2 rounded-xl border border-slate-200 flex flex-col items-center gap-1 shadow-sm relative">
                          <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                            <Image
                              src={img.imageId}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="w-5 h-5 rounded-full bg-[#1985F6] text-white text-[10px] font-black flex items-center justify-center shadow">
                            {img.label}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}

            {/* Listening Part 4: Multiple Choice Tick Box */}
            {activeStructIdx === 0 && currentPart.node.partType === "multichoice" && (
              <div className="flex flex-col gap-5 h-full overflow-y-auto pr-1">
                {currentPart.node.questions.map((q: any, idx: number) => {
                  const partAnswers = answers[currentPart.node.examPartId] || {};
                  const userVal = partAnswers[q.id];

                  if (q.isExample) {
                    return (
                      <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold">
                        <strong>Ví dụ:</strong> {q.title} (Đáp án mẫu đã được điền)
                      </div>
                    );
                  }

                  return (
                    <div key={q.id} className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#1985F6] text-white font-extrabold flex items-center justify-center text-[10px]">
                          {idx}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-700">{q.title}</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {q.details?.map((d: any) => {
                          const label = d.labelOrder; // A, B, C
                          const isSelected = userVal === label;

                          return (
                            <button
                              key={d.id}
                              onClick={() => updateAnswer(currentPart.node.examPartId, q.id, label)}
                              className={`p-2.5 rounded-xl border-2 bg-white flex flex-col items-center gap-1.5 cursor-pointer transition-all hover:border-[#4DA7FF]/50 ${
                                isSelected
                                  ? "border-[#1985F6] bg-[#1985F6]/5 scale-[1.01] shadow-sm"
                                  : "border-slate-200"
                              }`}
                            >
                              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-slate-100 bg-slate-50">
                                {d.detail?.formattedText?.text && (
                                  <Image
                                    src={d.detail.formattedText.text}
                                    alt=""
                                    fill
                                    className="object-cover"
                                  />
                                )}
                              </div>
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center border font-black text-[10px] ${
                                isSelected
                                  ? "bg-[#1985F6] text-white border-[#1985F6]"
                                  : "bg-slate-100 text-slate-500 border-slate-350"
                              }`}>
                                {label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reading-Writing Part 1: Definitions matching words */}
            {activeStructIdx === 1 && activePartIdx === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full overflow-hidden">
                {/* Left Page: Word Pool */}
                <div className="md:col-span-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl h-full overflow-y-auto">
                  <h4 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wide border-b pb-2 mb-3">
                    Hộp từ vựng
                  </h4>
                  <div className="flex flex-col gap-2">
                    {currentPart.node.questions[1]?.choices?.map((c: any) => (
                      <span key={c.text} className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-black text-slate-700 text-center shadow-sm">
                        {c.text}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right Page: Definitions list */}
                <div className="md:col-span-8 flex flex-col gap-3 overflow-y-auto pr-1">
                  {currentPart.node.questions.map((q: any) => {
                    if (q.isExample) {
                      return (
                        <div key={q.id} className="p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500">
                          <strong>Ví dụ:</strong> <span dangerouslySetInnerHTML={{ __html: q.content?.text }} />
                        </div>
                      );
                    }

                    return (
                      <div key={q.id} className="flex flex-col gap-3">
                        {q.details?.map((d: any) => {
                          const partAnswers = answers[currentPart.node.examPartId] || {};
                          const userVal = partAnswers[d.id] || "";
                          const cleanText = q.content?.text?.replace(/<[^>]*>/g, "") || "";

                          return (
                            <div key={d.id} className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <p className="text-xs font-bold text-slate-700 flex-1 leading-normal">
                                {cleanText.replace(`{{${d.labelOrder}}}`, "______")}
                              </p>
                              <select
                                value={userVal}
                                onChange={(e) => updateAnswer(currentPart.node.examPartId, d.id, e.target.value)}
                                className="w-40 px-3 py-1.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-[#1985F6] font-black text-xs bg-slate-50"
                              >
                                <option value="">Chọn từ...</option>
                                {currentPart.node.questions[1]?.choices?.map((c: any) => (
                                  <option key={c.text} value={c.text}>{c.text}</option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reading-Writing Part 2: Daisy / Paul dialogue MC */}
            {activeStructIdx === 1 && activePartIdx === 1 && (
              <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
                {currentPart.node.questions.map((q: any, idx: number) => {
                  const partAnswers = answers[currentPart.node.examPartId] || {};
                  const userVal = partAnswers[q.id];

                  if (q.isExample) {
                    return (
                      <div key={q.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 font-semibold">
                        <strong>Ví dụ:</strong> Daisy: "{q.title}" <br />
                        <span className="italic text-slate-400">Paul: Yes, they are!</span>
                      </div>
                    );
                  }

                  return (
                    <div key={q.id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex flex-col gap-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#1985F6] text-white font-extrabold flex items-center justify-center text-[10px]">
                          {idx}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-700">Daisy: "{q.title}"</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {["A", "B", "C"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => updateAnswer(currentPart.node.examPartId, q.id, opt)}
                            className={`px-3 py-2 rounded-lg border-2 text-left flex items-center gap-2.5 cursor-pointer transition-colors ${
                              userVal === opt
                                ? "border-[#1985F6] bg-[#1985F6]/5 font-black text-[#1985F6]"
                                : "border-slate-200 bg-white text-slate-600 font-semibold"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] font-black ${
                              userVal === opt ? "bg-[#1985F6] text-white" : "bg-slate-100"
                            }`}>
                              {opt}
                            </div>
                            <span className="text-xs">Lựa chọn {opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Reading-Writing Parts 3, 4, 5, 6: Story, Teeth, Map, Pictures */}
            {activeStructIdx === 1 && activePartIdx >= 2 && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 h-full overflow-hidden">
                
                {/* Left Page (The Article / Story Passage) */}
                <div className="md:col-span-6 bg-slate-50 border border-slate-200 p-5 rounded-2xl h-full overflow-y-auto leading-relaxed text-slate-700 text-xs font-semibold">
                  {/* Image banner if present */}
                  {currentPart.node.questions[0]?.content?.format === "IMAGE_ID" && currentPart.node.questions[0]?.content?.text && (
                    <div className="relative w-full h-[150px] rounded-xl overflow-hidden mb-4 border bg-white">
                      <Image
                        src={currentPart.node.questions[0].content.text}
                        alt="Exam Banner"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}

                  {currentPart.node.questions.map((q: any) => {
                    if (q.content?.format === "HTML" || q.content?.format === "TEXT") {
                      return (
                        <div key={q.id} className="flex flex-col gap-3">
                          {q.title && <h3 className="font-black text-slate-800 text-sm text-center mb-2">{q.title}</h3>}
                          <div dangerouslySetInnerHTML={{ __html: q.content.text.replace(/\{\{\d\}\}/g, "______") }} />
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Right Page (The Questions & Fillings) */}
                <div className="md:col-span-6 bg-slate-100/40 border border-slate-200/50 p-5 rounded-2xl h-full overflow-y-auto flex flex-col gap-3">
                  <h4 className="font-extrabold text-[10px] text-slate-500 uppercase tracking-wide border-b pb-2 mb-1">
                    Bản trả lời
                  </h4>
                  
                  {currentPart.node.questions.map((q: any) => {
                    return q.details?.map((d: any) => {
                      const partAnswers = answers[currentPart.node.examPartId] || {};
                      const userVal = partAnswers[d.id] || "";
                      const label = d.labelOrder || d.detail?.formattedText?.text || "Answer";

                      return (
                        <div key={d.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
                          <span className="w-7 h-7 rounded-full bg-[#1985F6] text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                            {label}
                          </span>
                          
                          {/* If multiple choices are available on details level (like drop-downs) */}
                          {q.choices && q.choices.length > 0 ? (
                            <select
                              value={userVal}
                              onChange={(e) => updateAnswer(currentPart.node.examPartId, d.id, e.target.value)}
                              className="flex-1 px-3 py-1.5 border-2 border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:border-[#1985F6] font-black text-xs"
                            >
                              <option value="">Chọn từ...</option>
                              {q.choices.map((c: any) => (
                                <option key={c.text} value={c.text}>{c.text}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={userVal}
                              onChange={(e) => updateAnswer(currentPart.node.examPartId, d.id, e.target.value)}
                              placeholder="Nhập câu trả lời..."
                              className="flex-1 px-3 py-1.5 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-[#1985F6] text-xs font-black bg-slate-50/50"
                            />
                          )}
                        </div>
                      );
                    });
                  })}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Navigation Arrow */}
        <button
          onClick={handleNextPart}
          className="w-12 h-12 rounded-full bg-gradient-to-b from-[#8FDDFF] to-[#005CAB] p-[2.5px] flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer shrink-0 z-20"
        >
          <div className="w-full h-full rounded-full bg-gradient-to-b from-[#4DA7FF] to-[#1985F6] flex items-center justify-center text-white">
            <ArrowRight className="w-5 h-5 stroke-[3px]" />
          </div>
        </button>
      </div>

      {/* 3. Footer Bar (Actions and Page Indicators) */}
      <footer className="relative z-20 w-full h-[85px] px-[3%] bg-slate-900/60 border-t border-white/10 backdrop-blur-md flex items-center justify-between">
        <button
          onClick={handlePrevPart}
          disabled={activePartIdx === 0 && activeStructIdx === 0}
          className="px-5 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white font-extrabold text-xs flex items-center gap-2 hover:bg-white/20 active:scale-95 transition-transform disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        {/* Level & Mode Indicator */}
        <div className="flex flex-col items-center max-sm:hidden">
          <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Chế độ làm bài</span>
          <span className="text-white text-xs font-black tracking-wide">THI THỬ (EXAM)</span>
        </div>

        {/* Done / Next button */}
        <button
          onClick={handleNextPart}
          className="relative rounded-[12px] p-[2.5px] bg-gradient-to-b from-[#8FDDFF] to-[#005CAB] cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          <div className="px-6 py-2 rounded-[10px] bg-gradient-to-b from-[#4DA7FF] to-[#1985F6] text-white font-extrabold text-xs flex items-center gap-2">
            <span>Tiếp theo</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </footer>

      {/* Modal Transition: Listening Complete */}
      {isTransitionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative p-8 w-[480px] max-w-full rounded-[32px] border-4 border-slate-600 text-center overflow-hidden bg-slate-900">
            <div className="relative z-10 flex flex-col items-center">
              <AlertTriangle className="w-14 h-14 text-[#FFE03B] mb-4 animate-bounce" />
              <h3 className="text-white text-lg font-black uppercase tracking-wider mb-2">Bạn không thể quay lại và chỉnh sửa bài làm</h3>
              <p className="text-white/80 text-xs leading-relaxed mb-6">
                Bạn có chắc chắn đã kiểm tra lại và hoàn thiện phần bài thi nghe này?
              </p>
              
              <div className="bg-slate-950/70 border border-white/10 rounded-2xl p-4.5 w-full text-left flex flex-col gap-2 mb-6">
                <span className="text-[#FFE03B] font-extrabold text-[10px] uppercase tracking-wider">Thông tin phần thi tiếp theo</span>
                <span className="text-white font-black text-sm uppercase">Reading - Writing</span>
                <div className="flex justify-between text-white/80 text-xs mt-1">
                  <span>Điểm tối đa: <strong className="text-[#FFE03B]">35 điểm</strong></span>
                  <span>Thời lượng: <strong className="text-[#FFE03B]">30 phút</strong></span>
                </div>
              </div>

              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setIsTransitionOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-white/20 bg-white/5 text-white font-black text-xs hover:bg-white/10 active:scale-95 transition-transform cursor-pointer"
                >
                  Xem lại
                </button>
                <button
                  onClick={handleStartReadingWriting}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-b from-[#4DFF8A] to-[#19F685] text-slate-950 font-black text-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                  Làm tiếp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Submit confirmation: Reading-Writing Complete */}
      {isSubmitWarningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative p-8 w-[450px] max-w-full rounded-[32px] border-4 border-slate-600 text-center overflow-hidden bg-slate-900">
            <div className="relative z-10 flex flex-col items-center">
              <CheckCircle className="w-14 h-14 text-[#FFE03B] mb-4" />
              <h3 className="text-white text-lg font-black uppercase tracking-wider mb-2">Nộp bài thi</h3>
              <p className="text-white/80 text-xs leading-relaxed mb-6">
                Bạn có chắc chắn muốn nộp bài thi? Vui lòng kiểm tra lại thật kỹ các đáp án trước khi gửi.
              </p>

              <div className="flex gap-4 w-full">
                <button
                  onClick={() => setIsSubmitWarningOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-white/20 bg-white/5 text-white font-black text-xs hover:bg-white/10 active:scale-95 transition-transform cursor-pointer"
                >
                  Xem lại
                </button>
                <button
                  onClick={handleSubmitExam}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-b from-[#FFE03B] to-[#E39600] text-white font-black text-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                >
                  Nộp bài
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submission Loading Screen */}
      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#16143c]">
          <div className="relative w-[160px] h-[160px] mb-6">
            <div className="absolute inset-0 border-8 border-t-[#FFE03B] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
            <div className="absolute inset-2 border-8 border-b-[#19F685] border-t-transparent border-r-transparent border-l-transparent rounded-full animate-spin [animation-duration:1.5s]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Volume2 className="w-10 h-10 text-[#FFE03B] animate-pulse" />
            </div>
          </div>
          <h3 className="text-white font-black text-base uppercase tracking-wider animate-pulse">Đang chấm điểm...</h3>
          <p className="text-white/70 text-xs mt-2">Vui lòng đợi giây lát trong khi chúng tôi hoàn thiện</p>
        </div>
      )}
    </main>
  );
}
