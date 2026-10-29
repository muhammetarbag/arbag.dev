# arbag.dev

Personal portfolio of Muhammet Hüseyin Arbağ (aviation electrical/electronics student; AI agents, Linux, embedded). Live at https://arbag.dev. Site copy is in Turkish.

## Stack
Astro 5 (static output) + Tailwind v4 via `@tailwindcss/vite`, hosted on Cloudflare Workers as static assets (`wrangler.jsonc`, `assets.directory: ./dist`).
The domain is registered at Squarespace, which points its nameservers to Cloudflare; DNS and hosting are both managed in Cloudflare.

## Commands
- `npm install` (use npm; `pnpm`/`bun` aren't installed)
- `npm run dev` — local dev server
- `npm run build` — outputs `dist/`; must pass before any deploy
- `npm run preview` — serve the built `dist/`
- Deploy: `npm run build && npx wrangler deploy` (uses the local `wrangler` devDependency). Deploying changes the live site, so only run it when asked.
- `npm test` runs the Mode-S decoder tests (`src/lib/modes.test.ts`, Node's built-in runner, needs Node with TypeScript stripping). There are no other tests or linters. For a change, verify with `npm run build` and look at the page in `npm run dev`.
- To check headers, 404 and CSP locally: `npm run build && npx wrangler dev --port 8788`. Rebuilding while it runs can leave it serving 404s; restart it.

## Layout
- `src/pages/index.astro` — home page: AI, agent architectures, embedded software.
- `src/pages/lab.astro` — the `/lab` route: avionics simulators (PFD/HUD, ARINC 429, VTOL transition, QRH agent, ADS-B). Keep these off the home page.
- `src/components/*.astro` — one component per simulator, plus `CommandPalette.astro`.
- `src/lib/modes.ts` — Mode-S / ADS-B frame decoding and CRC-24, used by `AdsbDissector.astro`. Keep it pure (no DOM) so the tests can import it.
- `src/layouts/Layout.astro` — shared shell, meta/OpenGraph tags.
- `src/styles/global.css` — Tailwind entry and global styles.
- `public/` — static files (`profile.webp`, `cv.txt`, `og.png`, `robots.txt`, `sitemap.xml`) and `_headers` (security headers, CSP, cache rules). The CSP allows only same-origin assets plus Cloudflare Web Analytics; adding a third-party script, font or image host needs a matching change there.

## Things that will bite you
- Import CSS in the Astro frontmatter (`import '../styles/global.css'` in `Layout.astro`). A static `<link>` to the stylesheet failed to bundle (commit a87d9de).
- Don't add `routes` with `custom_domain` to `wrangler.jsonc` without checking: it broke the build once and was reverted (commit d6564f3). The domain and its DNS are managed on the Cloudflare/Squarespace side, not in this file.
- `wrangler.jsonc` uses `not_found_handling: 404-page`, so unknown paths return `dist/404.html` (from `src/pages/404.astro`) with status 404. New pages need their own file under `src/pages/`, and should be added to `public/sitemap.xml`.
- Site claims must be backed by something public. Don't reintroduce unmeasured metrics, "DO-178C compliant" wording, or projects without a repo or demo; lab copy should match the lab READMEs ("simplified educational model").
- Large single-file pages (`index.astro` ~750 lines, `lab.astro` ~450): make targeted edits, don't rewrite whole files.
- `.env` and `.env.production` are gitignored. Keep secrets out of the repo.
- Commit e3304b3 removed the personal e-mail from the footer. Don't re-add contact details unasked.

## Conventions
- Commit style in history: `feat:`, `fix:`, `refactor:`, `clean:` prefixes, lowercase, imperative.
- "The 9-System" list is sorted strictly by ATA chapter number (commit 0c0c36c).
