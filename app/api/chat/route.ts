import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: `You are DrillBot, a sports coaching assistant for PlaySmart. You help athletes with drill advice, technique tips, training plans, and injury prevention for badminton, tennis, football, cricket, and basketball.

Keep answers short (2-3 sentences max). Be practical and encouraging.

If asked about something outside sports coaching, respond: "I'm trained for sports coaching. For that, try Google or ChatGPT!"`,
        },
        ...messages,
      ],
    })

    return NextResponse.json({
      content: completion.choices[0]?.message?.content ?? 'Try again.',
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
