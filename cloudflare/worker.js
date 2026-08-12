/**
 * Serves the admin dashboard at https://akashtherapies.com/adminportal
 * without touching the marketing site (hosted on Lovable) at the root.
 *
 * The Worker is bound to the route `akashtherapies.com/adminportal*`, so only
 * those requests reach it; everything else goes straight to the origin.
 *
 * ADMIN_ORIGIN is where the built app lives (Cloudflare Pages by default).
 * Paths map 1:1 because the build already nests everything under /adminportal/.
 */
const ADMIN_ORIGIN = 'https://akash-admin.pages.dev'
const PREFIX = '/adminportal'

export default {
  async fetch(request) {
    const url = new URL(request.url)

    if (url.pathname !== PREFIX && !url.pathname.startsWith(`${PREFIX}/`)) {
      return fetch(request)
    }

    if (url.pathname === PREFIX) {
      return Response.redirect(`${url.origin}${PREFIX}/`, 308)
    }

    const upstream = new Request(new URL(url.pathname + url.search, ADMIN_ORIGIN), request)
    upstream.headers.set('X-Forwarded-Host', url.host)
    upstream.headers.set('X-Forwarded-Proto', url.protocol.replace(':', ''))

    return fetch(upstream)
  },
}
