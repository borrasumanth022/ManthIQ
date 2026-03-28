Commit and push the current ManthIQ changes to GitHub for $ARGUMENTS (default: current branch).

Steps:
1. Run `git status` — show what has changed.
2. Block if any of these are staged:
   - `src/frontend/node_modules/`
   - `src/frontend/dist/`
   - `CLAUDE.md` or `CLAUDE.local.md`
   - `.claude/settings.local.json`
   - `*.log`, `*.env`
3. Stage only safe files:
   - `src/backend/` — FastAPI app changes
   - `src/frontend/src/` — React component changes
   - `src/frontend/package.json`, `vite.config.js`, `tailwind.config.js`
   - `.claude/` — except settings.local.json (gitignored)
   - `docs/`, `config/`, `.gitignore`, `README.md`
4. Show `git diff --stat` for confirmation.
5. Propose a commit message in Conventional Commits format:
   - `<type>(<scope>): <description>` — max 72 chars
   - Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`
   - Scopes: `backend`, `frontend`, `model`, `config`, `docs`
   - Examples:
     - `feat(frontend): add TSLA to ticker dropdown`
     - `fix(backend): correct label encoding for model-stats signal`
     - `chore(config): update .claude rules and commands`
6. Commit with Co-Authored-By tag and push.
7. Never push to `main` directly — if on main, offer to create a feature branch first.

If $ARGUMENTS contains a message in quotes, use that message verbatim.
