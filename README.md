# Webbsida Hotel Bokning — Frontend

Quick notes to run checks locally and in CI.

Run a simple static server to view the site:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Install dev tools and run checks (requires Node.js >= 16/18):

```bash
npm ci
npm run check-syntax    # runs `node --check JS/*.js`
npm run lint            # runs ESLint over JS files
npm run format:check    # runs Prettier --check
```

If ESLint reports issues you can fix them manually or run Prettier to auto-format:

```bash
npm run format:fix
```

CI: the repo includes a workflow `.github/workflows/ci.yml` that runs these checks on PRs.
