import { writeFileSync } from 'node:fs'

// Cloudflare Pages reads `_redirects` from the root of the published directory.
// The SPA fallback keeps deep links like /adminportal/sessions/123 on index.html.
writeFileSync('dist/_redirects', '/adminportal/*  /adminportal/index.html  200\n')
