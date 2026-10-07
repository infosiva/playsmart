'use client'

import { useState, useRef } from 'react'
import Logo from '@/components/Logo'
import { MagneticButton } from '@infosiva/shared-ui/modern'

const SPORTS = [
  { id: 'badminton', label: 'Badminton', emoji: '🏸' },
  { id: 'tennis', label: 'Tennis', emoji: '🎾' },
  { id: 'football', label: 'Football', emoji: '⚽' },
  { id: 'cricket', label: 'Cricket', emoji: '🏏' },
  { id: 'basketball', label: 'Basketball', emoji: '🏀' },
]

const LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'Just starting out' },
  { id: 'intermediate', label: 'Intermediate', desc: '1-3 years experience' },
  { id: 'advanced', label: 'Advanced', desc: '3+ years, compete regularly' },
]

type State = 'idle' | 'generating' | 'done' | 'error'
type VideoState = 'idle' | 'loading' | 'ready' | 'error'

interface DrillResult {
  script: string
  videoUrl?: string
  drillName: string
  duration: string
}

export default function Home() {
  const [sport, setSport] = useState<string>(SPORTS[0].id)
  const [level, setLevel] = useState<string>(LEVELS[0].id)
  const [focus, setFocus] = useState('')
  const [state, setState] = useState<State>('idle')
  const [result, setResult] = useState<DrillResult | null>(null)
  const [error, setError] = useState('')
  const [videoState, setVideoState] = useState<VideoState>('idle')
  const [videoUrl, setVideoUrl] = useState<string>('')
  const drillRef = useRef<DrillResult | null>(null)

  async function generate() {
    if (!sport || !level) return
    setState('generating')
    setError('')
    setResult(null)
    setVideoState('idle')
    setVideoUrl('')
    try {
      const res = await fetch('/api/generate-drill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport, level, focus }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      drillRef.current = data
      setResult(data)
      setState('done')
      // Fire video generation in background — doesn't block drill display
      generateVideo(sport, data.drillName)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Generation failed')
      setState('error')
    }
  }

  async function generateVideo(sportId: string, drillName: string) {
    setVideoState('loading')
    try {
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sport: sportId, drillName }),
      })
      if (!res.ok) { setVideoState('error'); return }
      const data = await res.json()
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl)
        setVideoState('ready')
      } else {
        setVideoState('error')
      }
    } catch {
      setVideoState('error')
    }
  }

  return (
    <main style={{ minHeight: '100dvh', background: 'transparent', position: 'relative', overflow: 'hidden' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(255,245,248,0.82)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(225,29,116,0.12)',
        padding: '0 24px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Logo />
        <span style={{ fontSize: 13, color: 'rgba(42,11,28,0.62)', fontStyle: 'italic' }}>
          AI sports coaching
        </span>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 40px', position: 'relative', zIndex: 1 }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            display: 'inline-block', padding: '6px 16px', borderRadius: 99,
            background: 'rgba(225,29,116,0.1)', border: '1px solid rgba(225,29,116,0.25)',
            fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.08em',
            marginBottom: 20, textTransform: 'uppercase',
          }}>
            AI-Powered Drill Generator
          </div>
          <h1 style={{
            fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 900, lineHeight: 1.1,
            letterSpacing: '-1.5px', color: '#2a0b1c', marginBottom: 16,
          }}>
            Train smarter.<br />
            <span style={{ color: 'var(--accent)' }}>Level up faster.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(42,11,28,0.78)', maxWidth: 500, margin: '0 auto' }}>
            Pick your sport, skill level, and get AI-generated coaching drills tailored to you.
          </p>
        </div>

        {/* Sport picker */}
        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(42,11,28,0.62)', marginBottom: 10 }}>
            1. Choose your sport
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {SPORTS.map(s => (
              <button
                key={s.id}
                onClick={() => setSport(s.id)}
                style={{
                  padding: '14px 22px', borderRadius: 12, border: '1px solid',
                  borderColor: sport === s.id ? 'var(--accent)' : 'rgba(42,11,28,0.14)',
                  background: sport === s.id ? 'rgba(225,29,116,0.12)' : 'rgba(255,255,255,0.75)',
                  color: sport === s.id ? 'var(--accent)' : 'rgba(42,11,28,0.78)',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s cubic-bezier(0.23,1,0.32,1)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                <span style={{ fontSize: 20 }}>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
        </section>

        {/* Level picker */}
        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(42,11,28,0.62)', marginBottom: 10 }}>
            2. Your skill level
          </h2>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {LEVELS.map(l => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                style={{
                  padding: '14px 22px', borderRadius: 12, border: '1px solid',
                  borderColor: level === l.id ? 'var(--accent)' : 'rgba(42,11,28,0.14)',
                  background: level === l.id ? 'rgba(225,29,116,0.12)' : 'rgba(255,255,255,0.75)',
                  color: level === l.id ? 'var(--accent)' : 'rgba(42,11,28,0.78)',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s cubic-bezier(0.23,1,0.32,1)',
                  textAlign: 'left',
                }}
              >
                <div>{l.label}</div>
                <div style={{ fontSize: 12, fontWeight: 400, opacity: 0.6, marginTop: 2 }}>{l.desc}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Optional focus */}
        <section style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(42,11,28,0.62)', marginBottom: 10 }}>
            3. Focus area (optional)
          </h2>
          <input
            type="text"
            value={focus}
            onChange={e => setFocus(e.target.value)}
            placeholder={sport === 'badminton' ? 'e.g. smash technique, footwork, net play...' : sport === 'tennis' ? 'e.g. serve, backhand, net approach...' : 'e.g. dribbling, passing, shooting...'}
            style={{
              width: '100%', maxWidth: 480, padding: '14px 18px', borderRadius: 12,
              background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(42,11,28,0.14)',
              color: '#2a0b1c', fontSize: 15, outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(225,29,116,0.4)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(42,11,28,0.14)' }}
          />
        </section>

        {/* Generate button */}
        <MagneticButton
          onClick={generate}
          disabled={!sport || !level || state === 'generating'}
          style={{
            padding: '16px 40px', borderRadius: 12,
            background: sport && level ? 'var(--accent)' : 'rgba(255,255,255,0.75)',
            color: sport && level ? '#fff' : 'rgba(42,11,28,0.55)',
            fontSize: 16, fontWeight: 800, cursor: sport && level ? 'pointer' : 'not-allowed',
            border: 'none', transition: 'all 0.15s cubic-bezier(0.23,1,0.32,1)',
            letterSpacing: '-0.3px',
          }}
          onMouseEnter={e => { if (sport && level) (e.currentTarget as HTMLElement).style.background = '#be1860' }}
          onMouseLeave={e => { if (sport && level) (e.currentTarget as HTMLElement).style.background = 'var(--accent)' }}
        >
          {state === 'generating' ? '⚙ Generating drill...' : 'Generate My Drill →'}
        </MagneticButton>

        {/* Error */}
        {state === 'error' && (
          <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#9f1239', fontSize: 14 }}>
            {error}
          </div>
        )}

        {/* Result */}
        {state === 'done' && result && (
          <div style={{ marginTop: 40, animation: 'fadeUp 0.3s cubic-bezier(0.23,1,0.32,1)' }}>
            <div style={{
              padding: '32px', borderRadius: 16,
              background: 'rgba(225,29,116,0.05)', border: '1px solid rgba(225,29,116,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <span style={{ fontSize: 24 }}>🎯</span>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#2a0b1c', letterSpacing: '-0.3px' }}>{result.drillName}</h3>
                  <span style={{ fontSize: 13, color: 'rgba(225,29,116,0.8)' }}>{result.duration}</span>
                </div>
              </div>
              <div style={{ fontSize: 15, color: 'rgba(42,11,28,0.78)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {result.script}
              </div>
              {/* AI video — loads after drill */}
              <div style={{ marginTop: 24 }}>
                {videoState === 'loading' && (
                  <div style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(225,29,116,0.06)', border: '1px solid rgba(225,29,116,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                    <span style={{ fontSize: 13, color: 'rgba(225,29,116,0.8)' }}>Generating AI demo video… (1-2 min)</span>
                  </div>
                )}
                {videoState === 'ready' && videoUrl && (
                  <div>
                    <p style={{ fontSize: 12, color: 'rgba(225,29,116,0.7)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>AI Demo Video</p>
                    <video
                      src={videoUrl}
                      controls
                      style={{ width: '100%', borderRadius: 12, maxHeight: 400, background: '#000' }}
                    />
                  </div>
                )}
                {videoState === 'error' && (
                  <p style={{ fontSize: 12, color: 'rgba(42,11,28,0.3)' }}>Video unavailable — drill script above is your full guide.</p>
                )}
              </div>
              <button
                onClick={() => { setState('idle'); setResult(null) }}
                style={{
                  marginTop: 20, padding: '10px 20px', borderRadius: 8,
                  background: 'transparent', border: '1px solid rgba(225,29,116,0.3)',
                  color: 'var(--accent)', fontSize: 14, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Generate another →
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>
    </main>
  )
}
