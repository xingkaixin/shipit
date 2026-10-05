# Shipit

Shipit turns a product logo, optional screenshot, name, version, and release
details into a five-second celebration film. Preview rendering and MP4 export
happen entirely in the browser.

Production: [shipit.xingkaixin.me](https://shipit.xingkaixin.me/)

## Features

- Ten backgrounds and sixteen color themes, combined freely
- Live background previews drawn by the export renderer
- Landscape and portrait compositions
- 1080p and 4K output at 30 or 60 FPS
- Optional logo framing, custom accent colors, and title fonts
- Product screenshots with frameless, Chrome, MacBook, or iPhone presentation
- Adjustable screenshot size, side tilt, shadow, and timed shimmer effects
- Light, dark, or system interface, in English, Simplified Chinese, or Japanese
- Save named projects, including uploaded images, in browser storage
- Local-only logo processing and video encoding

## Requirements

- Node.js 24
- pnpm 12.3.4
- A browser with H.264 WebCodecs encoding support for MP4 export

## Development

```bash
corepack enable
pnpm install
pnpm dev
```

## Verification

```bash
pnpm check
pnpm build
```

`pnpm check` runs formatting, linting, type checking, and the test suite. The
production bundle is written to `dist`.

## Browser and Export Behavior

- MP4 export depends on the browser's H.264/WebCodecs encoder. Shipit checks
  support for the selected output configuration at runtime.
- 4K export prefers an origin-private temporary file so the complete video does
  not remain in memory. Browsers without that capability fall back to an
  in-memory export.
- 4K at 60 FPS processes roughly eight times as many pixels as 1080p at 30 FPS.
  Use 1080p on mobile or memory-constrained devices.
- Logos may be PNG, JPEG, WebP, or SVG files up to 10 MB, 8192 pixels per side,
  and 16 million total pixels.
- Product screenshots accept the same formats and limits. They are optional,
  and removing one restores the centered composition.
- Uploaded assets, previews, and encoded videos remain in the current browser.
- Saved projects use IndexedDB on this browser and remain available after a new
  app version is deployed. They are not synced between browsers or devices.

## Localization

Shipit serves English at `/`, Simplified Chinese at `/zh-cn/`, and Japanese at
`/ja/`. The URL determines the language, so search engines and shared links see
the same content. The editor language switch updates the URL without reloading
or losing the current draft. Interface messages are defined in
`src/i18n/messages.ts`.

The interface appearance uses the saved choice, and `system` tracks
`prefers-color-scheme`. The appearance preference persists in `localStorage`.

## Product guide

The homepage includes a static product guide in `index.html`, with a real
five-second export and poster in `public/examples/`. The video loads on demand.
The guide remains readable without JavaScript; the editor requires JavaScript.

Guide text uses `data-guide-message` keys from `src/i18n/messages.ts` so it follows
the editor language. After Vite builds, `scripts/build-locales.ts` generates all
three static pages from the same HTML template and messages. Keep the English
template and messages in sync for development; production text comes from the
messages. Canonical URLs and reciprocal hreflang links identify each version.
When product capabilities change, update the guide, metadata, and `public/llms.txt`.
Update sitemap `lastmod` only for substantive page changes, not every deployment.
Workers serves the top-level `404.html` for unknown addresses with a real 404 status.

## Analytics

Umami tracks only `shipit.xingkaixin.me`; local development and Worker previews
are excluded. Hash navigation does not create separate page paths. Events:

| Event              | Meaning                                              |
| ------------------ | ---------------------------------------------------- |
| `guide-open`       | Opens the product guide from the editor              |
| `guide-start`      | Returns to the editor from the guide                 |
| `export-start`     | Starts an export after validation                    |
| `export-complete`  | Encodes the MP4 and triggers its browser download    |
| `export-failed`    | Export fails, with a fixed error code                |
| `export-cancelled` | Export is cancelled, including configuration changes |

Export events include only aspect ratio, resolution, frame rate, and language;
they never include product text, filenames, images, or generated videos. Tracker
failures do not block exports. The Umami goal **MP4 export completed** matches
`export-complete`. Filter it by search channel/referrer to measure useful traffic.
UTM parameters are captured by Umami automatically for tagged campaign links.

## Themes and templates

A film is composed from two independent registries:

| Registry                           | Controls                                      |
| ---------------------------------- | --------------------------------------------- |
| `src/video/background-registry.ts` | Background pattern, layout, and confetti seed |
| `src/video/palette-registry.ts`    | Background, foreground, surface, and accents  |

Any color theme renders with any background. To add a theme, append an
entry to `PALETTE_REGISTRY` and a matching `palette.<id>` message in all
locales; the pickers, the accent swatches, and the confetti pick it up
automatically. Backgrounds work the same way: add a `BackgroundPattern`, draw
it in `src/video/background-patterns.ts`, and register it.

## Cloudflare Workers

The static Vite site is hosted by the `shipit` Worker at
`shipit.xingkaixin.me`. `cloudflare.config.ts` defines the Worker name, custom
domain, and static asset routing. Unknown paths return `404.html`; the three
language pages and `public/_headers` are preserved.

Use the system `cf` CLI installed globally through mise and already authenticated
with Cloudflare. Neither `cf` nor Wrangler is a project dependency. This deployment
flow is verified with `cf` 1.0.0-beta.12.

```bash
pnpm deploy:cf
```

The command builds the site, packages `dist` into the CLI's v0 Build Output
under `.cloudflare/output/v0`, and runs `cf deploy --prebuilt`. The small
`scripts/build-cloudflare.ts` packaging step avoids installing a Cloudflare build
plugin for this static site. The output format is currently beta; validate it
with `cf deploy --prebuilt --dry-run` after upgrading the global CLI.

Cloudflare Web Analytics is disabled. Umami is the only site analytics tracker.
