# /project:pipeline -- Start the ManthIQ dev environment

**Usage:**
- /project:pipeline -- start both backend and frontend
- /project:pipeline backend -- start backend only
- /project:pipeline frontend -- start frontend only

## Instructions

1. Read CLAUDE.local.md to get PYTHON_EXE.

2. Start backend:
     cd src/backend
     {PYTHON_EXE} -m uvicorn main:app --reload --port 8000
   Confirm: GET http://localhost:8000/health returns {status: ok}

3. Start frontend:
     cd src/frontend
     npm run dev
   Confirm: http://localhost:5173 loads without errors

4. Or run both at once: start.bat from ManthIQ root.

5. After startup, run: /project:evaluate to verify all 11 tickers load correctly.

