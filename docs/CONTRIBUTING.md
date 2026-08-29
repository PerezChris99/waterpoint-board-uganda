# Contributing

## Branch workflow

```
feature/* | fix/* | chore/* | docs/*  →  perez  →  main
```

- `main` is the production/default branch. Never develop directly on `main`.
- `perez` is the integration branch. Never push directly to `perez` either — always go through a
  feature branch and pull request.
- Never force-push to `main` or `perez`.

## Starting a feature

```bash
git checkout perez
git pull origin perez
git checkout -b feature/your-feature-name
```

## Before opening a pull request

```bash
cd frontend
npm run lint
npm run typecheck
npm run test
npm run build
```

Commit using conventional commit messages (e.g. `feat:`, `fix:`, `chore:`, `docs:`, `security:`,
`perf:`, `release:`).

## Merging

- Merge a feature branch into `perez` only when all CI checks pass.
- Merge `perez` into `main` only when the full test suite, production build, and accessibility
  checks pass. If anything fails, fix the issue and rerun checks — do not merge with a known
  failure.
