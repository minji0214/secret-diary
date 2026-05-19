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
