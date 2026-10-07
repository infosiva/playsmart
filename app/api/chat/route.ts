import { NextRequest, NextResponse } from 'next/server'
import { AI_LIMITER } from '@/lib/rateLimit'
import { chatChain } from '@/lib/chat-chain'

export const runtime = 'nodejs'

const SYSTEM = `You are DrillBot, a sports coaching assistant for PlaySmart. You help athletes with drill advice, technique tips, training plans, and injury prevention for badminton, tennis, football, cricket, and basketball.

Keep answers short (2-3 sentences max). Be practical and encouraging.

If asked about something outside sports coaching, respond: "I'm trained for sports coaching. For that, try Google or ChatGPT!"`

export async function POST(req: NextRequest) {
  const limited = AI_LIMITER.check(req); if (limited) return limited
  try {
    const { messages } = await req.json()
    const safe = (Array.isArray(messages) ? messages : []).slice(-10).map((m: { role?: string; content?: unknown }) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content ?? '').slice(0, 1000) })) as { role: 'user' | 'assistant'; content: string }[]
    const out = await chatChain([{ role: 'system', content: SYSTEM }, ...safe])
    return NextResponse.json({ content: out?.text ?? 'Chat is resting. Try again in a moment.' })
  } catch (e) {
    console.error(JSON.stringify({ level: 'error', scope: 'playsmart.chat', message: String((e as Error)?.message).slice(0, 200) }))
    return NextResponse.json({ content: 'Chat is resting. Try again in a moment.' })
  }
}
