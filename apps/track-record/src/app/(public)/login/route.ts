import { getSignInUrl } from '@workos-inc/authkit-nextjs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const returnTo = url.searchParams.get('returnTo') ?? '/member'
  const signInUrl = await getSignInUrl({ returnTo })

  return Response.redirect(signInUrl, 302)
}
