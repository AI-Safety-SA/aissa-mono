import { NextRequest, NextResponse } from 'next/server'
import {
  FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS,
  FRONTEND_GATE_COOKIE_NAME,
  createFrontendGateCookieValue,
  getFrontendGateConfig,
} from '@/utilities/frontend-gate'
import {
  FRONTEND_GATE_RETURN_TO_SEARCH_PARAM,
  isSafeFrontendReturnPath,
} from '@/utilities/frontend-gate-shared'

export async function GET(request: NextRequest) {
  const config = getFrontendGateConfig()

  if (config.status !== 'enabled') {
    return NextResponse.redirect(new URL('/', request.url), { status: 307 })
  }

  const returnToRaw = request.nextUrl.searchParams.get(FRONTEND_GATE_RETURN_TO_SEARCH_PARAM) ?? '/'
  const returnTo = isSafeFrontendReturnPath(returnToRaw) ? returnToRaw : '/'
  const response = NextResponse.redirect(new URL(returnTo, request.url), { status: 307 })

  response.cookies.set(FRONTEND_GATE_COOKIE_NAME, createFrontendGateCookieValue('community'), {
    httpOnly: true,
    maxAge: FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}
