# 흘려쓰기 MVP — Design Spec

## Overview

새벽 감정 기록 웹앱. 사용자가 감정을 자유롭게 입력하면 AI가 공감 중심으로 응답하고, 타로 리딩으로 연결되는 감정 순환 공간.

**범위:** UI-only (Phase 1). 백엔드/AI 연동은 Phase 2.  
**스택:** Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript  
**레퍼런스:** 데모 HTML 프로토타입 (`.context/attachments/pasted_text_2026-05-18_23-35-49.txt`)

---

## Route Structure

```
/                        # 온보딩
/(app)/home              # 감정 기록 데스크 (메인)
/(app)/tarot             # 타로 방
/(app)/history           # 기록 흐름 (placeholder)
```

`(app)` route group은 하단 탭 네비게이션 레이아웃을 공유.

---

## File Structure

```
src/app/
├── page.tsx                        # 온보딩
├── (app)/
│   ├── layout.tsx                  # 하단 탭 네비게이션
│   ├── home/page.tsx               # 감정 기록 데스크
│   ├── tarot/page.tsx              # 타로 방
│   └── history/page.tsx            # 기록 흐름

src/components/
├── onboarding/
│   └── OnboardingFlow.tsx          # 슬라이드 3장 + 시작하기
├── home/
│   ├── WriteStage.tsx              # 태그 선택 + 텍스트 입력
│   ├── DissolvingStage.tsx         # 로딩 애니메이션
│   └── ResponseStage.tsx           # AI 응답 + 타로 유도
├── tarot/
│   ├── CardSelection.tsx           # 카드 3장 선택
│   └── CardReveal.tsx              # 카드 공개 + 해석
└── ui/
    ├── BottomNav.tsx               # 하단 탭 (흘려쓰기/타로방/기록흐름)
    ├── GlassPanel.tsx              # 글래스모피즘 공통 패널
    └── StarsBackground.tsx         # 별/ambient glow 배경

src/lib/
└── tarot-data.ts                   # 타로 카드 데이터 (이름, 해석 텍스트, 아이콘)
```

---

## Design System

### Colors (Tailwind v4 custom tokens)

| Token         | Hex       | 용도                     |
|---------------|-----------|--------------------------|
| `midnight`    | `#090B0F` | 전체 배경                 |
| `purpleDust`  | `#1C162E` | 카드/패널 배경             |
| `softGray`    | `#D4C5C7` | 본문 텍스트               |
| `accentViolet`| `#8A72D6` | 주 액션, 선택 강조         |
| `accentPink`  | `#E8A7A1` | AI 응답, 타로, 보조 강조   |

### Typography

- **Noto Serif KR** — 감성 제목, 주요 문구 (`font-serif`)
- **Pretendard** — 본문, UI 텍스트 (`font-sans`)
- **Montserrat** — 상단 레이블, 배지 (`font-display`)

### Common Patterns

- `GlassPanel`: `background: rgba(18,20,28,0.65)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255,255,255,0.06)`
- 버튼: `rounded-2xl`, hover `scale-95` active, `accentViolet` 배경
- 배경: moving stars (CSS keyframe) + ambient glow (blur 140px circles)

---

## Screen Designs

### 1. 온보딩 (`/`)

슬라이드 3장 + 시작하기 버튼. 별 배경 위에 글래스 카드 형태.

| 슬라이드 | 내용 |
|---------|------|
| 1 | 앱 로고 + `"혼자 삼키던 감정을 조용히 흘려써"` |
| 2 | 공감 AI 소개 — `"판단 없이, 해결 강요 없이"` |
| 3 | 타로 소개 — `"감정의 흐름을 카드로 들여다봐"` + 시작하기 버튼 |

시작하기 → `/home` 으로 이동.

### 2. 감정 기록 데스크 (`/home`)

`stage: 'write' | 'dissolving' | 'response'` useState로 관리.

**write stage**
- 제목: `"오늘은 어떤 마음이야?"`
- 감정 태그 4개: `#연애 고민`, `#불안한 새벽`, `#혼잣말`, `#서운함`
  - 태그 선택 시 textarea placeholder 교체
- textarea: `"아무 말이나 흘려써도 괜찮아."` placeholder
- CTA: `"감정 흘려보내기"` 버튼 → dissolving stage 진입

**dissolving stage**
- 스피너 + `"당신의 감정을 우주에 흘려보내는 중..."` 문구
- 2500ms 후 response stage 진입 (setTimeout)

**response stage**
- 사용자 입력 반영 버블 (오른쪽)
- AI 공감 응답 버블 (왼쪽, 달 아이콘 + `"새벽 친구"` 레이블)
  - 태그에 따라 다른 mock 응답 텍스트
- 타로 유도 배너: `"지금 마음으로 카드 한 장 볼래?"` → `/tarot` 이동

### 3. 타로 방 (`/tarot`)

`stage: 'selection' | 'revealed'` useState로 관리.

**selection stage**
- 제목: `"무의식의 선택"`
- 카드 3장 (face-down): hover 시 위로 올라오는 효과
- 카드 클릭 → revealed stage

**revealed stage**
- 선택 카드 3D flip 애니메이션 (`rotateY(180deg)`)
- 카드 이름 배지 + 해석 텍스트
- 버튼 2개: `"내 감정 마저 쓰기"` (→ /home), `"다른 카드 뽑기"` (reset)

**타로 카드 데이터** (3장, MVP)

| 카드 | 아이콘 | 해석 요약 |
|------|--------|---------|
| The Moon | 달 | 깊은 불안, 어둠 속 빛 |
| The Lovers | 하트 | 관계의 연결과 조화 |
| The Star | 별 | 희망, 치유, 새로운 시작 |

### 4. 기록 흐름 (`/history`)

MVP placeholder. `"곧 만나요"` 텍스트만 표시.

---

## State Management

- 모든 상태는 각 페이지 컴포넌트의 `useState` 로컬 관리
- 전역 상태 불필요 (Phase 1 UI-only 범위)
- 온보딩 완료 여부: `localStorage` (`onboarded: true`) — 재방문 시 `/home` 으로 직행

---

## Animations

순수 CSS (framer-motion 의존성 없음):

| 애니메이션 | 구현 |
|-----------|------|
| Stars 배경 | `@keyframes starMovement` in globals.css |
| Dissolving text | `@keyframes floatAway` in globals.css |
| 카드 flip | CSS `transform: rotateY(180deg)` transition |
| 카드 hover | Tailwind `hover:-translate-y-4 hover:scale-105` |
| 화면 전환 | Tailwind `transition-opacity duration-500` |

---

## Out of Scope (Phase 1)

- Supabase 연동 (Auth, DB)
- OpenAI API 실제 호출
- 잠금 모드 (Face ID / PIN)
- 감정 히스토리 실제 데이터
- 푸시 알림

## Future Phases

- **Phase 2:** Supabase + OpenAI 연동, 실제 감정 저장
- **Phase 3:** 사주 탭 추가 (하단 탭 확장), 잠금 모드, 유료 구독
