// src/components/tarot/CardReveal.tsx
'use client'

import { useEffect, useState } from 'react'
import { TarotCard } from '@/lib/tarot-data'

interface CardRevealProps {
  card: TarotCard
  emotionBridge: string
  onReset: () => void
  onGoHome: () => void
}

export default function CardReveal({ card, emotionBridge, onReset, onGoHome }: CardRevealProps) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setFlipped(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="flex flex-col items-center gap-5">
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

          {/* Front face — real artwork */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-accentPink/40 backface-hidden shadow-2xl"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <img
              src={card.image}
              alt={card.nameKr}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Card name badge */}
      <div className="inline-flex items-center gap-1.5 bg-accentPink/10 border border-accentPink/25 rounded-full px-3 py-1">
        <span className="text-[10px] text-accentPink font-display tracking-widest">
          {card.romanNumeral}
        </span>
        <span className="text-[10px] text-white/40">·</span>
        <span className="text-[11px] text-accentPink font-medium">
          {card.nameKr} ({card.name})
        </span>
      </div>

      {/* Emotion bridge */}
      <p className="text-[11px] text-accentViolet/80 italic text-center px-4 leading-relaxed">
        "{emotionBridge}"
      </p>

      {/* Interpretation */}
      <p
        className="text-xs text-white/70 leading-relaxed text-center px-2 max-h-[100px] overflow-y-auto"
        tabIndex={0}
        role="region"
        aria-label="카드 해석"
      >
        {card.interpretation}
      </p>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {card.keywords.map((kw) => (
          <span
            key={kw}
            className="text-[10px] text-white/40 bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5"
          >
            #{kw}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-full mt-1">
        <button
          onClick={onGoHome}
          className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold rounded-xl border border-white/10 transition-all"
        >
          다시 적어보기
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3 bg-accentViolet hover:opacity-90 active:scale-95 text-white text-xs font-semibold rounded-xl transition-all"
        >
          다른 카드 뽑기
        </button>
      </div>
    </div>
  )
}
