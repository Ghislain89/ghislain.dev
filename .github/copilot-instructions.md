# Copilot instructions for ghislain.dev

This repository holds the whole of ghislain.dev: the static site (`home/`, `playwright/`), the Slidev decks (`decks/`) and their shared Tokyo Night theme (`theme/`). Everything must look like one site. See `README.md` for the layout, scripts and deployment.

## Style: Tokyo Night on a night street

- **Colours and fonts come only from `theme/styles/tokens.css`.** Use the `--tn-*` variables (`var(--tn-blue)`, `var(--tn-font-mono)`, …). Never add raw hex colours or a second `:root` palette. For translucency use `rgba()` of a token's colour or `color-mix(in srgb, var(--tn-x) 40%, transparent)`. Need a new colour? Add it to `tokens.css` so the decks and the site both get it.
- Site pages load the tokens from `/theme/tokens.css` (copied there by `scripts/build-site.mjs`): `<link rel="stylesheet" href="/theme/tokens.css">` in a page, or `@import url("../theme/tokens.css");` at the top of a stylesheet. Decks get them through the theme (`theme: ../../theme`).
- Fonts: Inter (`--tn-font-sans`) for text, JetBrains Mono (`--tn-font-mono`) for code, kickers, labels and navigation; load both from Google Fonts. Patrick Hand is only for the homepage speech bubble.
- Dark only: background `--tn-bg`/`--tn-bg-dark`, cards on `--tn-surface` with a `--tn-border` border and rounded corners, text `--tn-fg`, headings `--tn-fg-bright` or `--tn-blue`.
- Accents: links `--tn-cyan`, kickers (small uppercase mono label above a heading) `--tn-orange`, bold text `--tn-lamp`, emphasis and h3 `--tn-magenta`, inline code `--tn-teal`, bullets `--tn-orange`.
- Headings get the neon bar underneath: a short bar filled with `var(--tn-neon)` (orange → pink → blue, like the konbini sign).
- Page structure (follow `home/index.html` and `playwright/style.css`): a sticky, translucent, blurred top bar with the `ghislain<span>.</span>dev` brand linking to `/` and mono uppercase links; a hero/intro band on the street art (`/street.webp`); content sections; a footer on the skyline art (`/skyline.webp`).
- Text on the street art needs a dark, slightly transparent, blurred panel behind it to stay readable.
- Set `<meta name="theme-color" content="#1a1b26">` and the favicon `/favicon.png` on every page.
- Check new pages at desktop and mobile widths (`npm run site`, then http://localhost:4321) for overflow and contrast.

## Decks

- A new deck lives in `decks/<name>/` with its own `package.json`, `slides.md` with `theme: ../../theme`, and `public/`. Talk decks build with `--base /slides/<name>/` and run `scripts/write-htaccess.mjs`.
- Use the theme's layouts (see `theme/README.md`); add `class: dense` for packed slides instead of custom font sizes.
- When adding a deck, in the same change: add it to the matrices in `.github/workflows/decks-build.yml` and `decks-deploy.yml`, to the decks table in `README.md`, and to the talks section (`#talks`) of `home/index.html`.

## Writing

- English, plain and direct, short sentences. No marketing language.
- Commits end with `Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>`.
