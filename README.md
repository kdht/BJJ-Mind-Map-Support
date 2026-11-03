# BJJ Mind Map — Support &amp; Roadmap

Public-facing support site for [BJJ Mind Map](https://bjjmindmap.com), hosted at **vnext.bjjmindmap.com**.

This repo holds only technical/public-facing artifacts for BJJ Mind Map's development:
- **Issues** — feature requests and bug reports, submitted either directly on GitHub or via the support site's form (which creates an issue here through an Azure Function, no GitHub account required).
- **Labels** `roadmap:planned` / `roadmap:in-progress` / `roadmap:shipped` drive the live Roadmap section on the site.
- **Wiki** — how-to and troubleshooting articles, linked from the site's Support section.

No application code or user data lives in this repo — see [ITOpsReborn/BJJMindMap](https://github.com/ITOpsReborn/BJJMindMap) for the actual app.

## Site structure
- `index.html` / `styles.css` / `app.js` — the static site (no build step).
- `api/submit-request` — an Azure Function that creates a GitHub issue from the site's form submission, using a repo-scoped PAT stored as the `GITHUB_ISSUES_TOKEN` app setting (never exposed to the browser).
- `staticwebapp.config.json` — Azure Static Web Apps routing/config.

Deploys automatically on push to `main` via GitHub Actions → Azure Static Web Apps.
