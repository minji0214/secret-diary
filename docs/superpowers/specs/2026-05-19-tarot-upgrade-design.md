# 흘려쓰기 타로 고도화 — Design Spec

## Overview

타로 방을 MVP 수준(3장 이모지 카드)에서 전문 타로 앱 수준으로 업그레이드한다.  
라이더-웨이트 덱 메이저 아르카나 22장 · 부채꼴 카드 선택 · 감정 연동 해석.

**범위:** UI-only (Phase 1 연장). 백엔드/저장 없음.  
**스택:** Next.js 16 App Router, React 19, Tailwind CSS v4, TypeScript

---

## Stage 플로우

```
intention  →  selection  →  revealed
```

| Stage | 설명 |
|-------|------|
| `intention` | 감정 컨텍스트 표시 + "카드 고르러 가기" CTA |
| `selection` | 7장 부채꼴 fan spread — 탭하면 해당 카드 공개로 전환 |
| `revealed` | 3D flip → 라이더-웨이트 아트워크 + 한국어 해석 + 감정 브릿지 문장 |

---

## 감정 연동 메커니즘

홈 페이지에서 "감정 흘려보내기" 제출 시:
```ts
localStorage.setItem('lastEmotion', JSON.stringify({
  tag: selectedTag,   // EmotionTag | null
  text: inputText,    // string
}))
```

타로 페이지 mount 시:
```ts
const lastEmotion = JSON.parse(localStorage.getItem('lastEmotion') ?? 'null')
```

- `lastEmotion` 있으면 → intention 화면에 감정 배지 표시, revealed에 브릿지 문장 삽입
- 없으면 → 배지 없이 진행, `'default'` 브릿지 사용

---

## 파일 구조

### 새로 생성

| 파일 | 역할 |
|------|------|
| `public/cards/00-fool.jpg` ~ `public/cards/21-world.jpg` | 라이더-웨이트 22장 로컬 이미지 |
| `scripts/download-tarot-cards.sh` | Wikimedia Commons에서 이미지 다운로드 스크립트 |
| `src/components/tarot/TarotIntention.tsx` | intention 화면 컴포넌트 |
| `src/components/tarot/TarotFanSelection.tsx` | 부채꼴 7장 카드 선택 컴포넌트 |

### 수정

| 파일 | 변경 내용 |
|------|----------|
| `src/lib/tarot-data.ts` | TarotCard 타입 확장, 22장 데이터, EMOTION_BRIDGE 추가 |
| `src/components/tarot/CardReveal.tsx` | `<img>` 아트워크 표시, 브릿지 문장 prop 추가 |
| `src/app/(app)/tarot/page.tsx` | stage 관리 업데이트, emotion 컨텍스트 읽기 |
| `src/app/(app)/home/page.tsx` | 제출 시 `lastEmotion` localStorage 저장 |

---

## 타입 & 데이터

### TarotCard 타입 (확장)

```ts
export type TarotCard = {
  id: string           // 'fool', 'magician', ...
  arcana: number       // 0–21
  romanNumeral: string // 'O', 'I', 'II', ... 'XXI'
  name: string         // 'The Fool'
  nameKr: string       // '바보'
  image: string        // '/cards/00-fool.jpg'
  keywords: string[]   // 3–4개 한국어 키워드
  interpretation: string // 3–4문장, 흘려쓰기 감성 톤
}
```

### TarotStage 타입 (수정)

```ts
export type TarotStage = 'intention' | 'selection' | 'revealed'
```

### LastEmotion 타입 (신규)

```ts
export type LastEmotion = {
  tag: EmotionTag | null
  text: string
}
```

### EMOTION_BRIDGE

```ts
export const EMOTION_BRIDGE: Record<EmotionTag | 'default', string> = {
  '연애 고민': '지금 뽑은 카드는 그 관계 속 당신의 무의식이 반응한 것이에요.',
  '불안한 새벽': '새벽의 불안함이 이 카드를 불러왔을지도 몰라요.',
  '혼잣말': '아무에게도 못한 말이 이 카드를 선택하게 했어요.',
  '서운함': '서운함이 쌓인 지금, 이 카드가 당신에게 말을 걸어요.',
  'default': '지금 이 순간 당신의 무의식이 반응한 카드예요.',
}
```

### TAROT_CARDS — 22장 메이저 아르카나

```ts
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

---

## 카드 이미지 다운로드

`scripts/download-tarot-cards.sh` — Wikimedia Commons 퍼블릭 도메인 이미지 22장 다운로드:

```bash
#!/bin/bash
set -e
mkdir -p public/cards

BASE="https://upload.wikimedia.org/wikipedia/commons"

download() {
  local dest="public/cards/$1"
  local url="$BASE/$2"
  if [ ! -f "$dest" ]; then
    echo "Downloading $1..."
    curl -sL "$url" -o "$dest"
  else
    echo "Skipping $1 (already exists)"
  fi
}

download "00-fool.jpg"            "9/90/RWS_Tarot_00_Fool.jpg"
download "01-magician.jpg"        "1/10/RWS_Tarot_01_Magician.jpg"
download "02-high-priestess.jpg"  "8/88/RWS_Tarot_02_High_Priestess.jpg"
download "03-empress.jpg"         "d/d2/RWS_Tarot_03_Empress.jpg"
download "04-emperor.jpg"         "c/c3/RWS_Tarot_04_Emperor.jpg"
download "05-hierophant.jpg"      "8/8d/RWS_Tarot_05_Hierophant.jpg"
download "06-lovers.jpg"          "3/3a/RWS_Tarot_06_Lovers.jpg"
download "07-chariot.jpg"         "9/9b/RWS_Tarot_07_Chariot.jpg"
download "08-strength.jpg"        "f/f5/RWS_Tarot_08_Strength.jpg"
download "09-hermit.jpg"          "4/4d/RWS_Tarot_09_Hermit.jpg"
download "10-wheel-of-fortune.jpg" "3/3c/RWS_Tarot_10_Wheel_of_Fortune.jpg"
download "11-justice.jpg"         "e/e0/RWS_Tarot_11_Justice.jpg"
download "12-hanged-man.jpg"      "2/2b/RWS_Tarot_12_Hanged_Man.jpg"
download "13-death.jpg"           "d/d7/RWS_Tarot_13_Death.jpg"
download "14-temperance.jpg"      "f/f8/RWS_Tarot_14_Temperance.jpg"
download "15-devil.jpg"           "5/55/RWS_Tarot_15_Devil.jpg"
download "16-tower.jpg"           "5/53/RWS_Tarot_16_Tower.jpg"
download "17-star.jpg"            "d/db/RWS_Tarot_17_Star.jpg"
download "18-moon.jpg"            "7/7f/RWS_Tarot_18_Moon.jpg"
download "19-sun.jpg"             "1/17/RWS_Tarot_19_Sun.jpg"
download "20-judgement.jpg"       "d/dd/RWS_Tarot_20_Judgement.jpg"
download "21-world.jpg"           "f/ff/RWS_Tarot_21_World.jpg"

echo "Done. $(ls public/cards/*.jpg | wc -l) cards downloaded."
```

---

## 스크린 설계

### intention 화면

```
[TAROT READINGS 레이블]

[감정 배지] ✦ 서운함에 대한 리딩  ← lastEmotion 있을 때만
지금 마음을 담아
카드를 골라봐요

숨을 고르고, 가장 마음에 걸리는 것에 집중해요.

[카드 고르러 가기] 버튼 → selection stage
```

- `lastEmotion` 없으면 배지 미표시, 제목 "지금 마음으로 카드 한 장 골라봐요"

### selection 화면 (Fan Spread)

```
[TAROT READINGS 레이블]

무의식의 선택

당신의 마음이 끌리는 카드를 골라요.

        [카드7] [카드6] [카드5]
      [카드4]        [카드3]
    [카드2]              [카드1]
          ↑ 부채꼴 배치

마음이 끌리는 카드를 탭해요  ← pulse hint
```

**Fan 구현:**
- `TAROT_CARDS` 22장을 Fisher-Yates 셔플 → 앞 7장 추출
- 7장을 -36deg ~ +36deg (12도 간격) CSS `rotate()` + `transform-origin: bottom center`로 배치
- `position: absolute`, 각도 배열: `[-36, -24, -12, 0, 12, 24, 36]`
- hover: `translateY(-16px)`, transition 300ms
- 선택 시: `revealed` stage로 전환, 선택된 카드 전달

### revealed 화면

```
[TAROT READINGS 레이블]    [↺ 다른 카드]

[카드 3D 플립 → 라이더웨이트 이미지]
           140px × 240px

[XVIII · 달 (The Moon)]  ← 배지

"서운함이 쌓인 지금, 이 카드가 당신에게 말을 걸어요."  ← 브릿지 (accentViolet italic)

달은 드러나지 않는 감정의 세계를 비춰요...  ← interpretation

[#불안  #무의식  #환상  #숨겨진 것들]  ← keyword chips

[다시 적어보기]   [다른 카드 뽑기]
```

---

## 컴포넌트 인터페이스

### TarotIntention.tsx

```ts
interface TarotIntentionProps {
  lastEmotion: LastEmotion | null
  onStart: () => void
}
```

### TarotFanSelection.tsx

```ts
interface TarotFanSelectionProps {
  onSelect: (card: TarotCard) => void
}
// 내부에서 22장 셔플 → 7장 추출, 각도 배열로 fan 렌더링
```

### CardReveal.tsx (수정)

```ts
interface CardRevealProps {
  card: TarotCard
  emotionBridge: string  // EMOTION_BRIDGE[tag ?? 'default']
  onReset: () => void
  onGoHome: () => void
}
```

### TarotPage stage 관리

```ts
type TarotStage = 'intention' | 'selection' | 'revealed'

// state
const [stage, setStage] = useState<TarotStage>('intention')
const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null)
const [lastEmotion, setLastEmotion] = useState<LastEmotion | null>(null)

// mount
useEffect(() => {
  const raw = localStorage.getItem('lastEmotion')
  if (raw) setLastEmotion(JSON.parse(raw))
}, [])
```

---

## next.config 이미지 도메인

`public/cards/`는 로컬 정적 파일이므로 별도 설정 불필요. `<img>` 태그 직접 사용 (next/image 불필요).

---

## Out of Scope

- 역방향(Reversed) 카드 해석
- 3장 이상 스프레드
- 리딩 저장/히스토리
- 감정별 카드별 개별 해석 (브릿지 문장으로 대체)
- 카드 셔플 입장 애니메이션
