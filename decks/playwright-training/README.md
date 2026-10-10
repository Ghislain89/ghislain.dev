# Playwright Training Slides

Slides for the Playwright trainings by Ghislain Gabriëlse ([DeTesters](https://detesters.nl/)), built with [Slidev](https://sli.dev).

| Deck | File | Live | Test object |
| --- | --- | --- | --- |
| Playwright UI workshop | [`ui.md`](ui.md) | [ghislain.dev/playwright/slides/ui/](https://ghislain.dev/playwright/slides/ui/) | [booker-platform](https://github.com/Ghislain89/booker-platform) web UI |
| API testing with Playwright | [`api.md`](api.md) | [ghislain.dev/playwright/slides/api/](https://ghislain.dev/playwright/slides/api/) | [booker-platform](https://github.com/Ghislain89/booker-platform) API |

Preparation, assignments and an overview of the decks: [ghislain.dev/playwright/](https://ghislain.dev/playwright/).

> Part of the [presentations](../../README.md) monorepo. These decks replace [PlaywrightWorkshopPresentation](https://github.com/Ghislain89/PlaywrightWorkshopPresentation) (reveal.js) and [playwright-api-testing](https://github.com/Ghislain89/playwright-api-testing).

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

Run these inside `decks/playwright-training`:

```bash
npm install
npm run dev:ui      # or: npm run dev:api
```

| Script | What it does |
| --- | --- |
| `npm run dev:ui` / `dev:api` | Start a deck with hot reload |
| `npm run build` | Build both decks to `dist/ui` and `dist/api`, for hosting at `/playwright/slides/` |
| `npm run export:ui` / `export:api` | Export a deck to PDF in `exports/` |

## Structure

```
├── ui.md          # UI workshop deck
├── api.md         # API testing deck
├── style.css      # Deck-wide style tweaks
├── public/        # Shared images, logos and speaker photos
├── theme/         # Shared Slidev theme (layouts, components, styles)
└── scripts/       # Build helpers (.htaccess for the web server)
```

Both decks use `theme: ./theme`. Logos on the title slide are set via `themeConfig.logoOne` / `logoTwo` in a deck's headmatter.

## Deployment

Every push to `main` that changes this folder builds both decks and uploads `dist/` to `ghislain.dev/playwright/slides/` on mijn.host ([workflow](../../.github/workflows/deploy.yml)). The upload uses the SFTP action from [ghislain.dev](https://github.com/Ghislain89/ghislain.dev) and only sends files that changed. It needs the FTP password as a repository secret:

```bash
gh secret set FTP_PASSWORD --repo Ghislain89/presentations
```

The decks use history routing, so the build adds an `.htaccess` that sends deep links such as `/ui/5` to the deck's `index.html`. The build also uses the `/playwright/slides/…` base path; to preview it locally, run `npm run dev:ui` instead of opening `dist/`.

## Licence

The training material is licensed under [CC BY-NC-SA 4.0](LICENSE): share and adapt it with credit, non-commercially, under the same licence.
The test object, [booker-platform](https://github.com/Ghislain89/booker-platform), is MIT licensed.
