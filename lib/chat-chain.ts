// Free-tier chat chain: Groq -> Gemini -> Cerebras. Returns null when every provider is down/unset (caller shows a static fallback, never 500).
type Msg = { role: 'user' | 'assistant' | 'system'; content: string }

async function openaiCompat(url: string, key: string | undefined, model: string, msgs: Msg[], max: number): Promise<string | null> {
  if (!key) return null
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` }, body: JSON.stringify({ model, messages: msgs, max_tokens: max, temperature: 0.6 }), signal: AbortSignal.timeout(12000) })
    if (!r.ok) return null
    const j = await r.json()
    return j?.choices?.[0]?.message?.content?.trim() || null
  } catch { return null }
}

async function gemini(key: string | undefined, msgs: Msg[], max: number): Promise<string | null> {
  if (!key) return null
  try {
    const sys = msgs.filter(m => m.role === 'system').map(m => m.content).join('\n')
    const contents = msgs.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-goog-api-key': key }, body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents, generationConfig: { maxOutputTokens: max, temperature: 0.6 } }), signal: AbortSignal.timeout(12000) })
    if (!r.ok) return null
    const j = await r.json()
    return j?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
  } catch { return null }
}

export async function chatChain(msgs: Msg[], max = 400): Promise<{ text: string; provider: string } | null> {
  const g = await openaiCompat('https://api.groq.com/openai/v1/chat/completions', process.env.GROQ_API_KEY, 'llama-3.3-70b-versatile', msgs, max)
  if (g) return { text: g, provider: 'groq' }
  const m = await gemini(process.env.GEMINI_API_KEY, msgs, max)
  if (m) return { text: m, provider: 'gemini' }
  const c = await openaiCompat('https://api.cerebras.ai/v1/chat/completions', process.env.CEREBRAS_API_KEY, 'llama3.1-8b', msgs, max)
  if (c) return { text: c, provider: 'cerebras' }
  return null
}
