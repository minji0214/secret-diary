# Gemini 공감 응답 Design Spec

**Goal:** 흘려쓰기 앱의 AI 응답을 `MOCK_AI_RESPONSES` 정적 텍스트에서 Gemini API 실시간 스트리밍 응답으로 교체한다.

**Architecture:** Next.js API Route(`/api/chat`)에서 Gemini SDK를 서버사이드로 호출해 스트리밍. API 키는 서버에서만 사용. 클라이언트(`ResponseStage`)는 fetch + ReadableStream으로 글자씩 렌더링.

**Tech Stack:** Next.js 16 App Router, `@google/generative-ai`, TypeScript

---

## 데이터 흐름

```
WriteStage 제출
  → home/page.tsx: dissolving stage (2.5초)
  → ResponseStage 마운트
  → POST /api/chat { text: string, tag: EmotionTag | null }
  → Gemini Flash 스트리밍 응답
  → AI 버블에 글자씩 타이핑 표시
  → 완료 후 타로 배너 페이드인
```

---

## 파일 구조

| 파일 | 역할 |
|------|------|
| `src/app/api/chat/route.ts` | POST 엔드포인트. Gemini 호출 + 스트리밍 응답 |
| `src/components/home/ResponseStage.tsx` | 스트리밍 fetch + 타이핑 UI |
| `.env.local` | `GEMINI_API_KEY` 환경변수 (커밋 안 됨) |
| `.env.local.example` | 필요한 환경변수 목록 안내 (커밋됨) |

---

## API Route: `/api/chat`

**Request:**
```ts
POST /api/chat
Content-Type: application/json
{ text: string, tag: EmotionTag | null }
```

**Response:** `text/plain` 스트리밍 (Readable stream, UTF-8 청크)

**에러:** 500 반환 시 클라이언트는 `MOCK_AI_RESPONSES` 폴백 사용

**구현 요점:**
- `@google/generative-ai` 패키지의 `GoogleGenerativeAI` 클래스 사용
- 모델: `gemini-2.0-flash`
- `generateContentStream()` 으로 스트리밍
- `TransformStream`으로 청크를 `Response`에 연결
- `GEMINI_API_KEY` 누락 시 500 에러

---

## 프롬프트

**System instruction:**
```
너는 '새벽 친구'야. 사용자가 아무에게도 말 못했던 감정을 혼자 글로 흘려보낼 때,
조용히 옆에 있어주는 존재야.

규칙:
- 2~3문장 이내로 짧게 답해줘
- 판단하거나 조언하지 마. 그냥 공감하고 함께 있어줘
- 시적이고 따뜻한 말투, 존댓말(-요 어미)
- 감정 태그가 있으면 그 감정의 결을 반영해줘
- 사용자 글의 구체적인 내용을 언급하면서 답해줘
```

**User message:**
```
감정: {tag ?? '없음'}
내용: "{text}"
```

---

## ResponseStage 변경

**상태 추가:**
```ts
const [streamedText, setStreamedText] = useState('')
const [isStreaming, setIsStreaming] = useState(true)
const [isComplete, setIsComplete] = useState(false)
```

**마운트 시 fetch:**
- `isStreaming=true` 상태에서 AI 버블에 "..." 점 애니메이션
- `response.body` ReadableStream을 TextDecoder로 청크 읽기
- 각 청크를 `streamedText`에 append
- 완료: `isStreaming=false`, `isComplete=true`
- 에러: `MOCK_AI_RESPONSES[tag ?? 'default']` 폴백, `isComplete=true`

**타로 배너:** `isComplete` 가 true일 때만 표시 (스트리밍 중 숨김)

**기존 UI 유지:** 버블 레이아웃, 색상, 타로 배너 디자인 변경 없음

---

## 환경 변수

```
# .env.local
GEMINI_API_KEY=your_key_here
```

`.env.local`은 `.gitignore`에 이미 포함되어 있어 커밋되지 않음.
`.env.local.example` 파일을 추가해 팀원에게 필요한 키를 안내.

---

## 에러 처리 정책

| 상황 | 처리 |
|------|------|
| `GEMINI_API_KEY` 누락 | API 500 → 클라이언트 폴백 |
| 네트워크 에러 | fetch catch → 클라이언트 폴백 |
| Gemini API 에러 | API 500 → 클라이언트 폴백 |
| 폴백 | `MOCK_AI_RESPONSES[tag ?? 'default']` 즉시 표시 |

사용자에게 에러 메시지 노출 없음. 폴백 텍스트가 자연스럽게 표시됨.

---

## 스코프 외 (2차)

- 멀티턴 채팅 (대화 이어가기)
- 응답 재생성 버튼
- 스트리밍 취소
