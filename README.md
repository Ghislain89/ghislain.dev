# ghislain.dev

Everything on [ghislain.dev](https://ghislain.dev) in one repository: the site pages, the [Slidev](https://sli.dev) decks (trainings and talks) and the shared **Tokyo Night** theme they all use. Hosted on mijn.host.

| Folder | What | Live |
| --- | --- | --- |
| [`home/`](home/) | The homepage, favicon and the street/skyline art | https://ghislain.dev/ |
| [`playwright/`](playwright/) | Playwright training: preparation (default via `.htaccess`), assignments and slides overview | https://ghislain.dev/playwright/ |
| [`decks/`](decks/) | The Slidev decks, one folder (and `package.json`) per deck | see below |
| [`theme/`](theme/) | The Slidev theme and the shared design tokens, [`theme/styles/tokens.css`](theme/styles/tokens.css) | `/theme/tokens.css` |
| [`scripts/`](scripts/) | `build-site.mjs` (site), `decks.mjs` (run npm in decks), `write-htaccess.mjs` (deck deep links) | |

`home/slides/` only holds an `.htaccess`: https://ghislain.dev/slides/ redirects to the talks on the homepage.

## Decks

| Deck | Type | Folder | Live |
| --- | --- | --- | --- |
| Playwright UI workshop and API testing | Training | [`decks/playwright-training`](decks/playwright-training) | [ui](https://ghislain.dev/playwright/slides/ui/) · [api](https://ghislain.dev/playwright/slides/api/) |
| Agents, Skills & MCP Servers: a practical 101 | Talk, 2026 | [`decks/agents-skills-101`](decks/agents-skills-101) | [slides](https://ghislain.dev/slides/agents-skills-101/) |
| Introduction to Testcontainers | Talk, 2026 | [`decks/testcontainers`](decks/testcontainers) | [slides](https://ghislain.dev/slides/testcontainers/) |
| Keep your minions in line: behavioural testing for AI skills | Talk, 2026 | [`decks/keep-your-minions-in-line`](decks/keep-your-minions-in-line) | [slides](https://ghislain.dev/slides/keep-your-minions-in-line/) |

Every deck has its own `package.json` and assets, so decks can stay on different Slidev versions.

## Usage

Node 22 (or 20.19+).

```bash
npm run site                               # build the site to dist/site and preview it on http://localhost:4321
npm run setup                              # npm ci in every deck
npm run decks -- run dev testcontainers    # start one deck (any script, any deck)
npm run build                              # build every deck and the site
```

Or work inside a deck folder as usual: `cd decks/testcontainers && npm install && npm run dev`.

## One theme

All colours and fonts are defined once, in [`theme/styles/tokens.css`](theme/styles/tokens.css):

- the decks get it through the Slidev theme (`theme/styles/index.ts`);
- the site gets it as `/theme/tokens.css`: [`scripts/build-site.mjs`](scripts/build-site.mjs) copies it next to the pages. The homepage links it, `playwright/style.css` imports it.

Use the `--tn-*` variables, never raw colours. Change the palette there and both the site and every deck follow. See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for the style rules and [`theme/README.md`](theme/README.md) for the layouts and artwork.

## Adding a deck

1. Create `decks/<name>/` with its own `package.json` (scripts `dev`, `build`, `export`), `slides.md` (headmatter `theme: ../../theme`) and `public/`. Talk decks build with `--base /slides/<name>/` and run [`scripts/write-htaccess.mjs`](scripts/write-htaccess.mjs) so deep links work.
2. Add it to the matrices in [`decks-build.yml`](.github/workflows/decks-build.yml) and [`decks-deploy.yml`](.github/workflows/decks-deploy.yml), to the table above and to the talks on the homepage (`#talks` in [`home/index.html`](home/index.html)). One commit, one push.

To bring in an existing repo with its history: `git subtree add --prefix=decks/<name> <repo-url> <branch>`.

## CI and deployment

| Workflow | Runs when | Does |
| --- | --- | --- |
| [Site](.github/workflows/site.yml) | push to `main` changing `home/`, `playwright/`, `tokens.css` or the build script | builds `dist/site` and uploads it to `public_html/` |
| [Decks build](.github/workflows/decks-build.yml) | pull requests and pushes changing `decks/` or `theme/` | builds every deck |
| [Decks](.github/workflows/decks-deploy.yml) | push to `main` changing `decks/` or `theme/` | builds and uploads every deck: the training to `/playwright/slides/`, talks to `/slides/<deck>/` |

Both deploys share the `deploy` concurrency group, so only one talks to the server at a time, and both can be started by hand under **Actions → Run workflow**. After uploading they check the live URLs.

The upload is a local action, [`.github/actions/sftp-upload`](.github/actions/sftp-upload/action.yml). It only uploads files that changed since the last deploy (it keeps a `.deploy-manifest` with checksums on the server), uploads `index.html` and `.htaccess` last, and checks the server's SSH host key against a pinned fingerprint. It uses SFTP with the FTP account because FTPS opens a connection per file, and mijn.host's firewall blocks the runner after a few hundred of those. If mijn.host ever changes its host key, update `host-key-fingerprint` in the action (`ssh-keyscan h64.mijn.host | ssh-keygen -lf -`).

It never deletes files: remove renamed or deleted pages from the server by hand. Other files in `public_html/` are left alone.

One-time setup: store the FTP password as a repository secret.

```bash
gh secret set FTP_PASSWORD --repo Ghislain89/ghislain.dev
```

## Licences

- `theme/`: MIT.
- `decks/playwright-training`: CC BY-NC-SA 4.0 for the material, see its [LICENSE](decks/playwright-training/LICENSE).
- Everything else (site pages, other decks): all rights reserved unless stated otherwise.

## History

The decks and theme were developed in [`Ghislain89/presentations`](https://github.com/Ghislain89/presentations) (formerly `playwright-training-slides`, now archived) and merged into this repository with their full history. That repo replaced these archived (private) repos:
`Agents-skills-101-presentation`,
`testcontainers-presentation`,
`PlaywrightWorkshopPresentation` and
`playwright-api-testing`.
The agents and testcontainers decks were imported with `git subtree`, so their history is kept. `keep-your-minions-in-line` came from the private `testing-ai-skills-presentation` repo as a snapshot, without its history.
