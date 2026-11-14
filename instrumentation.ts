export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  const { logEnvStatus } = await import('./lib/env-check')
  logEnvStatus()
}
