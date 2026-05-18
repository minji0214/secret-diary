# 흘려쓰기 MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 새벽 감정 기록 웹앱 MVP UI를 Next.js 16 App Router 기반으로 구현한다 (UI-only, mock data).

**Architecture:** 온보딩(`/`) → 앱 레이아웃(`(app)/`) 하단 탭 → 홈(`/home`, 3단계 state), 타로(`/tarot`, 2단계 state), 히스토리(`/history`, placeholder). 모든 인터랙티브 컴포넌트는 `'use client'`. 애니메이션은 순수 CSS.

**Tech Stack:** Next.js 16.2.6, React 19, Tailwind CSS v4, TypeScript, pnpm

---

## File Map

| 파일 | 역할 |
|------|------|
| `src/app/globals.css` | 디자인 토큰, CSS 애니메이션, 유틸 클래스 |
| `src/app/layout.tsx` | 루트 레이아웃, 폰트 CDN 링크, 메타데이터 |
| `src/app/page.tsx` | 온보딩 페이지 (Client Component) |
| `src/app/(app)/layout.tsx` | 앱 레이아웃 — BottomNav 포함 |
| `src/app/(app)/home/page.tsx` | 감정 기록 데스크 페이지 |
| `src/app/(app)/tarot/page.tsx` | 타로 방 페이지 |
| `src/app/(app)/history/page.tsx` | 기록 흐름 placeholder 페이지 |
| `src/components/ui/StarsBackground.tsx` | 별 + ambient glow 배경 |
| `src/components/ui/GlassPanel.tsx` | 글래스모피즘 패널 공통 컴포넌트 |
| `src/components/ui/BottomNav.tsx` | 하단 탭 네비게이션 |
| `src/components/onboarding/OnboardingFlow.tsx` | 온보딩 슬라이드 3장 + 시작하기 |
| `src/components/home/WriteStage.tsx` | 감정 태그 선택 + 텍스트 입력 |
| `src/components/home/DissolvingStage.tsx` | 흘려보내는 중 로딩 애니메이션 |
| `src/components/home/ResponseStage.tsx` | AI 공감 응답 + 타로 유도 |
| `src/components/tarot/CardSelection.tsx` | 타로 카드 3장 선택 |
| `src/components/tarot/CardReveal.tsx` | 선택된 카드 공개 + 해석 |
| `src/lib/tarot-data.ts` | 타로 카드 데이터 + mock AI 응답 + 공통 타입 |

---

## Task 1: Design System — globals.css + Root Layout

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: globals.css 전체 교체**

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-midnight: #090B0F;
  --color-purpleDust: #1C162E;
  --color-softGray: #D4C5C7;
  --color-accentViolet: #8A72D6;
  --color-accentPink: #E8A7A1;

  /* Fonts */
  --font-sans: 'Pretendard', sans-serif;
  --font-serif: 'Noto Serif KR', serif;
  --font-display: 'Montserrat', sans-serif;
}

/* Base */
* { box-sizing: border-box; }

body {
  background-color: #030406;
  color: white;
  overflow-x: hidden;
}

/* Stars background */
.stars {
  background-image:
    radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px),
    radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px),
    radial-gradient(white, rgba(255,255,255,.1) 2px, transparent 40px);
  background-size: 550px 550px, 350px 350px, 250px 250px;
  background-position: 0 0, 40px 60px, 130px 270px;
  animation: starMovement 120s linear infinite;
}

/* Glassmorphism */
.glass-panel {
  background: rgba(18, 20, 28, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Tarot card 3D */
.perspective-1000 { perspective: 1000px; }
.transform-style-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; }

/* Keyframes */
@keyframes starMovement {
  from { background-position: 0 0, 40px 60px, 130px 270px; }
  to   { background-position: 550px 550px, 390px 410px, 380px 520px; }
}

@keyframes floatAway {
  0%   { transform: translateY(0) scale(1);    opacity: 1; filter: blur(0); }
  100% { transform: translateY(-80px) scale(0.95); opacity: 0; filter: blur(10px); }
}

.dissolving-text {
  animation: floatAway 2.2s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}
```

- [ ] **Step 2: layout.tsx 교체 — 폰트 CDN, 메타데이터, 배경색**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '흘려쓰기',
  description: '혼자 삼키던 감정을 AI에게 조용히 흘려쓰는 새벽 감정 기록 앱',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600&family=Noto+Serif+KR:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.css"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full font-sans antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 3: TypeScript 확인**

```bash
cd /Users/jeonminji/conductor/workspaces/secret-diary/rio-de-janeiro
pnpm build 2>&1 | tail -20
```

Expected: `✓ Compiled` 또는 타입 에러 없음

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: set up design system — tailwind v4 tokens, fonts, CSS animations"
```

---

## Task 2: Shared UI Components

**Files:**
- Create: `src/components/ui/StarsBackground.tsx`
- Create: `src/components/ui/GlassPanel.tsx`

- [ ] **Step 1: StarsBackground 생성**

```tsx
// src/components/ui/StarsBackground.tsx
export default function StarsBackground() {
  return (
    <>
      <div className="fixed inset-0 stars z-0 pointer-events-none" />
      <div
        className="fixed top-1/4 left-1/4 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{
          background: 'rgba(138, 114, 214, 0.25)',
          filter: 'blur(140px)',
          opacity: 0.35,
          mixBlendMode: 'screen',
        }}
      />
      <div
        className="fixed bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none z-0"
        style={{
          background: 'rgba(59, 45, 84, 0.30)',
          filter: 'blur(140px)',
          opacity: 0.35,
          mixBlendMode: 'screen',
        }}
      />
    </>
  )
}
```

- [ ] **Step 2: GlassPanel 생성**

```tsx
// src/components/ui/GlassPanel.tsx
interface GlassPanelProps {
  children: React.ReactNode
  className?: string
}

export default function GlassPanel({ children, className = '' }: GlassPanelProps) {
  return (
    <div className={`glass-panel rounded-3xl ${className}`}>
      {children}
    </div>
  )
}
```

- [ ] **Step 3: TypeScript 확인**

```bash
pnpm build 2>&1 | tail -20
```

Expected: 에러 없음

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/StarsBackground.tsx src/components/ui/GlassPanel.tsx
git commit -m "feat: add StarsBackground and GlassPanel shared components"
```

---

## Task 3: 타입 & 데이터

**Files:**
- Create: `src/lib/tarot-data.ts`

- [ ] **Step 1: tarot-data.ts 생성**

```ts
// src/lib/tarot-data.ts

export type EmotionTag = '연애 고민' | '불안한 새벽' | '혼잣말' | '서운함'

export type HomeStage = 'write' | 'dissolving' | 'response'

export type TarotStage = 'selection' | 'revealed'

export type TarotCard = {
  name: string
  cardLabel: string
  icon: string         // emoji
  iconClass: string    // tailwind color class for icon
  bgGradient: string   // tailwind gradient classes
  interpretation: string
}

export const EMOTION_TAGS: EmotionTag[] = [
  '연애 고민',
  '불안한 새벽',
  '혼잣말',
  '서운함',
]

export const TAG_PLACEHOLDERS: Record<EmotionTag, string> = {
  '연애 고민': '헤어진 지 3주째, 그 사람 카톡 프로필만 멍하니 바라보고 있어요...',
  '불안한 새벽': '미래에 대한 생각 때문에 가슴이 꽉 막힌 것처럼 답답해서 잠이 오질 않아요...',
  '혼잣말': '누구에게도 털어놓지 못할 비겁한 나의 진짜 속마음...',
  '서운함': '그 친구가 했던 무심한 말 한마디가 계속 뾰족하게 가슴에 걸려있어요...',
}

export const MOCK_AI_RESPONSES: Record<EmotionTag | 'default', string> = {
  '연애 고민':
    '기다림이 깊어질수록 머릿속으로 수많은 시나리오를 그리며 자신을 상처 주고 있었겠어요. 그 사람의 한마디보다, 그 한마디를 애타게 기다리던 당신의 예쁜 마음이 더 소중해요. 애써 끊어내려 하지 마세요. 흘러가는 감정을 온전히 비워낼 때까지 여기에 두고 가셔도 좋습니다.',
  '불안한 새벽':
    '내일에 대한 조바심이 오늘 밤을 가득 메우고 있군요. 그 무게는 당신이 더 멋진 삶을 살고 싶어서 스스로에게 지운 깊은 애정일지도 몰라요. 당장 길을 결정하지 않아도 괜찮아요. 새벽은 잠시 쉬어가는 정류장일 뿐이니까요.',
  '혼잣말':
    '누구에게도 내색하지 못해 속으로만 끙끙 앓던 서운하고 시린 속상함이 문장 밖으로 전해지네요. 자책하지 말아요. 당신이 그만큼 상대를 깊고 섬세하게 대했기 때문에 남은 미련이니까요.',
  '서운함':
    '그 말 한마디가 하루 종일 마음에 걸렸겠다. 사소한 것에 상처받는 게 아니라, 그만큼 그 관계를 소중히 여기고 있다는 뜻이에요. 이곳에서는 마음껏 서운해하셔도 됩니다.',
  default:
    '아직 마음이 많이 남아 있나 보다. 억지로 밀어내지 않고, 그냥 여기 두어도 괜찮아요. 흘려보낸 감정은 사라지는 게 아니라 부드럽게 녹아드는 거니까요.',
}

export const TAROT_CARDS: TarotCard[] = [
  {
    name: 'The Moon',
    cardLabel: 'XVIII. 달 (The Moon)',
    icon: '🌙',
    iconClass: 'text-accentPink',
    bgGradient: 'from-indigo-900/40 to-purple-900/40',
    interpretation:
      '달 카드는 깊은 불안함과 관계 속 보이지 않는 장벽을 의미해요. 혹시 눈을 감고 있어 보이지 않는 것은 아닐지, 한 걸음 뒤에서 고요한 새벽의 빛을 빌려 스스로를 들여다보세요.',
  },
  {
    name: 'The Lovers',
    cardLabel: 'VI. 연인 (The Lovers)',
    icon: '❤️',
    iconClass: 'text-red-400',
    bgGradient: 'from-purple-900/40 to-red-900/20',
    interpretation:
      '관계의 깊은 연결과 감정의 조화를 상징합니다. 현재 겪는 불안함은 서로를 너무 많이 신경 쓰고 있어서 생기는 과도기적 과정일 가능성이 커요.',
  },
  {
    name: 'The Star',
    cardLabel: 'XVII. 별 (The Star)',
    icon: '✨',
    iconClass: 'text-yellow-200',
    bgGradient: 'from-purple-900/30 to-yellow-900/20',
    interpretation:
      '새로운 희망과 치유, 그리고 갈등의 해소를 암시해요. 곧 마음의 복잡함이 걷히고 나아질 기운을 품고 있으며, 영감이 당신을 이끌어 줄 것입니다.',
  },
]
```

- [ ] **Step 2: TypeScript 확인**

```bash
pnpm build 2>&1 | tail -20
```

Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/lib/tarot-data.ts
git commit -m "feat: add tarot data, types, and mock AI responses"
```

---

## Task 4: BottomNav + (app) Layout

**Files:**
- Create: `src/components/ui/BottomNav.tsx`
- Create: `src/app/(app)/layout.tsx`

- [ ] **Step 1: BottomNav 생성**

```tsx
// src/components/ui/BottomNav.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/home', label: '흘려쓰기', icon: '✏️' },
  { href: '/tarot', label: '타로 방', icon: '🔮' },
  { href: '/history', label: '기록 흐름', icon: '🕰️' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-black/40 border-t border-white/5 py-3 px-8 flex justify-around items-center backdrop-blur-sm">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-accentViolet' : 'text-white/40 hover:text-white'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className="text-[10px] font-medium font-sans">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
```

- [ ] **Step 2: (app) 레이아웃 생성**

```tsx
// src/app/(app)/layout.tsx
import StarsBackground from '@/components/ui/StarsBackground'
import BottomNav from '@/components/ui/BottomNav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-midnight text-white">
      <StarsBackground />
      <main className="relative z-10 pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
```

- [ ] **Step 3: TypeScript 확인**

```bash
pnpm build 2>&1 | tail -20
```

Expected: 에러 없음

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/BottomNav.tsx src/app/(app)/layout.tsx
git commit -m "feat: add BottomNav and (app) route group layout"
```

---

## Task 5: 온보딩

**Files:**
- Create: `src/components/onboarding/OnboardingFlow.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: OnboardingFlow 생성**

```tsx
// src/components/onboarding/OnboardingFlow.tsx
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
```

- [ ] **Step 2: 온보딩 페이지 교체**

```tsx
// src/app/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import StarsBackground from '@/components/ui/StarsBackground'
import OnboardingFlow from '@/components/onboarding/OnboardingFlow'

export default function OnboardingPage() {
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem('onboarded') === 'true') {
      router.replace('/home')
    }
  }, [router])

  return (
    <div className="relative min-h-screen bg-midnight">
      <StarsBackground />
      <OnboardingFlow />
    </div>
  )
}
```

- [ ] **Step 3: TypeScript 확인 및 브라우저 확인**

```bash
pnpm build 2>&1 | tail -20
```

```bash
pnpm dev
```

브라우저에서 `http://localhost:3000` 확인:
- 별 배경 보임
- 슬라이드 3장 전환
- 마지막 슬라이드에서 "시작하기" 클릭 시 `/home` 이동 (404 정상, 아직 미구현)

- [ ] **Step 4: Commit**

```bash
git add src/components/onboarding/OnboardingFlow.tsx src/app/page.tsx
git commit -m "feat: add onboarding flow with 3 slides"
```

---

## Task 6: WriteStage

**Files:**
- Create: `src/components/home/WriteStage.tsx`

- [ ] **Step 1: WriteStage 생성**

```tsx
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
```

- [ ] **Step 2: TypeScript 확인**

```bash
pnpm build 2>&1 | tail -20
```

Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/components/home/WriteStage.tsx
git commit -m "feat: add WriteStage component with emotion tag selection"
```

---

## Task 7: DissolvingStage

**Files:**
- Create: `src/components/home/DissolvingStage.tsx`

- [ ] **Step 1: DissolvingStage 생성**

```tsx
// src/components/home/DissolvingStage.tsx
export default function DissolvingStage() {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 gap-6">
      <div className="w-12 h-12 rounded-full border border-accentViolet/30 border-t-accentViolet animate-spin" />
      <p className="font-serif text-lg text-accentPink animate-pulse">
        당신의 감정을 우주에 흘려보내는 중...
      </p>
      <p className="text-xs text-white/40">
        조용히 흩어진 후 따스하게 되돌아옵니다.
      </p>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
pnpm build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/home/DissolvingStage.tsx
git commit -m "feat: add DissolvingStage loading animation"
```

---

## Task 8: ResponseStage

**Files:**
- Create: `src/components/home/ResponseStage.tsx`

- [ ] **Step 1: ResponseStage 생성**

```tsx
// src/components/home/ResponseStage.tsx
'use client'

import { useRouter } from 'next/navigation'
import { EmotionTag, MOCK_AI_RESPONSES } from '@/lib/tarot-data'

interface ResponseStageProps {
  text: string
  tag: EmotionTag | null
  onReset: () => void
}

export default function ResponseStage({ text, tag, onReset }: ResponseStageProps) {
  const router = useRouter()
  const aiResponse = tag ? MOCK_AI_RESPONSES[tag] : MOCK_AI_RESPONSES['default']
  const displayText = text.trim() || '아무 말이나 흘려써도 괜찮아.'

  return (
    <div className="flex flex-col gap-5">
      <div className="max-h-[420px] overflow-y-auto pr-1 flex flex-col gap-4">
        {/* User bubble */}
        <div className="flex flex-col items-end">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white/80 max-w-[85%]">
            <p>"{displayText}"</p>
          </div>
          <span className="text-[9px] text-white/30 mt-1 mr-1">흘려보낸 감정</span>
        </div>

        {/* AI bubble */}
        <div className="flex flex-col items-start mt-2">
          <div className="flex items-center gap-1.5 mb-1.5 ml-1">
            <div className="w-5 h-5 rounded-full bg-accentViolet/20 border border-accentViolet/50 flex items-center justify-center text-[9px]">
              🌙
            </div>
            <span className="text-[10px] text-accentPink font-medium">새벽 친구</span>
          </div>
          <div className="bg-purpleDust/80 border border-accentViolet/25 rounded-2xl px-4 py-3.5 text-xs text-white/90 max-w-[90%] leading-relaxed">
            <p className="italic">"{aiResponse}"</p>
          </div>
        </div>

        {/* Tarot offer banner */}
        <div className="border border-accentViolet/30 bg-accentViolet/10 rounded-2xl p-4 flex flex-col gap-3 mt-2">
          <div className="flex items-center gap-2">
            <span className="text-accentPink text-sm">🔮</span>
            <span className="text-xs font-semibold text-accentPink">무의식의 1장 타로 리딩</span>
          </div>
          <p className="text-[11px] text-white/70 leading-relaxed">
            "지금 마음으로 카드 한 장 볼래?"
          </p>
          <button
            onClick={() => router.push('/tarot')}
            className="w-full py-2 bg-accentViolet text-[11px] font-bold rounded-xl hover:opacity-90 active:scale-95 transition-all"
          >
            네, 카드 한 장 볼래요
          </button>
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="text-xs text-white/30 hover:text-white/60 transition-colors text-center mt-2"
      >
        ↺ 다시 써보기
      </button>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
pnpm build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/home/ResponseStage.tsx
git commit -m "feat: add ResponseStage with AI response and tarot offer"
```

---

## Task 9: Home Page

**Files:**
- Create: `src/app/(app)/home/page.tsx`

- [ ] **Step 1: home/page.tsx 생성**

```tsx
// src/app/(app)/home/page.tsx
'use client'

import { useState, useCallback } from 'react'
import { EmotionTag, HomeStage } from '@/lib/tarot-data'
import WriteStage from '@/components/home/WriteStage'
import DissolvingStage from '@/components/home/DissolvingStage'
import ResponseStage from '@/components/home/ResponseStage'

export default function HomePage() {
  const [stage, setStage] = useState<HomeStage>('write')
  const [inputText, setInputText] = useState('')
  const [selectedTag, setSelectedTag] = useState<EmotionTag | null>(null)

  const handleSubmit = useCallback((text: string, tag: EmotionTag | null) => {
    setInputText(text)
    setSelectedTag(tag)
    setStage('dissolving')
    setTimeout(() => setStage('response'), 2500)
  }, [])

  const handleReset = useCallback(() => {
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
```

- [ ] **Step 2: TypeScript 확인 및 브라우저 확인**

```bash
pnpm build 2>&1 | tail -20
```

```bash
pnpm dev
```

`http://localhost:3000/home` 확인:
- 글래스 배경 + 별 보임
- 태그 선택 작동
- "감정 흘려보내기" 클릭 → 로딩 → 응답 표시
- 하단 탭 전환 가능

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/home/page.tsx
git commit -m "feat: add home page with 3-stage emotion flow"
```

---

## Task 10: CardSelection

**Files:**
- Create: `src/components/tarot/CardSelection.tsx`

- [ ] **Step 1: CardSelection 생성**

```tsx
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
            className={`w-[95px] h-[165px] group transform ${CARD_OFFSETS[i]} transition-all duration-500 hover:-translate-y-4 hover:scale-105 active:scale-95 cursor-pointer`}
          >
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#1F1836] to-[#0D0A18] border border-accentViolet/30 group-hover:border-accentViolet/70 transition-all p-3 flex flex-col justify-between items-center">
              <div className="border border-accentViolet/10 w-full h-full rounded-lg flex flex-col justify-between items-center py-4">
                <span className="text-[8px] text-accentViolet/60 animate-pulse">✦</span>
                <div className="w-6 h-6 rounded-full border-2 border-dashed border-accentViolet/30 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 bg-accentPink/60 rounded-full" />
                </div>
                <span className="text-[8px] text-accentViolet/60 animate-pulse">✦</span>
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
```

- [ ] **Step 2: TypeScript 확인**

```bash
pnpm build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/tarot/CardSelection.tsx
git commit -m "feat: add CardSelection component with 3 face-down cards"
```

---

## Task 11: CardReveal

**Files:**
- Create: `src/components/tarot/CardReveal.tsx`

- [ ] **Step 1: CardReveal 생성**

```tsx
// src/components/tarot/CardReveal.tsx
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
    const t = setTimeout(() => setFlipped(true), 100)
    return () => clearTimeout(t)
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
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">{card.icon}</span>
              </div>
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
        <p className="text-xs text-white/80 leading-relaxed italic max-h-[140px] overflow-y-auto">
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
```

- [ ] **Step 2: TypeScript 확인**

```bash
pnpm build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/tarot/CardReveal.tsx
git commit -m "feat: add CardReveal component with 3D flip animation"
```

---

## Task 12: Tarot Page

**Files:**
- Create: `src/app/(app)/tarot/page.tsx`

- [ ] **Step 1: tarot/page.tsx 생성**

```tsx
// src/app/(app)/tarot/page.tsx
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <span className="text-xs tracking-[0.2em] font-display text-accentPink/60">
          TAROT READINGS
        </span>
        {stage === 'revealed' && (
          <button
            onClick={handleReset}
            className="text-white/40 hover:text-white transition-colors text-xs"
          >
            ↺ 셔플하기
          </button>
        )}
      </div>

      {/* Stages */}
      {stage === 'selection' && <CardSelection onSelect={handleSelect} />}
      {stage === 'revealed' && selectedCard && (
        <CardReveal card={selectedCard} onReset={handleReset} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript 확인 및 브라우저 확인**

```bash
pnpm build 2>&1 | tail -20
```

```bash
pnpm dev
```

`http://localhost:3000/tarot` 확인:
- 카드 3장 보임, hover 애니메이션 동작
- 카드 클릭 → 3D flip → 해석 텍스트
- "다른 카드 뽑기" 리셋, "내 감정 마저 쓰기" → /home 이동

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/tarot/page.tsx
git commit -m "feat: add tarot page with card selection and reveal flow"
```

---

## Task 13: History Page (Placeholder)

**Files:**
- Create: `src/app/(app)/history/page.tsx`

- [ ] **Step 1: history/page.tsx 생성**

```tsx
// src/app/(app)/history/page.tsx
import GlassPanel from '@/components/ui/GlassPanel'

export default function HistoryPage() {
  return (
    <div className="min-h-screen px-6 pt-12 flex flex-col items-center justify-center">
      <GlassPanel className="p-8 text-center flex flex-col items-center gap-4 w-full max-w-sm">
        <span className="text-4xl">🕰️</span>
        <h2 className="font-serif text-2xl text-white/90">기록 흐름</h2>
        <p className="text-sm text-softGray/60 leading-relaxed">
          지금까지 흘려보낸 감정들을<br />
          곧 여기서 만날 수 있어요.
        </p>
        <span className="text-xs text-accentViolet bg-accentViolet/10 border border-accentViolet/30 px-3 py-1 rounded-full">
          Coming Soon
        </span>
      </GlassPanel>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript 확인 및 최종 브라우저 확인**

```bash
pnpm build 2>&1 | tail -20
```

```bash
pnpm dev
```

전체 플로우 확인:
1. `http://localhost:3000` → 온보딩 3슬라이드 → 시작하기 → `/home`
2. `/home` 태그 선택 → 감정 입력 → 흘려보내기 → 로딩 → AI 응답 → 타로 유도
3. `/tarot` 카드 선택 → flip → 해석 → 내 감정 마저 쓰기 → `/home`
4. `/history` 플레이스홀더 표시
5. 하단 탭 자유 이동

- [ ] **Step 3: Commit**

```bash
git add src/app/(app)/history/page.tsx
git commit -m "feat: add history page placeholder"
```

---

## Self-Review

**Spec coverage:**
- [x] 온보딩 3슬라이드 → Task 5
- [x] 감정 기록 데스크 3단계 — Task 6, 7, 8, 9
- [x] 타로 방 2단계 — Task 10, 11, 12
- [x] 기록 흐름 placeholder — Task 13
- [x] 하단 탭 네비게이션 — Task 4
- [x] 디자인 토큰 (컬러, 폰트, 애니메이션) — Task 1
- [x] localStorage 온보딩 완료 처리 — Task 5
- [x] 별 배경 + ambient glow — Task 2

**Type consistency:**
- `EmotionTag`, `HomeStage`, `TarotStage`, `TarotCard` — Task 3에서 정의, Task 6~12에서 동일하게 사용
- `WriteStage.onSubmit(text: string, tag: EmotionTag | null)` — Task 6 정의, Task 9 소비 ✓
- `ResponseStage({ text, tag, onReset })` — Task 8 정의, Task 9 소비 ✓
- `CardSelection.onSelect(card: TarotCard)` — Task 10 정의, Task 12 소비 ✓
- `CardReveal({ card, onReset })` — Task 11 정의, Task 12 소비 ✓
