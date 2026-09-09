import { describe, it, expect } from 'vitest'
import { assertClientEnv } from '@/lib/env'

// The bug this guards against shipped once and was invisible from inside the
// app: the deployed contact form posted access_key="" and every submission was
// rejected by Web3Forms, while the visitor saw only the generic failure and the
// site owner saw nothing. These assert the guard fires on the exact shapes an
// unset variable actually takes on a build host -- undefined when the variable
// was never defined for the environment being built, and empty-string when it
// was defined but left blank.
describe('assertClientEnv', () => {
  it('passes when the Web3Forms key is present', () => {
    expect(() => assertClientEnv({ NEXT_PUBLIC_WEB3FORMS_KEY: 'a6c1a6ae-0000-0000-0000-000000000000' })).not.toThrow()
  })

  it('throws when the key is undefined', () => {
    expect(() => assertClientEnv({})).toThrow(/NEXT_PUBLIC_WEB3FORMS_KEY/)
  })

  it('throws when the key is defined but empty', () => {
    expect(() => assertClientEnv({ NEXT_PUBLIC_WEB3FORMS_KEY: '' })).toThrow(/NEXT_PUBLIC_WEB3FORMS_KEY/)
  })

  // Vercel's dashboard trims nothing, and a value pasted with a stray newline
  // or space reads as present to a truthiness check while inlining whitespace
  // that Web3Forms rejects exactly like an empty key.
  it('throws when the key is only whitespace', () => {
    expect(() => assertClientEnv({ NEXT_PUBLIC_WEB3FORMS_KEY: '  \n ' })).toThrow(/NEXT_PUBLIC_WEB3FORMS_KEY/)
  })

  // The message is the entire value of this guard: it fires on a build host,
  // where the reader has no context and cannot inspect anything. Naming the
  // Preview/Production scoping and the build cache is what makes it actionable
  // rather than just a stop.
  it('names both dashboard causes in the failure message', () => {
    expect(() => assertClientEnv({})).toThrow(/Preview, not Production/)
    expect(() => assertClientEnv({})).toThrow(/Build Cache/)
  })
})
