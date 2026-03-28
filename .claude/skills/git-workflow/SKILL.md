---
name: git-workflow
description: Standard git workflow for committing and branching ManthIQ changes
---

# Git Workflow Skill

Use this workflow for all commits in this repo.

## Branch naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<short-name>` | `feat/lstm-predictions` |
| Bug fix | `fix/<short-name>` | `fix/chart-tooltip-nan` |
| Docs | `docs/<short-name>` | `docs/api-reference` |
| Chore | `chore/<short-name>` | `chore/update-deps` |

## Commit message format

```
<type>(<scope>): <short description>

<optional body — why, not what>
```

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`
Scopes: `backend`, `frontend`, `model`, `config`, `docs`

Examples:
```
feat(backend): add /api/indicators endpoint
fix(frontend): resolve NaN in tooltip on missing volume
docs(model): document XGBoost feature engineering decisions
```

## Standard flow

```bash
# 1. Branch from main
git checkout -b feat/my-feature

# 2. Make changes, then stage specific files (never git add -A)
git add src/backend/main.py

# 3. Commit
git commit -m "feat(backend): add rolling volatility endpoint"

# 4. Push and open PR
git push -u origin feat/my-feature
gh pr create --title "feat(backend): add rolling volatility endpoint"
```

## What NOT to commit

- `src/frontend/node_modules/` — in .gitignore
- `src/frontend/dist/` — in .gitignore
- `src/backend/__pycache__/` — in .gitignore
- `.env` files
- `CLAUDE.md` (internal briefing, in .gitignore)
- Parquet data files (local paths only)
