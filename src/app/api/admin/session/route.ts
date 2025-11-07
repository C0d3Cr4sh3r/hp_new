import { NextRequest, NextResponse } from 'next/server'
import {
  getAdminDigest,
  isAdminAuthorized,
  issueAdminSessionCookie,
  revokeAdminSessionCookie,
  validateAdminPassword,
} from '@/lib/admin/serverAuth'
import { ADMIN_AUTH_COOKIE } from '@/lib/admin/constants'

export async function POST(request: NextRequest) {
  try {
    const { password } = (await request.json()) as { password?: string }

    if (typeof password !== 'string' || password.length === 0) {
      return NextResponse.json({ error: 'Passwort wird benötigt.' }, { status: 400 })
    }

    if (!validateAdminPassword(password)) {
      return NextResponse.json({ error: 'Ungültige Zugangsdaten.' }, { status: 401 })
    }

    const cookie = issueAdminSessionCookie()
    if (!cookie) {
      return NextResponse.json({ error: 'Admin password not configured.' }, { status: 500 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(cookie)
    return response
  } catch (error) {
    console.error('Admin login failed:', error)
    return NextResponse.json({ error: 'Login fehlgeschlagen.' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const digest = getAdminDigest()
  if (!digest) {
    return NextResponse.json({ authenticated: false, error: 'Admin password not configured.' }, { status: 500 })
  }
  const cookie = request.cookies.get(ADMIN_AUTH_COOKIE)?.value
  return NextResponse.json({ authenticated: cookie === digest })
}

export async function DELETE(request: NextRequest) {
  const digest = getAdminDigest()

  if (!digest) {
    const response = NextResponse.json({ success: false, error: 'Admin password not configured.' }, { status: 500 })
    response.cookies.set(revokeAdminSessionCookie())
    return response
  }

  if (!isAdminAuthorized(request)) {
    const response = NextResponse.json({ success: true })
    response.cookies.set(revokeAdminSessionCookie())
    return response
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(revokeAdminSessionCookie())
  return response
}
