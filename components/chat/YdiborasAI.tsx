'use client'

import { useEffect, useRef, useState } from 'react'
import type { Locale } from '@/lib/i18n/config'
import { useReducedMotion } from '@/lib/hooks/useReducedMotion'
import { Mascot } from './Mascot'
import { MascotAvatar } from './MascotAvatar'
import { askGemini, hasGeminiKey, GeminiError, type ChatMessage } from '@/lib/chat/gemini'

type Msg = ChatMessage & { seeded?: boolean }

const STRINGS = {
  fr: {
    name: 'Ydiboras AI',
    tagline: 'Posez-moi vos questions sur Nomeny',
    open: 'Ouvrir le chat Ydiboras AI',
    close: 'Fermer le chat',
    greeting:
      "Salut ! Je suis Ydiboras AI 👋 Posez-moi vos questions sur Nomeny — son parcours, ses compétences et ses projets.",
    placeholder: 'Votre question…',
    send: 'Envoyer',
    error: 'Oups, une erreur est survenue. Réessayez dans un instant.',
    unavailable: 'Le chat est momentanément indisponible.',
  },
  en: {
    name: 'Ydiboras AI',
    tagline: 'Ask me anything about Nomeny',
    open: 'Open Ydiboras AI chat',
    close: 'Close chat',
    greeting:
      "Hi! I'm Ydiboras AI 👋 Ask me anything about Nomeny — his background, skills and projects.",
    placeholder: 'Your question…',
    send: 'Send',
    error: 'Oops, something went wrong. Please try again in a moment.',
    unavailable: 'The chat is temporarily unavailable.',
  },
} as const

export function YdiborasAI({ locale }: { locale: Locale }) {
  const t = STRINGS[locale]
  const reduced = useReducedMotion()
  const keyed = hasGeminiKey()

  const [open, setOpen] = useState(false)
  // The launcher is a lightweight SVG at rest; the WebGL mascot mounts only
  // while hovered/focused (a continuous WebGL loop on an always-on-screen idle
  // button is wasteful on CPU/battery and measurably slows page interactivity).
  // Two flags give a smooth cross-fade rather than a hard swap: `live3D` is
  // whether the canvas is in the DOM, `show3D` drives its fade/scale. On leave
  // we fade out first, then unmount a beat later.
  const [live3D, setLive3D] = useState(false)
  const [show3D, setShow3D] = useState(false)
  const leaveTimer = useRef<number | null>(null)

  function enter3D() {
    if (leaveTimer.current) {
      window.clearTimeout(leaveTimer.current)
      leaveTimer.current = null
    }
    setLive3D(true)
    // Next frame, so the fade/scale transition runs from the hidden state.
    requestAnimationFrame(() => setShow3D(true))
  }
  function leave3D() {
    setShow3D(false)
    leaveTimer.current = window.setTimeout(() => setLive3D(false), 320)
  }
  const [messages, setMessages] = useState<Msg[]>([{ role: 'model', text: t.greeting, seeded: true }])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Keep the latest message in view as the thread grows or the bot "types".
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  // Focus the input when the panel opens; Esc closes it.
  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Cancel any in-flight request / pending timer if the widget unmounts.
  useEffect(
    () => () => {
      abortRef.current?.abort()
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current)
    },
    [],
  )

  async function send() {
    const text = draft.trim()
    if (!text || loading) return

    const userMsg: Msg = { role: 'user', text }
    const next = [...messages, userMsg]
    setMessages(next)
    setDraft('')

    if (!keyed) {
      setMessages((prev) => [...prev, { role: 'model', text: t.unavailable }])
      return
    }

    setLoading(true)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      // The seeded greeting is display-only; the API history is the real turns.
      const history = next.filter((m) => !m.seeded).map(({ role, text }) => ({ role, text }))
      const reply = await askGemini(history, controller.signal)
      setMessages((prev) => [...prev, { role: 'model', text: reply }])
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      const msg = err instanceof GeminiError && err.message === 'missing key' ? t.unavailable : t.error
      setMessages((prev) => [...prev, { role: 'model', text: msg }])
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 print:hidden">
      {/* Launcher */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          onMouseEnter={enter3D}
          onMouseLeave={leave3D}
          onFocus={enter3D}
          onBlur={leave3D}
          aria-label={t.open}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full border border-amber/30 bg-bg/90 shadow-[0_6px_24px_rgba(0,0,0,0.45)] backdrop-blur transition-[transform,border-color] duration-200 ease-[var(--ease-pop)] hover:-translate-y-0.5 hover:border-amber/60"
        >
          {!reduced && <span aria-hidden className="ydi-ring absolute inset-0 rounded-full border border-amber/40" />}
          {/* Idle: lightweight SVG, bobbing via CSS (no WebGL mounted). On
              hover/focus the 3D mascot grows in on top of the SVG rather than
              hard-swapping — so it reads as coming to life, not snapping in. The
              SVG stays underneath, covering the brief 3D-chunk load. */}
          <span className="relative block h-11 w-11">
            {/* Idle still is a render of the very same 3D model, so when the live
                3D mounts on hover it is pixel-for-pixel the same — it simply
                starts moving. No flat-vs-3D cross-fade, no ghosting. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, unoptimized images. */}
            <img
              src="/images/ydiboras-idle.png"
              alt=""
              aria-hidden
              className={`block h-11 w-11 ${!reduced && !live3D ? 'ydi-float' : ''}`}
            />
            {live3D && (
              <span
                className={`absolute inset-0 transition-opacity duration-200 ease-instrument motion-reduce:transition-none ${
                  show3D ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <MascotAvatar size={44} enable3D animate={!reduced} fallback={null} />
              </span>
            )}
          </span>
          {/* name tag on hover (pointer devices) */}
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-[4px] border border-line bg-bg/95 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.1em] text-dim opacity-0 transition-opacity duration-150 ease-instrument group-hover:opacity-100">
            {t.name}
          </span>
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label={t.name}
          className={`flex h-[min(540px,calc(100dvh-7rem))] w-[min(360px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-[10px] border border-line bg-bg/95 shadow-[0_12px_48px_rgba(0,0,0,0.55)] backdrop-blur ${
            reduced ? '' : 'ydi-panel-in'
          }`}
        >
          {/* Header */}
          <header className="flex items-center gap-2.5 border-b border-line px-3.5 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber/30 bg-amber/5">
              <MascotAvatar
                size={30}
                animate={!reduced}
                fallback={
                  // eslint-disable-next-line @next/next/no-img-element -- static export, unoptimized images.
                  <img src="/images/ydiboras-idle.png" alt="" aria-hidden className="h-[30px] w-[30px]" />
                }
              />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-[13px] font-semibold leading-tight tracking-[-0.01em]">{t.name}</p>
              <p className="truncate font-mono text-[9.5px] uppercase tracking-[0.1em] text-faint">{t.tagline}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.close}
              className="flex h-7 w-7 items-center justify-center rounded-[4px] text-dim transition-colors duration-150 ease-instrument hover:bg-line hover:text-ink"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          {/* Messages */}
          <div ref={scrollRef} role="log" aria-label={t.name} tabIndex={0} className="flex-1 space-y-3 overflow-y-auto px-3.5 py-3.5">
            {messages.map((m, i) => {
              const self = m.role === 'user'
              return (
                <div key={i} className={`flex gap-2 ${self ? 'flex-row-reverse' : ''}`}>
                  {!self && (
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber/30 bg-amber/5">
                      <Mascot size={18} animate={false} />
                    </span>
                  )}
                  <p
                    className={`max-w-[80%] whitespace-pre-wrap rounded-[8px] px-3 py-2 text-[13px] leading-[1.55] ${
                      self ? 'bg-amber/15 text-ink' : 'border border-line text-dim'
                    }`}
                  >
                    {m.text}
                  </p>
                </div>
              )
            })}
            {loading && (
              <div className="flex gap-2">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-amber/30 bg-amber/5">
                  <Mascot size={18} animate={!reduced} />
                </span>
                <span className="inline-flex items-center gap-1 rounded-[8px] border border-line px-3 py-2.5" aria-label="…">
                  {[0, 1, 2].map((d) => (
                    <span
                      key={d}
                      className={`h-1.5 w-1.5 rounded-full bg-dim ${reduced ? '' : 'ydi-typing-dot'}`}
                      style={reduced ? undefined : { animationDelay: `${d * 0.18}s` }}
                    />
                  ))}
                </span>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="flex items-end gap-2 border-t border-line p-2.5">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder={t.placeholder}
              className="max-h-24 min-w-0 flex-1 resize-none rounded-[6px] border border-line bg-transparent px-3 py-2 text-[13px] text-ink transition-colors duration-150 ease-instrument placeholder:text-faint focus:border-amber/50"
            />
            <button
              type="button"
              onClick={send}
              disabled={loading || !draft.trim()}
              aria-label={t.send}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] bg-amber text-bg transition-opacity duration-150 ease-instrument hover:opacity-90 disabled:opacity-40"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M2 8l12-5-5 12-2-5-5-2z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
