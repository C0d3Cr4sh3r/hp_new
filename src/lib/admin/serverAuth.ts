import { createHash, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { ADMIN_AUTH_COOKIE, ADMIN_AUTH_COOKIE_MAX_AGE_SECONDS } from './constants'

let cachedSecret: string | null = null
let cachedDigest: string | null = null

const toBuffer = (value: string) => Buffer.from(value, 'utf8')

const computeDigest = (secret: string) => createHash('sha256').update(secret).digest('hex')

const getConfiguredSecret = () => {
  const secret = process.env.ADMIN_PASSWORD
  if (secret && secret.trim().length === 0) {
    return null
  }
  return secret ?? null
}

export const getAdminDigest = (): string | null => {
  const secret = getConfiguredSecret()
  if (!secret) {
    cachedSecret = null
    cachedDigest = null
    return null
  }
  if (cachedSecret === secret && cachedDigest) {
    return cachedDigest
  }
  cachedSecret = secret
  cachedDigest = computeDigest(secret)
  return cachedDigest
}

export const validateAdminPassword = (candidate: string): boolean => {
  const secret = getConfiguredSecret()
  if (!secret) {
    return false
  }
  const secretBuffer = toBuffer(secret)
  const candidateBuffer = toBuffer(candidate)

  if (secretBuffer.length !== candidateBuffer.length) {
    return false
  }

  try {
    return timingSafeEqual(secretBuffer, candidateBuffer)
  } catch (error) {
    console.error('Failed to validate admin password securely:', error)
    return false
  }
}

export const isAdminAuthorized = (request: NextRequest): boolean => {
  const digest = getAdminDigest()
  if (!digest) {
    return false
  }
  const cookieValue = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
  if (!cookieValue) {
    return false
  }

  const digestBuffer = toBuffer(digest)
  const cookieBuffer = toBuffer(cookieValue)

  if (digestBuffer.length !== cookieBuffer.length) {
    return false
  }

  try {
    return timingSafeEqual(digestBuffer, cookieBuffer)
  } catch (error) {
    console.error('Failed to compare admin auth digest securely:', error)
    return false
  }
}

export const ensureAdminAccess = (request: NextRequest) => {
  const secret = getConfiguredSecret()
  if (!secret) {
    return NextResponse.json({ error: 'Admin password not configured.' }, { status: 500 })
  }
  if (!isAdminAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export const issueAdminSessionCookie = () => {
  const digest = getAdminDigest()
  if (!digest) {
    return null
  }

  return {
    name: ADMIN_AUTH_COOKIE,
    value: digest,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: ADMIN_AUTH_COOKIE_MAX_AGE_SECONDS,
  }
}

export const revokeAdminSessionCookie = () => ({
  name: ADMIN_AUTH_COOKIE,
  value: '',
  path: '/',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  expires: new Date(0),
})
