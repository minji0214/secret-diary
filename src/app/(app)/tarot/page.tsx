// src/app/(app)/tarot/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { TarotCard, TarotStage, LastEmotion, EMOTION_BRIDGE } from '@/lib/tarot-data'
import TarotIntention from '@/components/tarot/TarotIntention'
import TarotFanSelection from '@/components/tarot/TarotFanSelection'
import CardReveal from '@/components/tarot/CardReveal'

export default function TarotPage() {
  const [stage, setStage] = useState<TarotStage>('intention')
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null)
  const [lastEmotion, setLastEmotion] = useState<LastEmotion | null>(null)

  useEffect(() => {
    const raw = localStorage.getItem('lastEmotion')
    if (raw) {
      try {
        setLastEmotion(JSON.parse(raw))
      } catch {
        // malformed JSON — ignore
      }
    }
  }, [])

  function handleSelect(card: TarotCard) {
    setSelectedCard(card)
    setStage('revealed')
  }

  function handleReset() {
    setSelectedCard(null)
    setStage('selection')
  }

  const emotionBridge = lastEmotion?.tag
    ? EMOTION_BRIDGE[lastEmotion.tag]
    : EMOTION_BRIDGE['default']

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

      {stage === 'intention' && (
        <TarotIntention
          lastEmotion={lastEmotion}
          onStart={() => setStage('selection')}
        />
      )}
      {stage === 'selection' && (
        <TarotFanSelection onSelect={handleSelect} />
      )}
      {stage === 'revealed' && selectedCard && (
        <CardReveal
          card={selectedCard}
          emotionBridge={emotionBridge}
          onReset={handleReset}
          onGoHome={() => {
            setStage('intention')
            setSelectedCard(null)
          }}
        />
      )}
    </div>
  )
}
