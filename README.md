# ghislain.dev

Static pages for [ghislain.dev](https://ghislain.dev), hosted on mijn.host.

| Folder | Live URL |
|---|---|
| `playwright/` | https://ghislain.dev/playwright/preparation.html and https://ghislain.dev/playwright/assignments.html |

## Deployment

Every push to `main` that changes `playwright/` uploads all files in that folder over FTPS (with curl) to `public_html/playwright/` (see `.github/workflows/deploy.yml`). You can also start it by hand under **Actions → Deploy → Run workflow**.

One-time setup: store the FTP password as a repository secret.

```bash
gh secret set FTP_PASSWORD --repo Ghislain89/ghislain.dev
```

The deploy only writes to `public_html/playwright/`; the rest of the site is left alone. It never deletes files: remove renamed or deleted pages from the server by hand.
