# Presentations

All decks by Ghislain Gabriëlse ([deTesters](https://detesters.nl/)), built with [Slidev](https://sli.dev). One folder per deck under [`decks/`](decks/); every deck has its own `package.json`, theme and assets, so they can stay on different Slidev versions.

| Deck | Type | Folder | Live |
| --- | --- | --- | --- |
| Playwright UI workshop and API testing | Training | [`decks/playwright-training`](decks/playwright-training) | [ui](https://ghislain.dev/playwright/slides/ui/) · [api](https://ghislain.dev/playwright/slides/api/) |
| Agents, Skills & MCP Servers: a practical 101 | Talk, 2026 | [`decks/agents-skills-101`](decks/agents-skills-101) | — |
| Introduction to Testcontainers | Talk, 2026 | [`decks/testcontainers`](decks/testcontainers) | — |

More about the talks: [ghislain.dev](https://ghislain.dev/#talks).

## Usage

Node 22 (or 20.19+).

```bash
npm run setup                      # npm ci in every deck
npm run decks -- run dev testcontainers   # start one deck (any script, any deck)
npm run build                      # build every deck
```

Or work inside a deck folder as usual: `cd decks/testcontainers && npm install && npm run dev`.

## Adding a deck

1. Create `decks/<name>/` with its own `package.json` (scripts `dev`, `build`, `export`), `slides.md`, `theme/` and `public/`.
2. Add it to the table above and to the matrix in [`.github/workflows/build.yml`](.github/workflows/build.yml).

To bring in an existing repo with its history: `git subtree add --prefix=decks/<name> <repo-url> <branch>`.

## CI and deploy

- **Build** ([`build.yml`](.github/workflows/build.yml)): builds every deck on pull requests and pushes to `main`.
- **Deploy** ([`deploy.yml`](.github/workflows/deploy.yml)): publishes `decks/playwright-training` to `ghislain.dev/playwright/slides/` over SFTP when that folder changes. Needs the `FTP_PASSWORD` secret.

## Licences

- `decks/playwright-training`: CC BY-NC-SA 4.0 for the material, see its [LICENSE](decks/playwright-training/LICENSE).
- Other decks: all rights reserved unless the deck says otherwise.

## History

This repository was `playwright-training-slides`; GitHub redirects the old URL. It replaces these archived repos:
[Agents-skills-101-presentation](https://github.com/Ghislain89/Agents-skills-101-presentation),
[testcontainers-presentation](https://github.com/Ghislain89/testcontainers-presentation),
[PlaywrightWorkshopPresentation](https://github.com/Ghislain89/PlaywrightWorkshopPresentation) and
[playwright-api-testing](https://github.com/Ghislain89/playwright-api-testing).
The talk decks were imported with `git subtree`, so their history is kept.
