# Playwright Training Slides

Slides for the Playwright trainings by Ghislain Gabriëlse ([DeTesters](https://detesters.nl/)), built with [Slidev](https://sli.dev).

| Deck | File | Test object |
| --- | --- | --- |
| Playwright UI workshop | [`ui.md`](ui.md) | [PlaywrightWorkshop](https://github.com/Ghislain89/PlaywrightWorkshop) (archived; the UI assignments move to [booker-platform](https://github.com/Ghislain89/booker-platform) once its UI is ready) |
| API testing with Playwright | [`api.md`](api.md) | [booker-platform](https://github.com/Ghislain89/booker-platform) |

> This repository replaces [PlaywrightWorkshopPresentation](https://github.com/Ghislain89/PlaywrightWorkshopPresentation) (reveal.js) and [playwright-api-testing](https://github.com/Ghislain89/playwright-api-testing).

## Usage

```bash
npm install
npm run dev:ui      # or: npm run dev:api
```

| Script | What it does |
| --- | --- |
| `npm run dev:ui` / `dev:api` | Start a deck with hot reload |
| `npm run build` | Build both decks to `dist/ui` and `dist/api` |
| `npm run export:ui` / `export:api` | Export a deck to PDF in `exports/` |

## Structure

```
├── ui.md          # UI workshop deck
├── api.md         # API testing deck
├── style.css      # Deck-wide style tweaks
├── public/        # Shared images, logos and speaker photos
└── theme/         # Shared Slidev theme (layouts, components, styles)
```

Both decks use `theme: ./theme`. Logos on the title slide are set via `themeConfig.logoOne` / `logoTwo` in a deck's headmatter.
