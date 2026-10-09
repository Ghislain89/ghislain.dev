# ghislain.dev

Static pages for [ghislain.dev](https://ghislain.dev), hosted on mijn.host.

| Folder | Live URL |
|---|---|
| `playwright/` | https://ghislain.dev/playwright/ (the preparation page, via `.htaccess`), `assignments.html` and `slides.html` |
| `playwright/slides/` | The Slidev decks, deployed from [playwright-training-slides](https://github.com/Ghislain89/playwright-training-slides) (not in this repo) |

## Deployment

Every push to `main` that changes `playwright/` uploads the changed files in that folder over FTPS to `public_html/playwright/` (see `.github/workflows/deploy.yml`). You can also start it by hand under **Actions → Deploy → Run workflow**.

The upload itself is a reusable action, [`.github/actions/ftps-upload`](.github/actions/ftps-upload/action.yml), also used by playwright-training-slides. It only uploads files that changed since the last deploy (it keeps a `.deploy-manifest` with checksums on the server) and works around two quirks of the mijn.host FTP server: it requires TLS session reuse (so it uses curl instead of a Node FTP library) and it doesn't send its intermediate certificates (so the action downloads them).

One-time setup: store the FTP password as a repository secret (in every repository that deploys).

```bash
gh secret set FTP_PASSWORD --repo Ghislain89/ghislain.dev
gh secret set FTP_PASSWORD --repo Ghislain89/playwright-training-slides
```

The deploy only writes to `public_html/playwright/`; the rest of the site is left alone. It never deletes files: remove renamed or deleted pages from the server by hand.
