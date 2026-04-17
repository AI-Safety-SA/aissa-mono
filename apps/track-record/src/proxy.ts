import { authkitMiddleware } from '@workos-inc/authkit-nextjs'

export default authkitMiddleware({
  middlewareAuth: {
    enabled: true,
    unauthenticatedPaths: ['/login', '/callback', '/logout'],
  },
})

export const config = {
  matcher: ['/member/:path*', '/api/member/:path*', '/login', '/callback', '/logout'],
}
