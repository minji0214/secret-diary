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
