# Gemini 공감 응답 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `MOCK_AI_RESPONSES` 정적 텍스트를 Gemini API 실시간 스트리밍으로 교체해 감정 텍스트에 맞는 공감 응답을 생성한다.

**Architecture:** Next.js API Route `/api/chat`에서 `@google/generative-ai` SDK로 Gemini Flash 스트리밍 호출. 클라이언트 `ResponseStage`는 `fetch` + `ReadableStream`으로 글자씩 렌더링. API 키는 서버에서만 사용. 에러 시 기존 MOCK 텍스트로 폴백.

**Tech Stack:** Next.js 16 App Router, `@google/generative-ai`, TypeScript, pnpm

---

## File Map

| 파일 | 역할 |
|------|------|
| `src/app/api/chat/route.ts` | NEW: POST 엔드포인트, Gemini 스트리밍 호출 |
| `src/components/home/ResponseStage.tsx` | MODIFY: 스트리밍 fetch + 타이핑 UI |
| `.env.local` | MODIFY: `GEMINI_API_KEY` 추가 (커밋 안 됨) |
| `.env.local.example` | NEW: 환경변수 목록 안내 (커밋됨) |

---

## Task 1: 패키지 설치 + 환경 변수 설정

**Files:**
- Modify: `package.json` (pnpm add)
- Create: `.env.local.example`
- Modify: `.env.local`

- [ ] **Step 1: @google/generative-ai 패키지 설치**

```bash
cd /Users/jeonminji/conductor/workspaces/secret-diary/rio-de-janeiro
pnpm add @google/generative-ai
```

Expected output:
```
Packages: +1
Progress: resolved N, reused N, downloaded 1, added 1, done
```

- [ ] **Step 2: .env.local.example 생성**

```bash
cat > .env.local.example << 'EOF'
# Gemini API key — https://aistudio.google.com/app/apikey
GEMINI_API_KEY=
EOF
```

- [ ] **Step 3: .env.local에 키 추가**

`.env.local` 파일에 아래 줄을 추가한다. (실제 API 키는 https://aistudio.google.com/app/apikey 에서 발급)

```bash
echo "GEMINI_API_KEY=여기에_실제_키_입력" >> .env.local
```

- [ ] **Step 4: 빌드 확인 (패키지 타입 체크)**

```bash
pnpm build 2>&1 | grep -E "error|✓ Compiled"
```

Expected: `✓ Compiled successfully`

- [ ] **Step 5: Commit**

```bash
git add .env.local.example pnpm-lock.yaml package.json
git commit -m "feat: install @google/generative-ai, add env example"
```

---

## Task 2: /api/chat 라우트 생성

**Files:**
- Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: route.ts 생성**

```ts
// src/app/api/chat/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const SYSTEM_PROMPT = `너는 '새벽 친구'야. 사용자가 아무에게도 말 못했던 감정을 혼자 글로 흘려보낼 때, 조용히 옆에 있어주는 존재야.

규칙:
- 2~3문장 이내로 짧게 답해줘
- 판단하거나 조언하지 마. 그냥 공감하고 함께 있어줘
- 시적이고 따뜻한 말투, 존댓말(-요 어미)
- 감정 태그가 있으면 그 감정의 결을 반영해줘
- 사용자 글의 구체적인 내용을 언급하면서 답해줘`

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return new Response('GEMINI_API_KEY not configured', { status: 500 })
  }

  let text: string
  let tag: string | null

  try {
    const body = await request.json() as { text: string; tag: string | null }
    text = body.text
    tag = body.tag
  } catch {
    return new Response('Invalid request body', { status: 400 })
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    const result = await model.generateContentStream(
      `감정: ${tag ?? '없음'}\n내용: "${text}"`
    )

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text()
            if (chunkText) {
              controller.enqueue(new TextEncoder().encode(chunkText))
            }
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch {
    return new Response('Gemini API error', { status: 500 })
  }
}
```

- [ ] **Step 2: 빌드 체크**

```bash
pnpm build 2>&1 | grep -E "error TS|api/chat|✓ Compiled"
```

Expected: `✓ Compiled successfully` (에러 없음)

- [ ] **Step 3: dev 서버에서 curl로 동작 확인**

터미널 1에서:
```bash
pnpm dev
```

터미널 2에서 (GEMINI_API_KEY가 .env.local에 있어야 함):
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text":"오늘 너무 외로웠어","tag":"혼잣말"}' \
  --no-buffer
```

Expected: 한국어 공감 텍스트가 스트리밍으로 출력됨 (글자씩 나타남)

API 키 없이 테스트하면:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"text":"test","tag":null}'
```
Expected: `GEMINI_API_KEY not configured` (500)

- [ ] **Step 4: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: add /api/chat route with Gemini streaming"
```

---

## Task 3: ResponseStage 스트리밍 UI

**Files:**
- Modify: `src/components/home/ResponseStage.tsx`

현재 파일은 `MOCK_AI_RESPONSES`에서 정적 텍스트를 꺼내 즉시 표시한다. 이것을 `/api/chat` 스트리밍 fetch로 교체한다. 기존 버블 레이아웃·색상·타로 배너 디자인은 그대로 유지.

- [ ] **Step 1: ResponseStage.tsx 전체 교체**

```tsx
// src/components/home/ResponseStage.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EmotionTag, MOCK_AI_RESPONSES } from '@/lib/tarot-data'

interface ResponseStageProps {
  text: string
  tag: EmotionTag | null
  onReset: () => void
}

export default function ResponseStage({ text, tag, onReset }: ResponseStageProps) {
  const router = useRouter()
  const [streamedText, setStreamedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const displayText = text.trim() || '아무 말이나 흘려써도 괜찮아.'

  useEffect(() => {
    let cancelled = false

    async function fetchResponse() {
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, tag }),
        })

        if (!res.ok || !res.body) throw new Error('API error')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done || cancelled) break
          const chunk = decoder.decode(value, { stream: true })
          setStreamedText(prev => prev + chunk)
        }
      } catch {
        if (!cancelled) {
          setStreamedText(tag ? MOCK_AI_RESPONSES[tag] : MOCK_AI_RESPONSES['default'])
        }
      } finally {
        if (!cancelled) {
          setIsStreaming(false)
          setIsComplete(true)
        }
      }
    }

    fetchResponse()
    return () => { cancelled = true }
  }, [text, tag])

  return (
    <div className="flex flex-col gap-5">
      {/* Scrollable chat area */}
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
          <div className="bg-purpleDust/80 border border-accentViolet/25 rounded-2xl px-4 py-3.5 text-xs text-white/90 max-w-[90%] leading-relaxed min-h-[48px]">
            {isStreaming && !streamedText ? (
              <span className="animate-pulse text-white/50">···</span>
            ) : (
              <p className="italic">"{streamedText}"</p>
            )}
          </div>
        </div>
      </div>

      {/* Tarot offer banner — visible only after streaming completes */}
      {isComplete && (
        <div className="border border-accentViolet/30 bg-accentViolet/10 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-accentPink text-sm" aria-hidden="true">🔮</span>
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
      )}

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

- [ ] **Step 2: 빌드 체크**

```bash
pnpm build 2>&1 | grep -E "error TS|ResponseStage|✓ Compiled"
```

Expected: `✓ Compiled successfully`

- [ ] **Step 3: 브라우저 확인**

```bash
pnpm dev
```

`http://localhost:3000/home` 에서:
1. 감정 텍스트 입력 + 태그 선택 → 제출
2. dissolving 애니메이션 (2.5초)
3. ResponseStage 등장 → AI 버블에 `···` 점 애니메이션
4. 글자씩 타이핑되며 공감 응답 나타남
5. 완료 후 타로 배너 표시
6. 타로 배너 버튼 → `/tarot` 이동 확인

**폴백 테스트:** `.env.local`에서 `GEMINI_API_KEY` 값을 잘못된 것으로 임시 변경 후 dev 서버 재시작:
- 응답이 에러나도 `MOCK_AI_RESPONSES` 텍스트가 자연스럽게 표시되는지 확인
- 테스트 후 올바른 키로 복원

- [ ] **Step 4: Commit**

```bash
git add src/components/home/ResponseStage.tsx
git commit -m "feat: replace mock responses with Gemini streaming in ResponseStage"
```

---

## Self-Review

**Spec coverage:**
- [x] `/api/chat` POST 엔드포인트 — Task 2
- [x] `@google/generative-ai` 패키지 + `gemini-2.0-flash` 모델 — Task 1, 2
- [x] 시스템 프롬프트 (새벽 친구, 2~3문장, 공감) — Task 2
- [x] `감정: {tag}\n내용: "{text}"` 유저 메시지 포맷 — Task 2
- [x] `GEMINI_API_KEY` 누락 시 500 — Task 2
- [x] 스트리밍 UI: `···` 로딩 → 글자씩 타이핑 — Task 3
- [x] `isComplete` 시 타로 배너 표시 — Task 3
- [x] 에러 시 `MOCK_AI_RESPONSES` 폴백 — Task 3
- [x] `.env.local.example` 생성 — Task 1
- [x] API 키 서버에서만 사용 (클라이언트 노출 없음) — Task 2 (서버 라우트)

**Type consistency:**
- `{ text: string; tag: string | null }` — Task 2 request body, Task 3 `JSON.stringify({ text, tag })` ✓
- `MOCK_AI_RESPONSES[tag ?? 'default']` — `tag`가 `EmotionTag | null`이고 `MOCK_AI_RESPONSES`는 `Record<EmotionTag | 'default', string>` ✓
- `setStreamedText(prev => prev + chunk)` — `prev: string`, `chunk: string` ✓
