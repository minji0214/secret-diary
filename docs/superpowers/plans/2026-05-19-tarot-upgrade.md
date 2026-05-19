# 타로 고도화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 타로 방을 22장 메이저 아르카나 + 부채꼴 fan spread + 감정 연동 해석으로 전문 타로 앱 수준으로 업그레이드한다.

**Architecture:** 라이더-웨이트 퍼블릭 도메인 이미지 22장을 `/public/cards/`에 로컬 저장하고, `tarot-data.ts`를 완전히 교체해 새 타입과 데이터를 정의한다. 타로 페이지 stage를 `intention → selection → revealed`로 재설계하며, fan spread는 22장 중 7장을 Fisher-Yates 셔플로 추출해 CSS transform으로 부채꼴 배치한다.

**Tech Stack:** Next.js 16.2.6, React 19, Tailwind CSS v4, TypeScript, pnpm

---

## File Map

| 파일 | 역할 |
|------|------|
| `scripts/download-tarot-cards.sh` | Wikimedia Commons에서 22장 다운로드 |
| `public/cards/00-fool.jpg` ~ `21-world.jpg` | 라이더-웨이트 로컬 이미지 |
| `src/lib/tarot-data.ts` | 타입 교체 + 22장 데이터 + EMOTION_BRIDGE |
| `src/app/(app)/home/page.tsx` | 제출 시 `lastEmotion` localStorage 저장 추가 |
| `src/components/tarot/TarotIntention.tsx` | NEW: intention 화면 |
| `src/components/tarot/TarotFanSelection.tsx` | NEW: 7장 부채꼴 fan spread 선택 |
| `src/components/tarot/CardReveal.tsx` | 교체: 실제 아트워크 + emotionBridge + keywords |
| `src/app/(app)/tarot/page.tsx` | 교체: 새 stage 관리 + emotion 컨텍스트 |

---

## Task 1: 이미지 다운로드 스크립트

**Files:**
- Create: `scripts/download-tarot-cards.sh`

- [ ] **Step 1: 스크립트 생성**

```bash
# scripts/download-tarot-cards.sh
cat > scripts/download-tarot-cards.sh << 'EOF'
#!/bin/bash
set -e
cd "$(dirname "$0")/.."
mkdir -p public/cards

BASE="https://upload.wikimedia.org/wikipedia/commons"

download() {
  local dest="public/cards/$1"
  local url="$BASE/$2"
  if [ ! -f "$dest" ]; then
    echo "Downloading $1..."
    curl -sL --retry 3 "$url" -o "$dest"
    # Verify it's actually an image (not a 404 HTML page)
    if ! file "$dest" | grep -q "JPEG\|image"; then
      echo "WARNING: $1 may not be a valid image. Check manually."
    fi
  else
    echo "Skipping $1 (already exists)"
  fi
}

download "00-fool.jpg"             "9/90/RWS_Tarot_00_Fool.jpg"
download "01-magician.jpg"         "1/10/RWS_Tarot_01_Magician.jpg"
download "02-high-priestess.jpg"   "8/88/RWS_Tarot_02_High_Priestess.jpg"
download "03-empress.jpg"          "d/d2/RWS_Tarot_03_Empress.jpg"
download "04-emperor.jpg"          "c/c3/RWS_Tarot_04_Emperor.jpg"
download "05-hierophant.jpg"       "8/8d/RWS_Tarot_05_Hierophant.jpg"
download "06-lovers.jpg"           "3/3a/RWS_Tarot_06_Lovers.jpg"
download "07-chariot.jpg"          "9/9b/RWS_Tarot_07_Chariot.jpg"
download "08-strength.jpg"         "f/f5/RWS_Tarot_08_Strength.jpg"
download "09-hermit.jpg"           "4/4d/RWS_Tarot_09_Hermit.jpg"
download "10-wheel-of-fortune.jpg" "3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg"
download "11-justice.jpg"          "e/e0/RWS_Tarot_11_Justice.jpg"
download "12-hanged-man.jpg"       "2/2b/RWS_Tarot_12_Hanged_Man.jpg"
download "13-death.jpg"            "d/d7/RWS_Tarot_13_Death.jpg"
download "14-temperance.jpg"       "f/f8/RWS_Tarot_14_Temperance.jpg"
download "15-devil.jpg"            "5/55/RWS_Tarot_15_Devil.jpg"
download "16-tower.jpg"            "5/53/RWS_Tarot_16_Tower.jpg"
download "17-star.jpg"             "d/db/RWS_Tarot_17_Star.jpg"
download "18-moon.jpg"             "7/7f/RWS_Tarot_18_Moon.jpg"
download "19-sun.jpg"              "1/17/RWS_Tarot_19_Sun.jpg"
download "20-judgement.jpg"        "d/dd/RWS_Tarot_20_Judgement.jpg"
download "21-world.jpg"            "f/ff/RWS_Tarot_21_World.jpg"

count=$(ls public/cards/*.jpg 2>/dev/null | wc -l)
echo "Done. $count/22 cards in public/cards/"
EOF
chmod +x scripts/download-tarot-cards.sh
```

- [ ] **Step 2: 스크립트 실행**

```bash
cd /Users/jeonminji/conductor/workspaces/secret-diary/rio-de-janeiro
bash scripts/download-tarot-cards.sh
```

Expected output:
```
Downloading 00-fool.jpg...
...
Done. 22/22 cards in public/cards/
```

If any file shows "WARNING: may not be a valid image", open that URL in a browser to find the correct Wikimedia Commons path, re-download manually with `curl -sL <url> -o public/cards/<filename>.jpg`.

- [ ] **Step 3: 이미지 확인**

```bash
ls -la public/cards/*.jpg | wc -l
```

Expected: `22`

```bash
file public/cards/18-moon.jpg
```

Expected: `public/cards/18-moon.jpg: JPEG image data, ...`

- [ ] **Step 4: Commit**

```bash
git add scripts/download-tarot-cards.sh public/cards/
git commit -m "feat: add tarot card download script and 22 rider-waite images"
```

---

## Task 2: tarot-data.ts 교체

**Files:**
- Modify: `src/lib/tarot-data.ts`

기존 `TarotCard` 타입(icon, cardLabel, bgGradient 등)을 완전히 교체한다. 기존 타입을 사용하는 `CardReveal.tsx`, `CardSelection.tsx`는 후속 태스크에서 함께 교체된다.

- [ ] **Step 1: tarot-data.ts 전체 교체**

```ts
// src/lib/tarot-data.ts

export type EmotionTag = '연애 고민' | '불안한 새벽' | '혼잣말' | '서운함'

export type HomeStage = 'write' | 'dissolving' | 'response'

export type TarotStage = 'intention' | 'selection' | 'revealed'

export type TarotCard = {
  id: string
  arcana: number
  romanNumeral: string
  name: string
  nameKr: string
  image: string
  keywords: string[]
  interpretation: string
}

export type LastEmotion = {
  tag: EmotionTag | null
  text: string
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

export const EMOTION_BRIDGE: Record<EmotionTag | 'default', string> = {
  '연애 고민': '지금 뽑은 카드는 그 관계 속 당신의 무의식이 반응한 것이에요.',
  '불안한 새벽': '새벽의 불안함이 이 카드를 불러왔을지도 몰라요.',
  '혼잣말': '아무에게도 못한 말이 이 카드를 선택하게 했어요.',
  '서운함': '서운함이 쌓인 지금, 이 카드가 당신에게 말을 걸어요.',
  default: '지금 이 순간 당신의 무의식이 반응한 카드예요.',
}

export const TAROT_CARDS: TarotCard[] = [
  {
    id: 'fool', arcana: 0, romanNumeral: '0',
    name: 'The Fool', nameKr: '바보',
    image: '/cards/00-fool.jpg',
    keywords: ['새로운 시작', '순수함', '자유', '용기'],
    interpretation: '아무것도 모르는 채로 뛰어드는 그 첫 걸음이 사실 가장 용감한 선택이에요. 계획이 없어도 괜찮아요. 당신이 지금 서 있는 이 경계 위에서, 세상이 당신을 기다리고 있어요. 두려움보다 설렘을 먼저 느껴도 좋아요.',
  },
  {
    id: 'magician', arcana: 1, romanNumeral: 'I',
    name: 'The Magician', nameKr: '마법사',
    image: '/cards/01-magician.jpg',
    keywords: ['의지', '창조', '집중', '능력'],
    interpretation: '이미 당신 안에 필요한 것들이 다 갖춰져 있어요. 지금 손에 쥔 것들을 믿어보세요. 의지만 있다면 무엇이든 시작할 수 있는 순간이에요. 의심보다 행동이 먼저예요.',
  },
  {
    id: 'high-priestess', arcana: 2, romanNumeral: 'II',
    name: 'The High Priestess', nameKr: '여사제',
    image: '/cards/02-high-priestess.jpg',
    keywords: ['직관', '내면의 지혜', '침묵', '비밀'],
    interpretation: '소란 속에서도 조용히 알고 있는 것이 있어요. 지금 이성보다 감각이 더 많은 것을 말해주고 있을지 몰라요. 잠시 멈추고 내면의 목소리에 귀 기울여봐요.',
  },
  {
    id: 'empress', arcana: 3, romanNumeral: 'III',
    name: 'The Empress', nameKr: '황후',
    image: '/cards/03-empress.jpg',
    keywords: ['풍요', '돌봄', '창조성', '안정'],
    interpretation: '오래 참고 가꿔온 것들이 이제 꽃피기 시작해요. 지금 이 시간은 풍요롭게 자기 자신을 사랑해도 되는 시간이에요. 충분히 쉬고 충분히 받아도 괜찮아요.',
  },
  {
    id: 'emperor', arcana: 4, romanNumeral: 'IV',
    name: 'The Emperor', nameKr: '황제',
    image: '/cards/04-emperor.jpg',
    keywords: ['구조', '안정', '권위', '보호'],
    interpretation: '흔들리는 것들 속에서도 기준을 세워야 할 때예요. 당신이 스스로의 질서를 만들 수 있어요. 단단해지는 것이 차갑게 굳는 것은 아니에요.',
  },
  {
    id: 'hierophant', arcana: 5, romanNumeral: 'V',
    name: 'The Hierophant', nameKr: '교황',
    image: '/cards/05-hierophant.jpg',
    keywords: ['전통', '가르침', '신뢰', '소속감'],
    interpretation: '혼자 답을 찾으려 애쓰지 않아도 돼요. 때로는 오래된 지혜나 믿을 수 있는 사람에게 기대는 것도 용기예요. 연결 속에서 답을 찾을 수 있어요.',
  },
  {
    id: 'lovers', arcana: 6, romanNumeral: 'VI',
    name: 'The Lovers', nameKr: '연인',
    image: '/cards/06-lovers.jpg',
    keywords: ['선택', '관계', '연결', '조화'],
    interpretation: '지금 마음속 갈림길에 서 있나요. 머리가 아닌 가슴으로 선택해야 하는 순간이에요. 어떤 선택이든 당신이 온전히 책임질 수 있는 것을 골라요.',
  },
  {
    id: 'chariot', arcana: 7, romanNumeral: 'VII',
    name: 'The Chariot', nameKr: '전차',
    image: '/cards/07-chariot.jpg',
    keywords: ['의지력', '전진', '승리', '통제'],
    interpretation: '지금은 멈추지 말고 앞으로 나아가야 할 때예요. 상반된 감정을 모두 안고도 방향을 잃지 않을 수 있어요. 당신의 의지가 충분히 강해요.',
  },
  {
    id: 'strength', arcana: 8, romanNumeral: 'VIII',
    name: 'Strength', nameKr: '힘',
    image: '/cards/08-strength.jpg',
    keywords: ['용기', '인내', '내면의 힘', '부드러운 강인함'],
    interpretation: '억누르는 것이 아니라 감싸안는 것이 진짜 힘이에요. 지금 느끼는 두려움과 불안도 당신의 일부예요. 그것과 싸우지 말고 함께 걸어가요.',
  },
  {
    id: 'hermit', arcana: 9, romanNumeral: 'IX',
    name: 'The Hermit', nameKr: '은둔자',
    image: '/cards/09-hermit.jpg',
    keywords: ['고독', '성찰', '내면 탐색', '지혜'],
    interpretation: '지금은 혼자 있는 시간이 필요해요. 세상의 소음에서 멀어져 자신의 목소리를 다시 들을 때예요. 고독은 외로움이 아니라 스스로를 발견하는 공간이에요.',
  },
  {
    id: 'wheel-of-fortune', arcana: 10, romanNumeral: 'X',
    name: 'Wheel of Fortune', nameKr: '운명의 수레바퀴',
    image: '/cards/10-wheel-of-fortune.jpg',
    keywords: ['변화', '순환', '운명', '전환점'],
    interpretation: '모든 것은 순환해요. 지금 이 어려운 시간도 영원하지 않아요. 수레바퀴는 계속 돌고, 당신은 이미 오르막 위에 있을지도 몰라요.',
  },
  {
    id: 'justice', arcana: 11, romanNumeral: 'XI',
    name: 'Justice', nameKr: '정의',
    image: '/cards/11-justice.jpg',
    keywords: ['균형', '진실', '책임', '공정함'],
    interpretation: '지금 상황에 있어 진실이 무엇인지 냉정하게 바라볼 용기가 필요해요. 감정을 잠시 내려두고 보면 이미 답을 알고 있을 거예요.',
  },
  {
    id: 'hanged-man', arcana: 12, romanNumeral: 'XII',
    name: 'The Hanged Man', nameKr: '매달린 사람',
    image: '/cards/12-hanged-man.jpg',
    keywords: ['정지', '관점 전환', '기다림', '수용'],
    interpretation: '지금 당장 무언가를 해야 한다는 강박에서 잠시 내려놓아요. 다른 각도에서 보면 전혀 다른 의미가 보일 거예요. 멈추는 것이 패배가 아니에요.',
  },
  {
    id: 'death', arcana: 13, romanNumeral: 'XIII',
    name: 'Death', nameKr: '죽음',
    image: '/cards/13-death.jpg',
    keywords: ['끝과 시작', '변환', '놓아주기', '전환'],
    interpretation: '끝나는 것이 있어야 새로운 것이 시작될 수 있어요. 지금 잃어가는 것들을 붙잡지 말고 보내줄 준비를 해요. 이 카드는 죽음이 아니라 다시 태어남이에요.',
  },
  {
    id: 'temperance', arcana: 14, romanNumeral: 'XIV',
    name: 'Temperance', nameKr: '절제',
    image: '/cards/14-temperance.jpg',
    keywords: ['균형', '조화', '인내', '치유'],
    interpretation: '서두르지 않아도 돼요. 지금은 극단으로 치닫지 않고 부드럽게 흘러가는 것이 맞아요. 균형 잡힌 흐름 속에서 조용히 치유되고 있어요.',
  },
  {
    id: 'devil', arcana: 15, romanNumeral: 'XV',
    name: 'The Devil', nameKr: '악마',
    image: '/cards/15-devil.jpg',
    keywords: ['집착', '속박', '그림자', '욕망'],
    interpretation: '지금 어떤 것에 묶여있다는 느낌이 드나요. 하지만 그 사슬은 생각보다 느슨해요. 놓아주기로 선택하면 언제든 벗어날 수 있어요.',
  },
  {
    id: 'tower', arcana: 16, romanNumeral: 'XVI',
    name: 'The Tower', nameKr: '탑',
    image: '/cards/16-tower.jpg',
    keywords: ['갑작스러운 변화', '붕괴', '해방', '각성'],
    interpretation: '무너지는 것은 가짜 안정이었을지 몰라요. 지금 이 혼란은 더 튼튼한 것을 쌓기 위한 필연적인 과정이에요. 흔들려도 괜찮아요.',
  },
  {
    id: 'star', arcana: 17, romanNumeral: 'XVII',
    name: 'The Star', nameKr: '별',
    image: '/cards/17-star.jpg',
    keywords: ['희망', '치유', '영감', '회복'],
    interpretation: '가장 어두운 밤 가장 밝게 빛나는 별처럼, 지금 이 시간이 지나면 당신은 더 맑아질 거예요. 아직 희망이 있어요. 여기 있어요.',
  },
  {
    id: 'moon', arcana: 18, romanNumeral: 'XVIII',
    name: 'The Moon', nameKr: '달',
    image: '/cards/18-moon.jpg',
    keywords: ['불안', '무의식', '환상', '숨겨진 것들'],
    interpretation: '달은 드러나지 않는 감정의 세계를 비춰요. 지금 보이지 않는 것들이 당신 안에서 조용히 움직이고 있어요. 두려움의 정체를 직면하면 그 힘은 절반으로 줄어요.',
  },
  {
    id: 'sun', arcana: 19, romanNumeral: 'XIX',
    name: 'The Sun', nameKr: '태양',
    image: '/cards/19-sun.jpg',
    keywords: ['기쁨', '활력', '성공', '명확함'],
    interpretation: '따뜻하고 밝은 에너지가 당신 주변에 있어요. 지금은 자신을 믿어도 되는 시간이에요. 그동안 힘들었던 것들이 마침내 빛을 받고 있어요.',
  },
  {
    id: 'judgement', arcana: 20, romanNumeral: 'XX',
    name: 'Judgement', nameKr: '심판',
    image: '/cards/20-judgement.jpg',
    keywords: ['각성', '해방', '새로운 시작', '과거와의 화해'],
    interpretation: '스스로를 오래 판단해온 목소리에서 자유로워질 때예요. 지금 느끼는 것은 새로운 나를 만나기 직전의 설렘이에요. 용서하고 나아가요.',
  },
  {
    id: 'world', arcana: 21, romanNumeral: 'XXI',
    name: 'The World', nameKr: '세계',
    image: '/cards/21-world.jpg',
    keywords: ['완성', '통합', '성취', '순환의 완료'],
    interpretation: '오랫동안 걸어온 여정이 완성에 가까워지고 있어요. 이미 당신은 많이 성장했어요. 지금 이 순간 충분히 자랑스러워해도 돼요.',
  },
]
```

- [ ] **Step 2: TypeScript 확인**

```bash
cd /Users/jeonminji/conductor/workspaces/secret-diary/rio-de-janeiro
pnpm build 2>&1 | grep -E "error|Error|✓ Compiled"
```

Expected: TypeScript 에러 발생 (CardReveal, CardSelection이 구 타입 사용 중 — 후속 태스크에서 수정). 빌드가 실패해도 괜찮다. 타입 에러 목록만 확인.

- [ ] **Step 3: Commit**

```bash
git add src/lib/tarot-data.ts
git commit -m "feat: expand tarot-data with 22 major arcana, new types, emotion bridge"
```

---

## Task 3: Home Page — lastEmotion 저장

**Files:**
- Modify: `src/app/(app)/home/page.tsx`

- [ ] **Step 1: handleSubmit에 localStorage 저장 추가**

`handleSubmit` 함수에 한 줄 추가한다:

```tsx
// src/app/(app)/home/page.tsx
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
      <div className="flex justify-between items-center mb-8">
        <span className="text-xs tracking-[0.2em] font-display text-white/40">FLOWRITING</span>
        {stage !== 'write' && (
          <button
            onClick={handleReset}
            className="text-white/40 hover:text-white transition-colors text-xs"
          >
            <span aria-hidden="true">↺</span> 다시 써보기
          </button>
        )}
      </div>
      {stage === 'write' && <WriteStage onSubmit={handleSubmit} />}
      {stage === 'dissolving' && <DissolvingStage />}
      {stage === 'response' && (
        <ResponseStage text={inputText} tag={selectedTag} onReset={handleReset} />
      )}
    </div>
  )
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
pnpm build 2>&1 | grep "home/page"
```

Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add "src/app/(app)/home/page.tsx"
git commit -m "feat: save lastEmotion to localStorage on emotion submit"
```

---

## Task 4: TarotIntention.tsx

**Files:**
- Create: `src/components/tarot/TarotIntention.tsx`

- [ ] **Step 1: TarotIntention 생성**

```tsx
// src/components/tarot/TarotIntention.tsx
'use client'

import type { LastEmotion } from '@/lib/tarot-data'
import GlassPanel from '@/components/ui/GlassPanel'

interface TarotIntentionProps {
  lastEmotion: LastEmotion | null
  onStart: () => void
}

export default function TarotIntention({ lastEmotion, onStart }: TarotIntentionProps) {
  const hasEmotion = lastEmotion?.tag != null

  return (
    <div className="flex flex-col gap-8 pt-4">
      {hasEmotion && (
        <div className="inline-flex items-center gap-2 self-start bg-accentPink/10 border border-accentPink/25 rounded-full px-4 py-1.5">
          <span className="text-accentPink text-[10px]">✦</span>
          <span className="text-accentPink text-[11px] font-medium">
            {lastEmotion!.tag}에 대한 리딩
          </span>
        </div>
      )}

      <div>
        <h2 className="font-serif text-3xl text-white/95 leading-relaxed mb-2">
          {hasEmotion ? '지금 마음을 담아\n카드를 골라봐요' : '지금 마음으로\n카드 한 장 골라봐요'}
        </h2>
        <p className="text-xs text-white/40 leading-relaxed">
          숨을 고르고, 가장 마음에 걸리는 것에 집중해요.
        </p>
      </div>

      {lastEmotion?.text && (
        <GlassPanel className="px-4 py-3">
          <p className="text-xs text-white/50 leading-relaxed line-clamp-3 italic">
            "{lastEmotion.text}"
          </p>
        </GlassPanel>
      )}

      <button
        onClick={onStart}
        className="w-full py-4 bg-accentViolet hover:opacity-90 active:scale-95 text-white font-semibold rounded-2xl transition-all text-sm"
      >
        카드 고르러 가기
      </button>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
pnpm build 2>&1 | grep -E "TarotIntention|error TS"
```

Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/components/tarot/TarotIntention.tsx
git commit -m "feat: add TarotIntention component with emotion context display"
```

---

## Task 5: TarotFanSelection.tsx

**Files:**
- Create: `src/components/tarot/TarotFanSelection.tsx`

- [ ] **Step 1: TarotFanSelection 생성**

```tsx
// src/components/tarot/TarotFanSelection.tsx
'use client'

import { useMemo, useState } from 'react'
import { TarotCard, TAROT_CARDS } from '@/lib/tarot-data'

interface TarotFanSelectionProps {
  onSelect: (card: TarotCard) => void
}

const FAN_ANGLES = [-36, -24, -12, 0, 12, 24, 36]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function TarotFanSelection({ onSelect }: TarotFanSelectionProps) {
  const fanCards = useMemo(() => shuffle(TAROT_CARDS).slice(0, 7), [])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-3xl text-white/95 leading-relaxed mb-1">
          무의식의 선택
        </h2>
        <p className="text-xs text-white/40 leading-relaxed">
          마음이 끌리는 카드를 하나 골라요.
        </p>
      </div>

      {/* Fan spread container */}
      <div className="relative h-[220px] w-full flex items-end justify-center">
        {fanCards.map((card, i) => (
          <button
            key={card.id}
            aria-label={`카드 ${i + 1} 선택`}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => onSelect(card)}
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              transformOrigin: '50% 100%',
              transform: `translateX(-50%) rotate(${FAN_ANGLES[i]}deg)${hoveredIndex === i ? ' translateY(-20px)' : ''}`,
              transition: 'transform 300ms ease',
              zIndex: hoveredIndex === i ? 10 : i,
            }}
            className="w-[72px] h-[124px] rounded-xl bg-gradient-to-br from-[#1F1836] to-[#0D0A18] border border-accentViolet/40 hover:border-accentViolet/80 flex items-center justify-center shadow-lg active:scale-95"
          >
            <div className="w-10 h-16 rounded-lg border border-accentViolet/15 flex flex-col justify-between items-center py-2">
              <span className="text-[7px] text-accentViolet/50">✦</span>
              <div className="w-4 h-4 rounded-full border border-dashed border-accentViolet/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-accentPink/50 rounded-full" />
              </div>
              <span className="text-[7px] text-accentViolet/50">✦</span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-white/25 text-center tracking-widest font-display animate-pulse">
        TAP TO CHOOSE
      </p>
    </div>
  )
}
```

- [ ] **Step 2: TypeScript 확인**

```bash
pnpm build 2>&1 | grep -E "TarotFanSelection|error TS"
```

Expected: 에러 없음

- [ ] **Step 3: Commit**

```bash
git add src/components/tarot/TarotFanSelection.tsx
git commit -m "feat: add TarotFanSelection with 7-card fan spread and Fisher-Yates shuffle"
```

---

## Task 6: CardReveal.tsx 교체

**Files:**
- Modify: `src/components/tarot/CardReveal.tsx`

기존 이모지 + bgGradient 방식을 실제 라이더-웨이트 이미지 + 키워드 칩 + 감정 브릿지 문장으로 교체한다.

- [ ] **Step 1: CardReveal.tsx 전체 교체**

```tsx
// src/components/tarot/CardReveal.tsx
'use client'

import { useEffect, useState } from 'react'
import { TarotCard } from '@/lib/tarot-data'

interface CardRevealProps {
  card: TarotCard
  emotionBridge: string
  onReset: () => void
  onGoHome: () => void
}

export default function CardReveal({ card, emotionBridge, onReset, onGoHome }: CardRevealProps) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setFlipped(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="flex flex-col items-center gap-5">
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

          {/* Front face — real artwork */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-accentPink/40 backface-hidden shadow-2xl"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <img
              src={card.image}
              alt={card.nameKr}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Card name badge */}
      <div className="inline-flex items-center gap-1.5 bg-accentPink/10 border border-accentPink/25 rounded-full px-3 py-1">
        <span className="text-[10px] text-accentPink font-display tracking-widest">
          {card.romanNumeral}
        </span>
        <span className="text-[10px] text-white/40">·</span>
        <span className="text-[11px] text-accentPink font-medium">
          {card.nameKr} ({card.name})
        </span>
      </div>

      {/* Emotion bridge */}
      <p className="text-[11px] text-accentViolet/80 italic text-center px-4 leading-relaxed">
        "{emotionBridge}"
      </p>

      {/* Interpretation */}
      <p
        className="text-xs text-white/70 leading-relaxed text-center px-2 max-h-[100px] overflow-y-auto"
        tabIndex={0}
        role="region"
        aria-label="카드 해석"
      >
        {card.interpretation}
      </p>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {card.keywords.map((kw) => (
          <span
            key={kw}
            className="text-[10px] text-white/40 bg-white/5 border border-white/10 rounded-full px-2.5 py-0.5"
          >
            #{kw}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 w-full mt-1">
        <button
          onClick={onGoHome}
          className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold rounded-xl border border-white/10 transition-all"
        >
          다시 적어보기
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3 bg-accentViolet hover:opacity-90 active:scale-95 text-white text-xs font-semibold rounded-xl transition-all"
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
pnpm build 2>&1 | grep -E "CardReveal|error TS"
```

Expected: `tarot/page.tsx`에서 CardReveal 호출부 에러 (새 props 미전달) — Task 7에서 수정.

- [ ] **Step 3: Commit**

```bash
git add src/components/tarot/CardReveal.tsx
git commit -m "feat: rewrite CardReveal with real artwork, emotion bridge, keyword chips"
```

---

## Task 7: TarotPage 교체

**Files:**
- Modify: `src/app/(app)/tarot/page.tsx`
- Delete: `src/components/tarot/CardSelection.tsx` (TarotFanSelection으로 대체됨)

- [ ] **Step 1: tarot/page.tsx 전체 교체**

```tsx
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
```

- [ ] **Step 2: 구 CardSelection.tsx 삭제**

```bash
rm src/components/tarot/CardSelection.tsx
```

- [ ] **Step 3: TypeScript 빌드 전체 통과 확인**

```bash
pnpm build 2>&1 | tail -20
```

Expected:
```
✓ Compiled successfully
Route (app)
├ ○ /
├ ○ /history
├ ○ /home
└ ○ /tarot
```

타입 에러가 있으면 에러 메시지를 보고 수정 후 재빌드한다.

- [ ] **Step 4: 브라우저 확인**

```bash
pnpm dev
```

`http://localhost:3000/tarot` 에서 확인:
1. intention 화면 — "카드 고르러 가기" 버튼 보임
2. 선택 화면 — 7장 부채꼴 카드 보임, hover 시 카드 위로 올라옴
3. 카드 탭 → 3D 플립 → 라이더-웨이트 이미지 표시
4. 해석 텍스트, 키워드 칩, 브릿지 문장 보임
5. "다시 적어보기" → intention으로 복귀
6. "다른 카드 뽑기" → selection으로 복귀

`http://localhost:3000/home` 에서 감정 제출 후 `/tarot` 이동 시:
- intention 화면에 감정 배지 표시 확인

- [ ] **Step 5: Commit**

```bash
git add "src/app/(app)/tarot/page.tsx"
git rm src/components/tarot/CardSelection.tsx
git commit -m "feat: upgrade tarot page — intention/selection/revealed stages, fan spread, emotion context"
```

---

## Self-Review

**Spec coverage:**
- [x] 22장 메이저 아르카나 데이터 — Task 2
- [x] 이미지 다운로드 스크립트 + `/public/cards/` — Task 1
- [x] `TarotStage` 타입 업데이트 (`intention | selection | revealed`) — Task 2
- [x] `LastEmotion` 타입 + `EMOTION_BRIDGE` — Task 2
- [x] `lastEmotion` localStorage 저장 — Task 3
- [x] TarotIntention — 감정 배지, CTA — Task 4
- [x] TarotFanSelection — 7장 fan, Fisher-Yates 셔플, hover — Task 5
- [x] CardReveal — 실제 아트워크, 브릿지 문장, 키워드 칩, `onGoHome` prop — Task 6
- [x] TarotPage — 새 stage 관리, emotion 읽기, CardSelection 삭제 — Task 7

**Type consistency:**
- `TarotCard.id` — Task 2 정의, Task 5 (`key={card.id}`), Task 7 사용 ✓
- `TarotCard.image` — Task 2 정의, Task 6 (`<img src={card.image}>`) ✓
- `TarotCard.romanNumeral`, `.nameKr`, `.name` — Task 2 정의, Task 6 배지 ✓
- `TarotCard.keywords` — Task 2 정의, Task 6 칩 ✓
- `LastEmotion` — Task 2 정의, Task 3·4·7 사용 ✓
- `EMOTION_BRIDGE` — Task 2 정의, Task 7 에서 `EMOTION_BRIDGE[tag ?? 'default']` ✓
- `CardRevealProps.emotionBridge: string` — Task 6 정의, Task 7 전달 ✓
- `CardRevealProps.onGoHome: () => void` — Task 6 정의, Task 7 전달 ✓
- `TarotFanSelectionProps.onSelect` — Task 5 정의, Task 7 전달 ✓
- `TarotIntentionProps.lastEmotion`, `.onStart` — Task 4 정의, Task 7 전달 ✓
