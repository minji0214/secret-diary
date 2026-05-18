'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import GlassPanel from '@/components/ui/GlassPanel'

const SLIDES = [
  {
    icon: '🌙',
    title: '흘려쓰기',
    subtitle: '혼자 삼키던 감정을\n조용히 흘려써',
    description: '새벽에 아무도 없을 때, 여기 있어.',
  },
  {
    icon: '💬',
    title: '판단 없이, 해결 강요 없이',
    subtitle: 'AI가 그냥 들어줄게',
    description: '"또 그 얘기야?" 같은 말은 없어. 같은 감정을 반복해도 괜찮아.',
  },
  {
    icon: '🃏',
    title: '감정의 흐름을 카드로 들여다봐',
    subtitle: '타로 리딩',
    description: '지금 마음으로 카드 한 장 골라봐. 맥락을 기억하는 타로야.',
  },
]

export default function OnboardingFlow() {
  const [slide, setSlide] = useState(0)
  const router = useRouter()

  function handleStart() {
    localStorage.setItem('onboarded', 'true')
    router.push('/home')
  }

  const isLast = slide === SLIDES.length - 1
  const current = SLIDES[slide]

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 relative z-10">
      <GlassPanel className="w-full max-w-sm p-8 flex flex-col items-center text-center gap-6">
        <span className="text-6xl">{current.icon}</span>
        <div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2 leading-relaxed whitespace-pre-line">
            {current.title}
          </h1>
          <p className="font-serif text-lg text-accentPink whitespace-pre-line leading-relaxed">
            {current.subtitle}
          </p>
        </div>
        <p className="text-sm text-softGray leading-relaxed">{current.description}</p>

        {/* Slide dots */}
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === slide ? 'bg-accentViolet w-6' : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {isLast ? (
          <button
            onClick={handleStart}
            className="w-full py-4 bg-accentViolet hover:opacity-90 active:scale-95 text-white font-semibold rounded-2xl transition-all"
          >
            시작하기
          </button>
        ) : (
          <button
            onClick={() => setSlide(slide + 1)}
            className="w-full py-4 bg-white/10 hover:bg-white/15 active:scale-95 text-white font-semibold rounded-2xl transition-all border border-white/10"
          >
            다음
          </button>
        )}
      </GlassPanel>
    </div>
  )
}
