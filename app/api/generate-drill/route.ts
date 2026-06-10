import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

export const runtime = 'nodejs'

const DRILL_NAMES: Record<string, Record<string, string[]>> = {
  badminton: {
    beginner: ['Shadow Footwork Drill', 'Clear & Return Drill', 'Net Lift Sequence'],
    intermediate: ['Multi-Feed Smash Drill', 'Attack-Defense Rotation', 'Cross-Court Drive Rally'],
    advanced: ['Deceptive Drop Shot Sequence', 'Full-Court Pressure Drill', 'Jump Smash Combo'],
  },
  tennis: {
    beginner: ['Baseline Rally Drill', 'Serve Toss Consistency', 'Forehand Groundstroke Loop'],
    intermediate: ['Approach Shot + Volley', 'Serve & Return Pressure', 'Inside-Out Forehand Drill'],
    advanced: ['Kick Serve Precision Drill', 'Net Attack Sequence', 'Pattern Play — T+Cross'],
  },
  football: {
    beginner: ['Cone Dribbling Figure-8', 'First Touch Control Drill', 'Pass & Move Grid'],
    intermediate: ['Rondo Possession Drill', 'Shooting Under Pressure', 'Wing Play Combination'],
    advanced: ['High Press Trigger Drill', 'Overlapping Run Pattern', 'Finishing Sequence'],
  },
  cricket: {
    beginner: ['Front Foot Drive Drill', 'Short Pitch Defense', 'Off-Break Bowling Action'],
    intermediate: ['Pull Shot Timing Drill', 'Yorker Length Practice', 'Fielding — Crow Hop Throw'],
    advanced: ['Switch Hit Trigger Drill', 'Reverse Swing Line Drill', 'Slip Catching Reflex'],
  },
  basketball: {
    beginner: ['Triple Threat Stance Drill', 'Form Shooting Close Range', 'Dribble Cone Circuit'],
    intermediate: ['Pick and Roll Read Drill', 'Mid-Range Pull-Up Series', 'Defensive Slide Agility'],
    advanced: ['Off-Ball Cut Shooting', 'Euro Step Finishing', 'Help Defense Rotation'],
  },
}

function pickDrill(sport: string, level: string): string {
  const options = DRILL_NAMES[sport]?.[level] ?? ['Custom Skill Drill']
  return options[Math.floor(Math.random() * options.length)]
}

export async function POST(req: NextRequest) {
  try {
    const { sport, level, focus } = await req.json()
    if (!sport || !level) return NextResponse.json({ error: 'sport and level required' }, { status: 400 })

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const drillName = pickDrill(sport, level)
    const focusNote = focus ? ` Focus specifically on: ${focus}.` : ''

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 600,
      messages: [
        {
          role: 'system',
          content: `You are an expert sports coach creating AI drill scripts. Write clear, actionable coaching drills. Be specific about technique cues, repetitions, and progressions.`,
        },
        {
          role: 'user',
          content: `Create a detailed coaching drill script for "${drillName}" — a ${level} level ${sport} drill.${focusNote}

Format:
🎯 DRILL: [name]
⏱ DURATION: [e.g. 15 minutes]
🔧 EQUIPMENT: [what you need]
📋 SETUP: [court/space setup in 1-2 sentences]
STEP 1 — WARM UP (X min): [description]
STEP 2 — MAIN DRILL (X min): [description with specific technique cues]
STEP 3 — PROGRESSION (X min): [how to make it harder]
STEP 4 — COOL DOWN (X min): [description]
💡 COACHING CUE: [one key phrase to remember]

Keep each step 2-3 sentences. Be specific and practical.`,
        },
      ],
    })

    const script = completion.choices[0]?.message?.content ?? 'Drill generation failed.'
    const durationMatch = script.match(/⏱ DURATION: ([^\n]+)/)
    const duration = durationMatch?.[1]?.trim() ?? '15-20 minutes'

    return NextResponse.json({ drillName, script, duration })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
