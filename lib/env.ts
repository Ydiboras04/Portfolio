// NEXT_PUBLIC_* values are substituted into the client bundle as literal text
// when `next build` runs -- they are not read at runtime. This site is a static
// export with no server, so a build that runs without the Web3Forms key emits a
// contact form that posts `access_key: ""` and is rejected for every visitor,
// with nothing in any log to say so: there is no server to log it, the visitor
// sees only the generic failure message, and the owner sees nothing at all.
// That is exactly how it first reached production -- the variable existed in
// the dashboard but not in the environment of the build being served.
//
// The check therefore has to happen at build time, because that is the only
// moment the value can still be baked in. Scoping an env var to Production
// alone is the usual cause: every branch deploy builds as Preview and inlines
// an empty string. The key is public by design (it ships in the bundle to every
// visitor), so there is no reason to withhold it from any environment.
export function assertClientEnv(env: Record<string, string | undefined>): void {
  if ((env.NEXT_PUBLIC_WEB3FORMS_KEY ?? '').trim() !== '') return

  throw new Error(
    'NEXT_PUBLIC_WEB3FORMS_KEY is empty or unset at build time.\n' +
      'The contact form would build with access_key="" and silently reject every message.\n' +
      '  Local:  copy .env.local.example to .env.local and paste the key from web3forms.com\n' +
      '  Vercel: Settings > Environment Variables. Make sure the key is enabled for the\n' +
      '          environment being built (a branch deploy builds as Preview, not Production),\n' +
      '          then redeploy with "Use existing Build Cache" unchecked -- a cached build\n' +
      '          reuses the already-compiled chunk and ignores the new value.',
  )
}
