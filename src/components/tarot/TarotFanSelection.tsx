// src/components/tarot/TarotFanSelection.tsx
'use client'

import { useMemo, useState } from 'react'
import { TarotCard, TAROT_CARDS } from '@/lib/tarot-data'

interface TarotFanSelectionProps {
  onSelect: (card: TarotCard) => void
}

const FAN_ANGLES = [-36, -24, -12, 0, 12, 24, 36]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function TarotFanSelection({ onSelect }: TarotFanSelectionProps) {
  const fanCards = useMemo(() => shuffle(TAROT_CARDS).slice(0, 7), [])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-3xl text-white/95 leading-relaxed mb-1">
          무의식의 선택
        </h2>
        <p className="text-xs text-white/40 leading-relaxed">
          마음이 끌리는 카드를 하나 골라요.
        </p>
      </div>

      {/* Fan spread container */}
      <div className="relative h-[220px] w-full flex items-end justify-center">
        {fanCards.map((card, i) => (
          <button
            key={card.id}
            aria-label={`카드 ${i + 1} 선택`}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onSelect(card)}
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) rotate(${FAN_ANGLES[i]}deg)${hoveredIndex === i ? ' translateY(-20px)' : ''}`,
              transition: 'transform 300ms ease',
              zIndex: hoveredIndex === i ? 10 : i,
            }}
            className="w-[72px] h-[124px] rounded-xl bg-gradient-to-br from-[#1F1836] to-[#0D0A18] border border-accentViolet/40 hover:border-accentViolet/80 flex items-center justify-center shadow-lg active:scale-95"
          >
            <div className="w-10 h-16 rounded-lg border border-accentViolet/15 flex flex-col justify-between items-center py-2">
              <span className="text-[7px] text-accentViolet/50">✦</span>
              <div className="w-4 h-4 rounded-full border border-dashed border-accentViolet/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-accentPink/50 rounded-full" />
              </div>
              <span className="text-[7px] text-accentViolet/50">✦</span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-white/25 text-center tracking-widest font-display animate-pulse">
        TAP TO CHOOSE
      </p>
    </div>
  )
}
