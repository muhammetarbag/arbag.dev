# arbag.dev

[arbag.dev](https://arbag.dev) kişisel portfolyo sitesi: yapay zeka ajanları, Linux, gömülü yazılım ve aviyonik üzerine. Site metni Türkçedir.

## Yığın

Astro (statik çıktı) + Tailwind v4 (`@tailwindcss/vite`). Cloudflare Workers üzerinde statik varlık olarak yayınlanır (`wrangler.jsonc`, `assets.directory: ./dist`).

## Komutlar

```sh
npm install
npm run dev       # yerel geliştirme sunucusu
npm run build     # dist/ üretir
npm run preview   # derlenmiş dist/ çıktısını sunar
npm test          # Mode-S çözücü testleri (Node yerleşik test koşucusu)
```

Yayına alma: `npm run build && npx wrangler deploy`.

## Yapı

- `src/pages/index.astro`: ana sayfa
- `src/pages/lab.astro`: `/lab` rotası, aviyonik simülatörler (PFD/HUD, ARINC 429, VTOL geçişi, QRH ajanı, ADS-B)
- `src/components/`: her simülatör için bir bileşen
- `src/lib/modes.ts`: Mode-S / ADS-B çerçeve çözme ve CRC-24 (DOM'dan bağımsız, testlerle kapsanır)
- `public/_redirects`: `/l/<repo>/` adreslerini GitHub Pages dağıtımlarına yönlendirir
- `public/_headers`: güvenlik başlıkları ve CSP

## Lisans

[MIT](LICENSE)
