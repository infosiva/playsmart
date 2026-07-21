import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export const runtime = 'nodejs'

const SYSTEM_PROMPT = `You are DrillBot, a sports coaching assistant for PlaySmart. You help athletes with drill advice, technique tips, training plans, and injury prevention for badminton, tennis, football, cricket, and basketball.

Keep answers short (2-3 sentences max). Be practical and encouraging.

If asked about something outside sports coaching, respond: "I'm trained for sports coaching. For that, try Google or ChatGPT!"`

async function askGroq(model: string, messages: unknown[]) {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const completion = await groq.chat.completions.create({
    model,
    max_tokens: 300,
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...(messages as any)],
  })
  return completion.choices[0]?.message?.content ?? undefined
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  // Fallback chain: fast model first, then bigger model, never a raw 500 to the user
  for (const model of ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile']) {
    try {
      const content = await askGroq(model, messages)
      if (content) return NextResponse.json({ content })
    } catch {
      // try next model
    }
  }

  return NextResponse.json({
    content: "Chat is resting — try again in a moment.",
  })
}
