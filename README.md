# Playwright Training Slides

Slides for the Playwright trainings by Ghislain Gabriëlse ([DeTesters](https://detesters.nl/)), built with [Slidev](https://sli.dev).

| Deck | File | Test object |
| --- | --- | --- |
| Playwright UI workshop | [`ui.md`](ui.md) | [booker-platform](https://github.com/Ghislain89/booker-platform) web UI (in development, see its [frontend spec](https://github.com/Ghislain89/booker-platform/blob/main/docs/frontend-spec.md)) |
| API testing with Playwright | [`api.md`](api.md) | [booker-platform](https://github.com/Ghislain89/booker-platform) |

> This repository replaces [PlaywrightWorkshopPresentation](https://github.com/Ghislain89/PlaywrightWorkshopPresentation) (reveal.js) and [playwright-api-testing](https://github.com/Ghislain89/playwright-api-testing).

Both decks are up to date with **Playwright 1.64**. New features are marked with the version that introduced them, for example `(1.63)`.

## Deck outline

**UI workshop (`ui.md`)**

| # | Module | Assignment |
| --- | --- | --- |
| 1 | Why Playwright | — |
| 2 | Your first test (anatomy, config, running, codegen, linting) | — |
| 3 | Locators, actions & assertions | 1A |
| 4 | Debug & report (UI mode, traces, HTML report, parallelism, flaky tests) | 1B |
| 5 | Page objects & fixtures | 2 |
| 6 | Authentication (setup projects, storage state) | 3 |
| 7 | Network & API (wait, mock, modify, seed via API) | 4 |
| 8 | Time, contexts & environment (clock, contexts, emulation, dialogs, frames) | 5 |
| 9 | Visual & accessibility | 6, 7 |
| 10 | Continuous integration | 8 |
| 11 | AI-assisted testing (copy prompt, MCP, test agents) | 9 (optional) |
| 12 | Wrap-up: flaky-test clinic | 10 |

The UI assignment numbers match §8 of the booker-platform frontend spec.

**API testing (`api.md`)**

| # | Module | Assignment |
| --- | --- | --- |
| 1 | What & why | — |
| 2 | Setup (booker-platform, config, `request` fixture, `test.step`) | — |
| 3 | First requests (GET, POST, headers, assertions) | 1 |
| 4 | Resources & roles (params, PUT/DELETE, 401 vs 403) | 2 |
| 5 | Scaling up (factories, test-support API, hooks, fixtures, shared auth, schema validation, typed responses) | Bonus |
| 6 | Extras (request options, traces, hybrid tests) | — |

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

## Licence

The training material is licensed under [CC BY-NC-SA 4.0](LICENSE): share and adapt it with credit, non-commercially, under the same licence.
The test object, [booker-platform](https://github.com/Ghislain89/booker-platform), is MIT licensed.
