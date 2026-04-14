export const FRONTEND_GATE_ERROR_SEARCH_PARAM = 'frontendGateError'
export const FRONTEND_GATE_RETURN_TO_SEARCH_PARAM = 'returnTo'

export type FrontendGateErrorCode = 'invalid' | 'unavailable'

export function isSafeFrontendReturnPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//')
}
