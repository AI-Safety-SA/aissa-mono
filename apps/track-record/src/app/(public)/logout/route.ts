import { signOut } from '@workos-inc/authkit-nextjs'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const returnTo = url.searchParams.get('returnTo') ?? '/'

  await signOut({ returnTo })
}
