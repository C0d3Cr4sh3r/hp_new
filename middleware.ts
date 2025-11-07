import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { ADMIN_AUTH_COOKIE } from '@/lib/admin/constants'

const encoder = new TextEncoder()
let cachedSecret: string | null = null
let cachedDigest: string | null = null

const toHex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('')

const digestSecret = async (secret: string) => {
  if (cachedSecret === secret && cachedDigest) {
    return cachedDigest
  }
  const data = encoder.encode(secret)
  const digestBuffer = await crypto.subtle.digest('SHA-256', data)
  const digest = toHex(digestBuffer)
  cachedSecret = secret
  cachedDigest = digest
  return digest
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isLoginRoute = pathname === '/admin/login'
  const adminPassword = process.env.ADMIN_PASSWORD?.trim() ?? ''
  const adminDigestEnv = process.env.ADMIN_PASSWORD_DIGEST?.trim() ?? ''
  const secretConfigured = adminPassword.length > 0 || adminDigestEnv.length > 0
  const isProduction = process.env.NODE_ENV === 'production'

  if (!secretConfigured) {
    if (!isProduction) {
      return NextResponse.next()
    }

    if (isLoginRoute) {
      return NextResponse.next()
    }

    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('reason', 'missing-secret')
    if (pathname !== '/admin') {
      const search = request.nextUrl.search
      const redirectPath = `${pathname}${search}`
      loginUrl.searchParams.set('redirect', redirectPath)
    }
    return NextResponse.redirect(loginUrl)
  }

  const expectedDigest = adminDigestEnv.length > 0 ? adminDigestEnv : await digestSecret(adminPassword)
  const cookieValue = request.cookies.get(ADMIN_AUTH_COOKIE)?.value ?? null
  const isAuthenticated = expectedDigest.length > 0 && cookieValue === expectedDigest

  if (isAuthenticated) {
    if (isLoginRoute) {
      const redirectTarget = request.nextUrl.searchParams.get('redirect') ?? '/admin'
      return NextResponse.redirect(new URL(redirectTarget, request.url))
    }
    return NextResponse.next()
  }

  if (isLoginRoute) {
    return NextResponse.next()
  }

  const loginUrl = new URL('/admin/login', request.url)
  if (pathname !== '/admin') {
    const search = request.nextUrl.search
    const redirectPath = `${pathname}${search}`
    loginUrl.searchParams.set('redirect', redirectPath)
  }

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/admin/:path*'],
}
