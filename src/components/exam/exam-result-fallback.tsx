/** Shown while `ExamResultView` waits for its search params. */
export function ExamResultFallback(): React.ReactElement {
  return (
    <main className="w-full h-[100dvh] bg-dashboard-bg flex items-center justify-center text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white" />
    </main>
  );
}
