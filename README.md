# Discrete Math Review App — Base Layer

Base-layer scaffold for COMP 523 (Fall 2026). See the project's chat writeup
for a full walkthrough. Quickstart:

## First-time setup

```bash
# 1. Database
createdb discrete_math_review
cp backend/.env.example backend/.env   # edit if your local Postgres user/password differ

# 2. Install dependencies (root, backend, and frontend)
npm run install:all

# 3. Create tables and load sample data
npm --prefix backend run db:setup
```

## Development (one terminal)

```bash
npm run dev
```

This starts both servers with live reload. Output is prefixed `[api]` and
`[web]` so you can tell them apart. Ctrl-C stops both.

| Server          | URL                   |
| --------------- | --------------------- |
| Frontend (Vite) | http://localhost:5173 |
| API (Express)   | http://localhost:4000 |

## Production (single process)

```bash
npm run build   # builds the React app into frontend/dist
npm start       # Express serves the API and the built frontend
```

Everything is served from one Node process at http://localhost:4000 (or
whatever `PORT` is set to). Re-run `npm run build` after any frontend change.

When deploying, set `PORT` and the `PG*` variables as real environment
variables (`backend/.env` is not committed). On a host, the build command is:

```bash
npm --prefix backend ci && npm --prefix frontend ci && npm run build
```

and the start command is `npm start`.
