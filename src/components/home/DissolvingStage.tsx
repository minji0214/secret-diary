// src/components/home/DissolvingStage.tsx
export default function DissolvingStage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-6">
      <div className="w-12 h-12 rounded-full border border-accentViolet/30 border-t-accentViolet animate-spin" />
      <p className="font-serif text-lg text-accentPink animate-pulse">
        당신의 감정을 우주에 흘려보내는 중...
      </p>
      <p className="text-xs text-white/40">
        조용히 흩어진 후 따스하게 되돌아옵니다.
      </p>
    </div>
  )
}
