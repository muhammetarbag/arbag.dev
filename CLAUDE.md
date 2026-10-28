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
- There are no tests or linters. For a change, verify with `npm run build` and look at the page in `npm run dev`.

## Layout
- `src/pages/index.astro` — home page: AI, agent architectures, embedded software.
- `src/pages/lab.astro` — the `/lab` route: avionics simulators (PFD/HUD, ARINC 429, VTOL transition, QRH agent, ADS-B). Keep these off the home page.
- `src/components/*.astro` — one component per simulator, plus `CommandPalette.astro`.
- `src/layouts/Layout.astro` — shared shell, meta/OpenGraph tags.
- `src/styles/global.css` — Tailwind entry and global styles.
- `public/` — static files (`profile.*`, `cv.txt`).

## Things that will bite you
- Import CSS in the Astro frontmatter (`import '../styles/global.css'` in `Layout.astro`). A static `<link>` to the stylesheet failed to bundle (commit a87d9de).
- Don't add `routes` with `custom_domain` to `wrangler.jsonc` without checking: it broke the build once and was reverted (commit d6564f3). The domain and its DNS are managed on the Cloudflare/Squarespace side, not in this file.
- `wrangler.jsonc` uses `not_found_handling: single-page-application`, so unknown paths return the home page instead of a 404. New pages need their own file under `src/pages/`.
- Large single-file pages (`index.astro` ~750 lines, `lab.astro` ~450): make targeted edits, don't rewrite whole files.
- `.env` and `.env.production` are gitignored. Keep secrets out of the repo.
- Commit e3304b3 removed the personal e-mail from the footer. Don't re-add contact details unasked.

## Conventions
- Commit style in history: `feat:`, `fix:`, `refactor:`, `clean:` prefixes, lowercase, imperative.
- "The 9-System" list is sorted strictly by ATA chapter number (commit 0c0c36c).
