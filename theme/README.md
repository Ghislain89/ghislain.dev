# Tokyo Night theme

The shared Slidev theme for every deck in this repository. Its colours and fonts come from [`styles/tokens.css`](styles/tokens.css), which the site pages use too. It uses the [Tokyo Night](https://github.com/tokyo-night/tokyo-night-vscode-theme) colours, including the `tokyo-night` Shiki theme for code, on an original vector night street drawn in one-point perspective: apartment blocks with lit windows and balconies, a glowing konbini, neon signs, utility poles with tangled wires, parked cars, a lit cloud over the vanishing point, a wet road with reflections and a crosswalk.

Use it from a deck's headmatter:

```yaml
---
theme: ../../theme
themeConfig:
  logoOne: /logo-white-detesters-only.svg   # optional, bottom left of the first slide
  logoTwo: /techchamps-white.png            # optional, bottom right of the first slide
---
```

## Layouts

| Layout | Use |
| --- | --- |
| `intro`, `cover` | Title slide: the street scene with a sign panel |
| `section`, `new-section` | Section divider on the dimmed street scene |
| `fact`, `statement` | One big number or sentence on the street scene |
| `default` | Content on the night-sky backdrop with the skyline at the bottom |
| `two-cols`, `two-thirds` | Two columns; put `::right::` before the right column |
| `presenter` | Speaker intro; `presenterImage: ghislain.jpg` |
| `text-image`, `text-window` | Text next to an image (`media`) or a console window (`::window::`) |
| `image-left`, `image-right` | Text next to a background image (`image`) |
| `quote` | A large quote |

Slidev's built-in `center`, `full` and `end` layouts work as usual.

For packed slides, add `class: dense` to the slide's frontmatter: smaller text, tighter lines and smaller code. Wrap a table in `<div class="compact-table">` to shrink only the table.

## Colours

Defined once as CSS variables in [`styles/tokens.css`](styles/tokens.css), shared with the site (served as `/theme/tokens.css`); [`styles/tokyo-night.css`](styles/tokyo-night.css) applies them to the slides: `--tn-blue` for titles, `--tn-lamp` for bold text, `--tn-magenta` for emphasis, `--tn-cyan` for links, `--tn-teal` for inline code and `--tn-orange` for bullets. The neon bar under titles (`--tn-neon`) mirrors the konbini sign.

Code blocks support these languages: see `langs` in [`setup/shiki.ts`](setup/shiki.ts). Add a language there before using it. Mermaid diagrams are themed in [`setup/mermaid.ts`](setup/mermaid.ts).

## Artwork

`assets/street.svg` and `assets/backdrop.svg` are generated. To change them, edit [`scripts/scene.mjs`](scripts/scene.mjs) and run:

```bash
node theme/scripts/scene.mjs
```

The theme imports nothing from npm, so it works from every deck's own `node_modules` and Slidev version (51 and 52).

## Licence

MIT, © Ghislain Gabriëlse.
