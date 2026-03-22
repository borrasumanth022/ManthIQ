# ADR 002 — Project Structure Reorganisation

**Date:** 2026-03
**Status:** Accepted

## Context

The original structure had `backend/` and `frontend/` at the project root. As the project grows (adding `config/`, `docs/`, Claude Code tooling), a flat root became cluttered and harder to navigate.

## Decision

Move all source code under `src/`:

```
src/backend/   ← was backend/
src/frontend/  ← was frontend/
```

Add top-level support directories:

```
.claude/       ← Claude Code settings, skills, hooks
config/        ← app-level settings and path constants
docs/          ← architecture docs, ADRs, runbooks
```

## Rationale

- `src/` convention is widely understood; separates source from tooling/config
- `.claude/` keeps AI tooling self-contained and ignorable by non-Claude workflows
- `config/` centralises settings that were previously hardcoded in `main.py`
- `docs/` makes the project self-documenting without polluting the root

## Consequences

- `start.bat` updated: `cd src/backend` and `cd src/frontend`
- `.gitignore` paths updated to `src/frontend/node_modules/` etc.
- `CLAUDE.md` updated to reflect new structure
- No changes to internal import paths (React components use relative imports; FastAPI uses absolute parquet paths)
- `npm install` must be re-run in `src/frontend/` if `node_modules` was not preserved during the move
