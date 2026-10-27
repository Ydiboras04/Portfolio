import { SYSTEM_PROMPT } from './knowledge'

// Google Gemini, called straight from the browser. The site is a static export
// with no server, so there is nowhere else to call it from -- which is why the
// key is a NEXT_PUBLIC_* value inlined into the bundle (acceptable for testing
// only; for production this single function should point at a serverless proxy
// instead, and the key should be restricted/rotated).

// `gemini-flash-lite-latest`: a "latest" alias (won't retire like a pinned
// version), fast (~1s) and reliable for this key tier. generateContent only.
const MODEL = 'gemini-flash-lite-latest'
const ENDPOINT = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`

export type ChatRole = 'user' | 'model'
export interface ChatMessage {
  role: ChatRole
  text: string
}

export function hasGeminiKey(): boolean {
  return (process.env.NEXT_PUBLIC_GEMINI_KEY ?? '').trim() !== ''
}

export class GeminiError extends Error {}

// Sends the full visible history plus the system instruction, and returns the
// model's reply text. Throws GeminiError on any transport/API/empty-reply
// problem so the widget can show a single friendly fallback line.
export async function askGemini(messages: ChatMessage[], signal?: AbortSignal): Promise<string> {
  const key = (process.env.NEXT_PUBLIC_GEMINI_KEY ?? '').trim()
  if (!key) throw new GeminiError('missing key')

  let response: Response
  try {
    response = await fetch(ENDPOINT(key), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
        generationConfig: { temperature: 0.5, maxOutputTokens: 800 },
      }),
    })
  } catch (cause) {
    // Abort is surfaced as-is so the caller can distinguish a cancellation.
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    throw new GeminiError('network error', { cause })
  }

  if (!response.ok) throw new GeminiError(`http ${response.status}`)

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[]
  }
  const text = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? '')
    .join('')
    .trim()

  if (!text) throw new GeminiError('empty reply')
  return text
}
