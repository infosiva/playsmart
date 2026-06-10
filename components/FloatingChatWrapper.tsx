'use client'

import { useState, useRef, useEffect } from 'react'

const ACCENT = '#4ade80'
const ACCENT_RGB = '74,222,128'
const BG = 'rgba(8,20,10,0.97)'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function FloatingChatWrapper() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const next = [...messages, { role: 'user' as const, content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      setMessages([...next, { role: 'assistant', content: data.content ?? data.error ?? 'Error' }])
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Connection error. Try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const BOTTOM_OFFSET = 84
  const panelStyle: React.CSSProperties = isMobile ? {
    position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9998,
    width: '100%', height: `calc(100dvh - ${BOTTOM_OFFSET}px)`,
    borderRadius: '16px 16px 0 0',
    background: BG, border: `1px solid rgba(${ACCENT_RGB},0.25)`,
    boxShadow: '0 -8px 40px rgba(0,0,0,0.8)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    animation: 'drill-slide-bottom 0.3s cubic-bezier(0.23,1,0.32,1)',
  } : {
    position: 'fixed', bottom: 88, right: 24, zIndex: 9998,
    width: 360, height: 500, borderRadius: 16,
    background: BG, border: `1px solid rgba(${ACCENT_RGB},0.25)`,
    boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    animation: 'drill-slide-up 0.22s ease-out',
  }

  return (
    <>
      <style>{`
        @keyframes drill-slide-up { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes drill-slide-bottom { from { transform:translateY(100%); } to { transform:translateY(0); } }
        @media (prefers-reduced-motion: reduce) { * { animation:none!important; } }
      `}</style>

      {/* FAB */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open DrillBot"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 52, height: 52, borderRadius: '50%', border: 'none',
          background: ACCENT, color: '#050e07', fontSize: 22,
          cursor: 'pointer', boxShadow: `0 4px 20px rgba(${ACCENT_RGB},0.4)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.15s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
      >
        {open ? '✕' : '🏃'}
      </button>

      {open && (
        <div style={panelStyle}>
          {/* Header */}
          <div style={{
            flexShrink: 0, padding: '14px 16px',
            borderBottom: `1px solid rgba(${ACCENT_RGB},0.12)`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>
              🏃 DrillBot
            </span>
            <span style={{ fontSize: 12, color: `rgba(${ACCENT_RGB},0.7)` }}>Sports coaching AI</span>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 && (
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', marginTop: 40 }}>
                Ask me about drills, technique, or training plans!
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '82%',
                padding: '9px 13px', borderRadius: 12,
                background: m.role === 'user' ? ACCENT : 'rgba(255,255,255,0.07)',
                color: m.role === 'user' ? '#050e07' : 'rgba(255,255,255,0.88)',
                fontSize: 14, lineHeight: 1.5,
              }}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', color: `rgba(${ACCENT_RGB},0.6)`, fontSize: 13 }}>
                thinking...
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div style={{
            flexShrink: 0, padding: '10px 12px',
            paddingBottom: `max(10px, env(safe-area-inset-bottom))`,
            borderTop: `1px solid rgba(${ACCENT_RGB},0.1)`,
            display: 'flex', gap: 8,
          }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask DrillBot..."
              style={{
                flex: 1, padding: '9px 13px', borderRadius: 8,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff', fontSize: isMobile ? 16 : 13.5, outline: 'none',
              }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                padding: '9px 14px', borderRadius: 8, border: 'none',
                background: input.trim() ? ACCENT : 'rgba(255,255,255,0.08)',
                color: input.trim() ? '#050e07' : 'rgba(255,255,255,0.3)',
                fontSize: 14, fontWeight: 700, cursor: input.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.12s',
              }}
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
