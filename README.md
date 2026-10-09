# ghislain.dev

Static pages for [ghislain.dev](https://ghislain.dev), hosted on mijn.host.

| Folder | Live URL |
|---|---|
| `home/` | https://ghislain.dev/, the homepage (uploaded to `public_html/`; other files there are left alone) |
| `playwright/` | https://ghislain.dev/playwright/ (the preparation page, via `.htaccess`), `assignments.html` and `slides.html` |
| `playwright/slides/` | The Slidev decks, deployed from [playwright-training-slides](https://github.com/Ghislain89/playwright-training-slides) (not in this repo) |

## Deployment

Every push to `main` that changes `home/` or `playwright/` uploads the changed files over SFTP to `public_html/` and `public_html/playwright/` (see `.github/workflows/deploy.yml`). You can also start it by hand under **Actions → Deploy → Run workflow**.

The upload itself is a reusable action, [`.github/actions/sftp-upload`](.github/actions/sftp-upload/action.yml), also used by playwright-training-slides. It only uploads files that changed since the last deploy (it keeps a `.deploy-manifest` with checksums on the server) and checks the server's SSH host key against a pinned fingerprint. It uses SFTP with the FTP account because FTPS opens a connection per file, and mijn.host's firewall blocks the runner after a few hundred of those. If mijn.host ever changes its host key, update `host-key-fingerprint` in the action (`ssh-keyscan h64.mijn.host | ssh-keygen -lf -`).

One-time setup: store the FTP password as a repository secret (in every repository that deploys).

```bash
gh secret set FTP_PASSWORD --repo Ghislain89/ghislain.dev
gh secret set FTP_PASSWORD --repo Ghislain89/playwright-training-slides
```

The deploy only writes to `public_html/playwright/`; the rest of the site is left alone. It never deletes files: remove renamed or deleted pages from the server by hand.
