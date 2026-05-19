'use client'

import { useState, useCallback, useRef } from 'react'
import { EmotionTag, HomeStage } from '@/lib/tarot-data'
import WriteStage from '@/components/home/WriteStage'
import DissolvingStage from '@/components/home/DissolvingStage'
import ResponseStage from '@/components/home/ResponseStage'

export default function HomePage() {
  const [stage, setStage] = useState<HomeStage>('write')
  const [inputText, setInputText] = useState('')
  const [selectedTag, setSelectedTag] = useState<EmotionTag | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleSubmit = useCallback((text: string, tag: EmotionTag | null) => {
    setInputText(text)
    setSelectedTag(tag)
    setStage('dissolving')
    localStorage.setItem('lastEmotion', JSON.stringify({ tag, text }))
    timerRef.current = setTimeout(() => setStage('response'), 2500)
  }, [])

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setStage('write')
    setInputText('')
    setSelectedTag(null)
  }, [])

  return (
    <div className="min-h-screen px-6 pt-12 pb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <span className="text-xs tracking-[0.2em] font-display text-white/40">FLOWRITING</span>
        {stage !== 'write' && (
          <button
            onClick={handleReset}
            className="text-white/40 hover:text-white transition-colors text-xs"
          >
            ↺ 다시 써보기
          </button>
        )}
      </div>

      {/* Stages */}
      {stage === 'write' && <WriteStage onSubmit={handleSubmit} />}
      {stage === 'dissolving' && <DissolvingStage />}
      {stage === 'response' && (
        <ResponseStage text={inputText} tag={selectedTag} onReset={handleReset} />
      )}
    </div>
  )
}
