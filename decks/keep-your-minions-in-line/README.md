# Keep your minions in line: behavioural testing for AI skills

A talk about testing AI skills and agents: how do you prove they actually follow orders? Three trust tiers, from deterministic tool-call checks to an LLM judge and baseline comparison, plus variance analysis across runs. Built with [Slidev](https://sli.dev) on the repository's shared [Tokyo Night theme](../../theme).

Live: [ghislain.dev/slides/keep-your-minions-in-line/](https://ghislain.dev/slides/keep-your-minions-in-line/). Every push to `main` that changes this deck or the shared theme redeploys it.

```bash
npm install
npm run dev      # http://localhost:3030
npm run build    # static site in dist/, for hosting at /slides/keep-your-minions-in-line/
npm run export   # PDF, needs playwright-chromium
```

Speaker notes are in `slides.md` under each slide.
