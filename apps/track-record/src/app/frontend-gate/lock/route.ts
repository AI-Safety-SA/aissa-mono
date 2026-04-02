import { NextResponse } from 'next/server'
import { FRONTEND_GATE_COOKIE_NAME, isSafeFrontendReturnPath } from '@/utilities/frontend-gate'

function buildRedirectUrl(request: Request, returnTo: string): URL {
  return new URL(returnTo, request.url)
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const returnToRaw = String(formData.get('returnTo') ?? '/')
  const returnTo = isSafeFrontendReturnPath(returnToRaw) ? returnToRaw : '/'
  const redirectUrl = buildRedirectUrl(request, returnTo)
  const response = NextResponse.redirect(redirectUrl, { status: 303 })

  response.cookies.set(FRONTEND_GATE_COOKIE_NAME, '', {
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}
