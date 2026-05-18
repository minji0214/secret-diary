'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { TarotCard } from '@/lib/tarot-data'

interface CardRevealProps {
  card: TarotCard
  onReset: () => void
}

export default function CardReveal({ card, onReset }: CardRevealProps) {
  const [flipped, setFlipped] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const id = requestAnimationFrame(() => setFlipped(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="flex flex-col items-center gap-6">
      {/* 3D flip card */}
      <div className="perspective-1000 w-[140px] h-[240px]">
        <div
          className="w-full h-full relative transform-style-3d transition-transform duration-700"
          style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Back face */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1F1836] to-[#0D0A18] border-2 border-accentViolet/40 backface-hidden flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-dashed border-accentViolet/40 flex items-center justify-center">
              <div className="w-3 h-3 bg-accentPink/60 rounded-full" />
            </div>
          </div>

          {/* Front face */}
          <div
            className="absolute inset-0 rounded-2xl bg-[#1C162E] border-2 border-accentPink/50 p-4 flex flex-col justify-between backface-hidden shadow-2xl"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <div className={`w-full h-full rounded-xl border border-accentPink/20 flex flex-col justify-between items-center py-3 bg-gradient-to-br ${card.bgGradient}`}>
              <span className="text-[9px] uppercase tracking-[0.2em] text-accentPink font-display">
                {card.name}
              </span>
              <span className="text-4xl" aria-hidden="true">{card.icon}</span>
              <span className="text-[9px] font-bold tracking-[0.1em] text-white text-center px-1">
                {card.cardLabel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="text-center px-2 flex flex-col items-center gap-3">
        <span className="text-xs text-accentPink bg-accentPink/10 px-3 py-1 rounded-full border border-accentPink/20">
          {card.cardLabel}
        </span>
        <p
          className="text-xs text-white/80 leading-relaxed italic max-h-[140px] overflow-y-auto"
          tabIndex={0}
          role="region"
          aria-label="카드 해석"
        >
          "{card.interpretation}"
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-full">
        <button
          onClick={() => router.push('/home')}
          className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/80 text-xs font-semibold rounded-xl border border-white/10 transition-all"
        >
          내 감정 마저 쓰기
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3 bg-accentViolet hover:opacity-90 text-white text-xs font-semibold rounded-xl transition-all"
        >
          다른 카드 뽑기
        </button>
      </div>
    </div>
  )
}
