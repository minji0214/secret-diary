'use client'

import { useRouter } from 'next/navigation'
import { EmotionTag, MOCK_AI_RESPONSES } from '@/lib/tarot-data'

interface ResponseStageProps {
  text: string
  tag: EmotionTag | null
  onReset: () => void
}

export default function ResponseStage({ text, tag, onReset }: ResponseStageProps) {
  const router = useRouter()
  const aiResponse = tag ? MOCK_AI_RESPONSES[tag] : MOCK_AI_RESPONSES['default']
  const displayText = text.trim() || '아무 말이나 흘려써도 괜찮아.'

  return (
    <div className="flex flex-col gap-5">
      <div className="max-h-[420px] overflow-y-auto pr-1 flex flex-col gap-4">
        {/* User bubble */}
        <div className="flex flex-col items-end">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white/80 max-w-[85%]">
            <p>"{displayText}"</p>
          </div>
          <span className="text-[9px] text-white/30 mt-1 mr-1">흘려보낸 감정</span>
        </div>

        {/* AI bubble */}
        <div className="flex flex-col items-start mt-2">
          <div className="flex items-center gap-1.5 mb-1.5 ml-1">
            <div className="w-5 h-5 rounded-full bg-accentViolet/20 border border-accentViolet/50 flex items-center justify-center text-[9px]">
              🌙
            </div>
            <span className="text-[10px] text-accentPink font-medium">새벽 친구</span>
          </div>
          <div className="bg-purpleDust/80 border border-accentViolet/25 rounded-2xl px-4 py-3.5 text-xs text-white/90 max-w-[90%] leading-relaxed">
            <p className="italic">"{aiResponse}"</p>
          </div>
        </div>

        {/* Tarot offer banner */}
        <div className="border border-accentViolet/30 bg-accentViolet/10 rounded-2xl p-4 flex flex-col gap-3 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-accentPink text-sm" aria-hidden="true">🔮</span>
            <span className="text-xs font-semibold text-accentPink">무의식의 1장 타로 리딩</span>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            "지금 마음으로 카드 한 장 볼래?"
          </p>
          <button
            onClick={() => router.push('/tarot')}
            className="w-full py-2 bg-accentViolet text-[11px] font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all"
          >
            네, 카드 한 장 볼래요
          </button>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="text-xs text-white/30 hover:text-white/60 transition-colors text-center mt-2"
      >
        ↺ 다시 써보기
      </button>
    </div>
  )
}
