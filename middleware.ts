import { NextResponse, type NextRequest } from 'next/server'

const SERVICE_BUSY_MESSAGE = 'Service in high demand, please try again in a few minutes.'
const LIMIT = 60 // requests
const WINDOW_MS = 60_000 // per minute

// Per-instance only: resets on a cold start but still blocks bursts.
const buckets = new Map<string, { count: number; resetAt: number }>()
const MAX_BUCKETS = 10_000

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  const ip = fwd ? fwd.split(',')[0].trim() : req.headers.get('x-real-ip')
  return ip || 'unknown'
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/sitemap')
  ) {
    return NextResponse.next()
  }

  if (!req.nextUrl.pathname.startsWith('/api/')) return NextResponse.next()

  if (process.env.NODE_ENV !== 'production') return NextResponse.next()

  const now = Date.now()
  const ip = clientIp(req)

  const auth = req.headers.get('authorization')
  if (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.next()
  }

  const bucket = buckets.get(ip)
  if (!bucket || now >= bucket.resetAt) {
    if (buckets.size >= MAX_BUCKETS) buckets.clear()
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return NextResponse.next()
  }

  if (bucket.count >= LIMIT) {
    return NextResponse.json({ error: SERVICE_BUSY_MESSAGE }, { status: 503 })
  }

  bucket.count += 1
  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}