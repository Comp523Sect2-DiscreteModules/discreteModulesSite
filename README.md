# Discrete Math Review App — Base Layer

Base-layer scaffold for COMP 523 (Fall 2026). See the project's chat writeup
for a full walkthrough. Quickstart:

```bash
# 1. Database
createdb discrete_math_review
cd backend
cp .env.example .env   # edit if your local Postgres user/password differ
npm install
npm run db:setup       # applies schema.sql + seed.sql
npm run dev            # http://localhost:4000

# 2. Frontend (separate terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173
```

Open http://localhost:5173, sign in as either role (no password — this is a
mock login standing in for future Onyen SSO), and explore.
