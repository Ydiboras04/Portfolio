'use client'

import { useEffect, useRef, useState } from 'react'
import { DemoFrame } from './DemoFrame'

// A self-contained mock of the Soluchat messaging UI. Everything here is
// invented: the channels, the people, the messages. Its job is to let a
// visitor feel the two things the case study claims -- browsable cross-timezone
// history and seamless reconnection -- without exposing the real product.

type Author = { id: string; name: string; initials: string; tz: string; self?: boolean }
type Message = { id: number; authorId: string; text: string; time: string }
type Channel = { id: string; name: string; members: number; messages: Message[] }

const STRINGS = {
  fr: {
    title: 'Soluchat — démo',
    placeholder: 'Écrire un message…',
    send: 'Envoyer',
    reconnect: 'Simuler une coupure réseau',
    online: 'Connecté',
    offline: 'Hors ligne',
    reconnecting: 'Reconnexion…',
    restored: 'Historique conservé, conversation reprise',
    typing: 'écrit…',
    members: 'membres',
    reply: 'Bien reçu — je regarde ça et je reviens vers toi.',
  },
  en: {
    title: 'Soluchat — demo',
    placeholder: 'Write a message…',
    send: 'Send',
    reconnect: 'Simulate a network drop',
    online: 'Connected',
    offline: 'Offline',
    reconnecting: 'Reconnecting…',
    restored: 'History kept, conversation resumed',
    typing: 'is typing…',
    members: 'members',
    reply: 'Got it — looking into this and getting back to you.',
  },
} as const

const PEOPLE: Record<string, Author> = {
  you: { id: 'you', name: 'You', initials: 'YO', tz: 'UTC+3', self: true },
  amara: { id: 'amara', name: 'Amara', initials: 'AM', tz: 'UTC+1' },
  sten: { id: 'sten', name: 'Sten', initials: 'ST', tz: 'UTC-5' },
  lena: { id: 'lena', name: 'Lena', initials: 'LE', tz: 'UTC+8' },
}

const CHANNELS: Channel[] = [
  {
    id: 'release',
    name: '#release-eu',
    members: 6,
    messages: [
      { id: 1, authorId: 'amara', text: 'Staging is green. Merging the pagination fix now.', time: '09:02' },
      { id: 2, authorId: 'sten', text: 'Just woke up here — reading the thread, no need to re-explain.', time: '09:04' },
      { id: 3, authorId: 'lena', text: 'End of my day, but history loaded instantly. Ship it.', time: '09:05' },
    ],
  },
  {
    id: 'support',
    name: '#support-ops',
    members: 4,
    messages: [
      { id: 1, authorId: 'lena', text: 'Reconnections were costing us a full history reload. Still the case?', time: '14:20' },
      { id: 2, authorId: 'you', text: 'Fixed — cursor-based now, only the delta comes back over the socket.', time: '14:22' },
    ],
  },
]

export function SoluchatDemo({ lang }: { lang: 'fr' | 'en' }) {
  const t = STRINGS[lang]
  const [channelId, setChannelId] = useState(CHANNELS[0].id)
  const [threads, setThreads] = useState<Record<string, Message[]>>(
    () => Object.fromEntries(CHANNELS.map((c) => [c.id, c.messages])),
  )
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [status, setStatus] = useState<'online' | 'offline' | 'reconnecting'>('online')
  const scrollRef = useRef<HTMLDivElement>(null)

  const messages = threads[channelId]

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, typing, channelId])

  function send() {
    const text = draft.trim()
    if (!text || status !== 'online') return
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setThreads((prev) => ({
      ...prev,
      [channelId]: [...prev[channelId], { id: Date.now(), authorId: 'you', text, time }],
    }))
    setDraft('')
    setTyping(true)
    window.setTimeout(() => {
      setTyping(false)
      setThreads((prev) => ({
        ...prev,
        [channelId]: [...prev[channelId], { id: Date.now() + 1, authorId: 'amara', text: t.reply, time }],
      }))
    }, 1400)
  }

  function simulateDrop() {
    if (status !== 'online') return
    setStatus('offline')
    window.setTimeout(() => setStatus('reconnecting'), 900)
    window.setTimeout(() => setStatus('online'), 2000)
  }

  return (
    <DemoFrame lang={lang} title={t.title}>
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Channel switcher */}
        <div className="flex gap-2 sm:w-40 sm:flex-col">
          {CHANNELS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setChannelId(c.id)}
              className={`flex-1 rounded-[4px] border px-3 py-2 text-left transition-colors duration-150 ease-instrument sm:flex-none ${
                c.id === channelId
                  ? 'border-amber/40 bg-amber/10 text-ink'
                  : 'border-line text-dim hover:border-line hover:text-ink'
              }`}
            >
              <span className="block font-mono text-[11px]">{c.name}</span>
              <span className="label !text-faint">{c.members} {t.members}</span>
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div className="flex min-w-0 flex-1 flex-col rounded-[4px] border border-line">
          {/* Status bar */}
          <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
            <span className="flex items-center gap-2 font-mono text-[10.5px] text-dim">
              <span
                aria-hidden
                className={`h-1.5 w-1.5 rounded-full ${
                  status === 'online' ? 'bg-amber' : status === 'offline' ? 'bg-faint' : 'bg-amber-bright'
                }`}
                style={status !== 'online' ? { animation: 'pulse-dot 1s ease-in-out infinite' } : undefined}
              />
              {status === 'online' ? t.online : status === 'offline' ? t.offline : t.reconnecting}
              {status === 'online' && <span className="text-faint">· {t.restored}</span>}
            </span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} role="log" aria-label={t.title} tabIndex={0} className="h-56 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m) => {
              const a = PEOPLE[m.authorId]
              return (
                <div key={m.id} className={`flex gap-2.5 ${a.self ? 'flex-row-reverse' : ''}`}>
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line font-mono text-[9px] text-dim">
                    {a.initials}
                  </span>
                  <div className={`min-w-0 max-w-[82%] ${a.self ? 'text-right' : ''}`}>
                    <p className="mb-0.5 font-mono text-[9.5px] text-faint">
                      {a.name} · {a.tz} · {m.time}
                    </p>
                    <p
                      className={`inline-block rounded-[5px] px-2.5 py-1.5 text-[12.5px] leading-[1.5] ${
                        a.self ? 'bg-amber/15 text-ink' : 'border border-line text-dim'
                      }`}
                    >
                      {m.text}
                    </p>
                  </div>
                </div>
              )
            })}
            {typing && (
              <p className="font-mono text-[10px] text-faint">{PEOPLE.amara.name} {t.typing}</p>
            )}
          </div>

          {/* Composer */}
          <div className="flex items-center gap-2 border-t border-line p-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send()
              }}
              disabled={status !== 'online'}
              placeholder={t.placeholder}
              className="min-w-0 flex-1 rounded-[3px] border border-line bg-transparent px-2.5 py-1.5 text-[12.5px] text-ink transition-colors duration-150 ease-instrument placeholder:text-faint focus:border-amber/50 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={send}
              disabled={status !== 'online' || !draft.trim()}
              className="rounded-[3px] bg-amber px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-bg transition-opacity duration-150 ease-instrument hover:opacity-90 disabled:opacity-40"
            >
              {t.send}
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={simulateDrop}
        disabled={status !== 'online'}
        className="mt-3 rounded-[3px] border border-line px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-dim transition-colors duration-150 ease-instrument hover:text-ink disabled:opacity-40"
      >
        {t.reconnect}
      </button>
    </DemoFrame>
  )
}
