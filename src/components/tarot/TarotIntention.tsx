// src/components/tarot/TarotIntention.tsx
'use client'

import type { LastEmotion } from '@/lib/tarot-data'
import GlassPanel from '@/components/ui/GlassPanel'

interface TarotIntentionProps {
  lastEmotion: LastEmotion | null
  onStart: () => void
}

export default function TarotIntention({ lastEmotion, onStart }: TarotIntentionProps) {
  const hasEmotion = lastEmotion?.tag != null

  return (
    <div className="flex flex-col gap-8 pt-4">
      {hasEmotion && (
        <div className="inline-flex items-center gap-2 self-start bg-accentPink/10 border border-accentPink/25 rounded-full px-4 py-1.5">
          <span className="text-accentPink text-[10px]">✦</span>
          <span className="text-accentPink text-[11px] font-medium">
            {lastEmotion!.tag}에 대한 리딩
          </span>
        </div>
      )}

      <div>
        <h2 className="font-serif text-3xl text-white/95 leading-relaxed mb-2">
          {hasEmotion ? '지금 마음을 담아\n카드를 골라봐요' : '지금 마음으로\n카드 한 장 골라봐요'}
        </h2>
        <p className="text-xs text-white/40 leading-relaxed">
          숨을 고르고, 가장 마음에 걸리는 것에 집중해요.
        </p>
      </div>

      {lastEmotion?.text && (
        <GlassPanel className="px-4 py-3">
          <p className="text-xs text-white/50 leading-relaxed line-clamp-3 italic">
            "{lastEmotion.text}"
          </p>
        </GlassPanel>
      )}

      <button
        onClick={onStart}
        className="w-full py-4 bg-accentViolet hover:opacity-90 active:scale-95 text-white font-semibold rounded-2xl transition-all text-sm"
      >
        카드 고르러 가기
      </button>
    </div>
  )
}
