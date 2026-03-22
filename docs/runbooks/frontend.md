# Runbook — Frontend

## First-time setup

```bash
cd src/frontend
npm install
```

## Start the dev server

```bash
cd src/frontend
npm run dev
# → http://localhost:5173
```

Or use `start.bat` from the project root.

## Production build

```bash
cd src/frontend
npm run build
# Output: src/frontend/dist/

npm run preview
# Serves the build at http://localhost:4173
```

## API proxy

Vite proxies `/api/*` to `http://localhost:8000` (configured in `src/frontend/vite.config.js`).
The backend must be running for any dashboard data to load. If it's not running, the app shows a "Backend unavailable" banner.

## Add a dependency

```bash
cd src/frontend
npm install <package-name>
```

## Dark/light mode

The theme is toggled via the sun/moon button in the navbar. State persists in `localStorage` under `manthiq-theme`. Default is dark.

To reset: open browser DevTools → Application → Local Storage → delete `manthiq-theme`.

## Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `npm: command not found` | Node not in PATH | Use Node v24+; verify `node --version` |
| `Cannot find module 'react'` | node_modules missing | Run `npm install` in `src/frontend/` |
| `EADDRINUSE :5173` | Port in use | Stop the other process or change port in `vite.config.js` |
| Chart shows no data | Backend not running | Start backend first (`start.bat` or manually) |
| `NaN` in tooltip | Parquet column is null | `df_to_records()` in backend should replace with `null`; check API response |

## File locations

| What | Where |
|------|-------|
| App entry | `src/frontend/src/App.jsx` |
| Live tab | `src/frontend/src/pages/Dashboard.jsx` |
| Model Lab tab | `src/frontend/src/pages/ModelLab.jsx` |
| Shared components | `src/frontend/src/components/` |
| Theme hook | `src/frontend/src/hooks/useTheme.js` |
| Global CSS | `src/frontend/src/index.css` |
