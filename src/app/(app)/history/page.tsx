import GlassPanel from '@/components/ui/GlassPanel'

export default function HistoryPage() {
  return (
    <div className="min-h-screen px-6 pt-12 flex flex-col items-center justify-center">
      <GlassPanel className="p-8 text-center flex flex-col items-center gap-4 w-full max-w-sm">
        <span className="text-4xl" aria-hidden="true">🕰️</span>
        <h2 className="font-serif text-2xl text-white/90">기록 흐름</h2>
        <p className="text-sm text-softGray/60 leading-relaxed">
          지금까지 흘려보낸 감정들을<br />
          곧 여기서 만날 수 있어요.
        </p>
        <span className="text-xs text-accentViolet bg-accentViolet/10 border border-accentViolet/30 px-3 py-1 rounded-full">
          Coming Soon
        </span>
      </GlassPanel>
    </div>
  )
}
