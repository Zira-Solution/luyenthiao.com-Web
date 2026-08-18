import { BingoOnboarding } from "@/components/dashboard/bingo-onboarding";

export default function Home() {
  return (
    <main className="min-h-screen relative">
      {/* Background will be handled by onboarding overlay, or real dashboard background here */}
      <div className="absolute inset-0 bg-[#16143c] -z-20" />
      
      {/* Dashboard placeholder text behind the modal */}
      <div className="flex items-center justify-center h-screen text-white text-2xl font-bold opacity-50">
        Dashboard Content (Placeholder)
      </div>

      <BingoOnboarding />
    </main>
  );
}
