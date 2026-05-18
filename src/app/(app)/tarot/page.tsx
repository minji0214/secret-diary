'use client'

import { useState } from 'react'
import { TarotCard, TarotStage } from '@/lib/tarot-data'
import CardSelection from '@/components/tarot/CardSelection'
import CardReveal from '@/components/tarot/CardReveal'

export default function TarotPage() {
  const [stage, setStage] = useState<TarotStage>('selection')
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null)

  function handleSelect(card: TarotCard) {
    setSelectedCard(card)
    setStage('revealed')
  }

  function handleReset() {
    setSelectedCard(null)
    setStage('selection')
  }

  return (
    <div className="min-h-screen px-6 pt-12 pb-6">
      <div className="flex justify-between items-center mb-8">
        <span className="text-xs tracking-[0.2em] font-display text-accentPink/60">
          TAROT READINGS
        </span>
        {stage === 'revealed' && (
          <button
            onClick={handleReset}
            className="text-white/40 hover:text-white transition-colors text-xs"
          >
            <span aria-hidden="true">↺</span> 셔플하기
          </button>
        )}
      </div>

      {stage === 'selection' && <CardSelection onSelect={handleSelect} />}
      {stage === 'revealed' && selectedCard && (
        <CardReveal card={selectedCard} onReset={handleReset} />
      )}
    </div>
  )
}
