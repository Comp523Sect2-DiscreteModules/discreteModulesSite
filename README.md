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

## Practice quizzes (Google Forms)

Each module's practice quiz is a Google Form embedded on the quiz page. The app
only stores the form's link; Google handles the questions, grading, and
responses (see the form's Responses tab, or link it to a Google Sheet). The app
does not see scores.

To add a quiz to a module:

1. Create the form in Google Forms. In **Settings**, turn on **Make
   this a quiz**, set **Release grade** to _Immediately after each submission_,
   and enable showing missed questions and correct answers.
2. Under **Settings → Responses**, make sure the form is **not** restricted to
   an organization (and doesn't require sign-in). Google can't show its login
   page inside an embed, so a restricted form appears blank to students.
   Google Forms has no LaTeX support, so write math with Unicode symbols or
   images.
3. In the form, choose **Send**, open the **`< >`** tab, and copy the embed
   code.
4. Sign in to the app as an admin, open **Admin dashboard → Edit** on the
   module, and paste the embed code (or just the link inside it) into **Practice
   quiz (Google Form)**, then **Save quiz**. Use **Preview as student** to check
   it, and **Remove quiz** to take it down.

Only `docs.google.com` form links are accepted, and the "Try the practice quiz"
button only appears for modules that have a quiz.

### Upgrading an existing database

Running `npm --prefix backend run db:setup` rebuilds the schema (and erases all
data). To keep your existing data, run this instead. It adds the new column and
removes the old native-quiz table, which deletes any quiz questions stored in
it:

```bash
psql discrete_math_review -c "ALTER TABLE modules ADD COLUMN IF NOT EXISTS quiz_form_url TEXT; DROP TABLE IF EXISTS quiz_questions;"
```

## Testing

Automated tests use [Vitest](https://vitest.dev). See the team test plan for
the full list of test cases and IDs (BU-, BR-, BI-, FU-).

| Suite    | Location                          | What it covers                                                                                                              |
| -------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Backend  | `backend/tests/`                  | Quiz-link validation, middleware, route behavior (mocked database), and API + real Postgres integration tests (supertest).  |
| Frontend | `frontend/src/**/*.test.{js,jsx}` | API client, auth context, protected routes, login, lecture markdown renderer, and the student/admin pages (mocked `fetch`). |

### One-time setup

The backend integration tests run against a real Postgres database named
`discrete_math_review_test`. They drop and recreate every table in it, so they
refuse to run against any database whose name does not end in `_test`.

```bash
createdb discrete_math_review_test
npm run install:all
```

The tests connect with the `PG*` settings from `backend/.env` (or from real
environment variables, which take priority), but always use the
`discrete_math_review_test` database. To use a different test database name, set
`PGDATABASE_TEST`.

### Running the tests

```bash
npm test                      # backend, then frontend
npm --prefix backend test     # backend only
npm --prefix frontend test    # frontend only
npm --prefix backend run test:watch   # re-run on change (also in frontend)
```

CI (`.github/workflows/ci.yml`) runs both suites against a Postgres 16 service
container on every pull request.
