// src/components/home/WriteStage.tsx
'use client'

import { useState } from 'react'
import { EmotionTag, EMOTION_TAGS, TAG_PLACEHOLDERS } from '@/lib/tarot-data'

interface WriteStageProps {
  onSubmit: (text: string, tag: EmotionTag | null) => void
}

export default function WriteStage({ onSubmit }: WriteStageProps) {
  const [tag, setTag] = useState<EmotionTag | null>(null)
  const [text, setText] = useState('')

  const placeholder = tag ? TAG_PLACEHOLDERS[tag] : '아무 말이나 흘려써도 괜찮아.'

  function handleSubmit() {
    onSubmit(text, tag)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl text-white/95 leading-relaxed mb-1">
          오늘은 어떤 마음이야?
        </h2>
        <p className="text-xs text-white/40">
          아무에게도 털어놓지 못했던 감정을 있는 그대로 적어보세요.
        </p>
      </div>

      {/* Emotion tags */}
      <div className="flex flex-wrap gap-2">
        {EMOTION_TAGS.map((t) => (
          <button
            key={t}
            onClick={() => setTag(tag === t ? null : t)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
              tag === t
                ? 'bg-accentViolet/30 border-accentViolet text-white'
                : 'bg-white/5 border-white/10 text-white/60 hover:border-accentViolet/40 hover:text-white'
            }`}
          >
            #{t}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative bg-white/[0.03] border border-white/5 rounded-2xl p-4 min-h-[160px] focus-within:border-accentViolet/40 focus-within:bg-white/[0.05] transition-all">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-white/90 placeholder-white/20 resize-none outline-none min-h-[120px]"
        />
        <div className="absolute bottom-3 right-4 text-[10px] text-white/30">
          {text.length}자
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleSubmit}
        className="w-full py-4 bg-accentViolet hover:opacity-90 active:scale-95 text-white text-sm font-semibold rounded-2xl transition-all flex items-center justify-center gap-2"
      >
        <span>감정 흘려보내기</span>
        <span>✈️</span>
      </button>
    </div>
  )
}
