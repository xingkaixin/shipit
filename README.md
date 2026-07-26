# Shipit

Shipit turns a product logo, name, version, and release details into a
five-second celebration film. Preview rendering and MP4 export happen entirely
in the browser.

Production: [shipit.xingkaixin.me](https://shipit.xingkaixin.me/)

## Features

- Five motion templates with light and dark palettes
- Landscape and portrait compositions
- 1080p and 4K output at 30 or 60 FPS
- Optional logo framing, custom accent colors, and title fonts
- English and Simplified Chinese interfaces
- Local-only logo processing and video encoding

## Requirements

- Node.js 24
- pnpm 11.17.0
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
- Logos may be PNG, JPEG, or WebP files up to 10 MB, 8192 pixels per side, and
  16 million total pixels.
- Uploaded assets, previews, and encoded videos remain in the current browser.

## Localization

Shipit supports English and Simplified Chinese. It uses the saved language
preference when available, then falls back to the browser language. Interface
messages are defined in `src/i18n/messages.ts`.

## Cloudflare Pages

The application is a static Vite site and can be deployed directly to
Cloudflare Pages with the following settings:

| Setting                | Value        |
| ---------------------- | ------------ |
| Framework preset       | React (Vite) |
| Build command          | `pnpm build` |
| Build output directory | `dist`       |
| Node.js version        | `24.18.0`    |
| pnpm version           | `11.17.0`    |

Set `NODE_VERSION` and `PNPM_VERSION` in the Pages build environment to keep
Cloudflare aligned with local development and CI.

For a direct production deployment from an authenticated local environment:

```bash
pnpm deploy:cf
```

The command creates a production build and uploads `dist` to the `shipit`
Cloudflare Pages project. Wrangler uses `wrangler.jsonc` as the source of truth
for the Pages configuration.
