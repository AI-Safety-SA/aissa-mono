import { NextResponse } from 'next/server'
import {
  FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS,
  FRONTEND_GATE_COOKIE_NAME,
  createFrontendGateCookieValue,
  delayFailedFrontendGateAttempt,
  getFrontendAudienceForPassword,
  getFrontendGateConfig,
  isSafeFrontendReturnPath,
} from '@/utilities/frontend-gate'
import {
  FRONTEND_GATE_ERROR_SEARCH_PARAM,
  type FrontendGateErrorCode,
} from '@/utilities/frontend-gate-shared'

function buildRedirectUrl(request: Request, returnTo: string): URL {
  return new URL(returnTo, request.url)
}

function setErrorCode(url: URL, code: FrontendGateErrorCode): URL {
  url.searchParams.set(FRONTEND_GATE_ERROR_SEARCH_PARAM, code)
  return url
}

export async function POST(request: Request) {
  const formData = await request.formData()
  const password = String(formData.get('password') ?? '')
  const returnToRaw = String(formData.get('returnTo') ?? '/')
  const returnTo = isSafeFrontendReturnPath(returnToRaw) ? returnToRaw : '/'
  const redirectUrl = buildRedirectUrl(request, returnTo)
  const config = getFrontendGateConfig()

  if (config.status !== 'enabled') {
    return NextResponse.redirect(setErrorCode(redirectUrl, 'unavailable'), { status: 303 })
  }

  const audience = getFrontendAudienceForPassword(password, config.passwords)

  if (!audience) {
    await delayFailedFrontendGateAttempt()
    return NextResponse.redirect(setErrorCode(redirectUrl, 'invalid'), { status: 303 })
  }

  const response = NextResponse.redirect(redirectUrl, { status: 303 })
  response.cookies.set(FRONTEND_GATE_COOKIE_NAME, createFrontendGateCookieValue(audience), {
    httpOnly: true,
    maxAge: FRONTEND_GATE_COOKIE_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return response
}
