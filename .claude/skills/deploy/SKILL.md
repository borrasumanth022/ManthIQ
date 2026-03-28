---
name: deploy
description: Build and verify ManthIQ for production or local deployment
---

# Deploy Skill

Use this workflow before sharing the app or validating a production build.

## Local dev (default)

```bat
start.bat
```
Opens two terminal windows: backend on :8000, frontend on :5173.

## Production build

### 1. Build the frontend

```bash
cd src/frontend
npm run build
# Output: src/frontend/dist/
```

### 2. Verify the build

```bash
cd src/frontend
npm run preview
# Serves the production build on :4173
```

### 3. Verify the backend

```bash
# Health check
curl http://localhost:8000/health

# Quick smoke test of key endpoints
curl http://localhost:8000/api/overview
curl "http://localhost:8000/api/price?limit=5"
curl http://localhost:8000/api/model-stats
```

### 4. Run hook guardrails

```bash
bash .claude/hooks/data-validation.sh
bash .claude/hooks/api-testing.sh
bash .claude/hooks/build-check.sh
```

## Checklist before shipping

- [ ] Backend health check passes
- [ ] All three API smoke tests return 200
- [ ] Frontend build succeeds with no errors
- [ ] Both dark and light themes render correctly
- [ ] Live tab: price chart loads, metric cards show real values
- [ ] Model Lab tab: prediction chart and confidence bar load

## Environment requirements

- Python: `C:\Users\borra\anaconda3\python.exe`
- Node: v24+
- Ports: 8000 (backend), 5173 (frontend dev), 4173 (frontend preview)
