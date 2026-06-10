import { NextRequest, NextResponse } from 'next/server'
import { createFalClient } from '@fal-ai/client'

export const runtime = 'nodejs'
export const maxDuration = 300

const SPORT_PROMPTS: Record<string, string> = {
  badminton: 'professional badminton coach demonstrating footwork and smash technique on a court, slow-motion sports training video, clear athletic form, indoor sports hall lighting',
  tennis:    'professional tennis coach demonstrating forehand groundstroke and serve technique, slow-motion sports training video, outdoor clay court, clear coaching form',
  football:  'professional football coach demonstrating dribbling and passing technique on a grass pitch, slow-motion sports training video, clear athletic coaching form',
  cricket:   'professional cricket coach demonstrating batting stance and bowling action, slow-motion sports training video, cricket pitch, clear technique demonstration',
  basketball:'professional basketball coach demonstrating dribbling and shooting technique on a court, slow-motion sports training video, indoor gymnasium, clear athletic form',
}

export async function POST(req: NextRequest) {
  const fal = createFalClient({ credentials: process.env.FAL_KEY })
  try {
    const { sport, drillName } = await req.json()
    if (!sport) return NextResponse.json({ error: 'sport required' }, { status: 400 })

    const basePrompt = SPORT_PROMPTS[sport] ?? `professional sports coach demonstrating ${sport} technique, slow-motion training video, clear athletic form`
    const prompt = drillName ? `${basePrompt}, focusing on ${drillName}` : basePrompt

    const result = await fal.subscribe('fal-ai/wan-t2v-14b', {
      input: {
        prompt,
        num_frames: 49,
        fps: 16,
        guidance_scale: 7.5,
      },
    }) as { data: { video: { url: string } } }

    const videoUrl = result?.data?.video?.url
    if (!videoUrl) return NextResponse.json({ error: 'No video URL returned' }, { status: 500 })

    return NextResponse.json({ videoUrl })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Video generation failed'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
