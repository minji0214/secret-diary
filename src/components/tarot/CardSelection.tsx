// src/components/tarot/CardSelection.tsx
'use client'

import { TarotCard, TAROT_CARDS } from '@/lib/tarot-data'

interface CardSelectionProps {
  onSelect: (card: TarotCard) => void
}

const CARD_OFFSETS = ['translate-y-0', '-translate-y-2', 'translate-y-0']

export default function CardSelection({ onSelect }: CardSelectionProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-3xl text-white/95 leading-relaxed mb-1">
          무의식의 선택
        </h2>
        <p className="text-xs text-white/40">
          당신의 고민에 온 정신을 모으고,<br />
          가장 끌리는 카드 한 장을 선택해 주세요.
        </p>
      </div>

      {/* Cards */}
      <div className="flex justify-center gap-4 py-6 perspective-1000">
        {TAROT_CARDS.map((card, i) => (
          <button
            key={card.name}
            onClick={() => onSelect(card)}
            aria-label={`카드 ${i + 1} 선택`}
            className={`w-[95px] h-[165px] group transform ${CARD_OFFSETS[i] ?? 'translate-y-0'} transition-all duration-500 hover:-translate-y-4 hover:scale-105 active:scale-95 cursor-pointer`}
          >
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#1F1836] to-[#0D0A18] border border-accentViolet/30 group-hover:border-accentViolet/70 transition-all p-3 flex flex-col justify-between items-center">
              <div className="border border-accentViolet/10 w-full h-full rounded-lg flex flex-col justify-between items-center py-4">
                <span className="text-[8px] text-accentViolet/60 animate-pulse" aria-hidden="true">✦</span>
                <div className="w-6 h-6 rounded-full border-2 border-dashed border-accentViolet/30 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-accentPink/60 rounded-full" />
                </div>
                <span className="text-[8px] text-accentViolet/60 animate-pulse" aria-hidden="true">✦</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-white/30 text-center animate-pulse">
        카드를 누르면 뒤집힙니다
      </p>
    </div>
  )
}
