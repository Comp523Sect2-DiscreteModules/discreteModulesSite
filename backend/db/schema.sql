-- Base-layer schema for the Discrete Math Review App.
-- Kept intentionally simple: this models "definite" requirements only
-- (modules, lessons, a quiz-questions table with no seeded content yet,
-- and a bare-bones users table standing in for future Onyen/SSO accounts).

DROP TABLE IF EXISTS quiz_questions;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS modules;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  onyen TEXT UNIQUE,                 -- placeholder for future Onyen SSO identity
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE modules (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lessons (
  id SERIAL PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  -- Lesson body is Markdown with inline/display LaTeX (\( \) and \[ \] or $ $ / $$ $$),
  -- rendered client-side with MathJax per the spec.
  content_md TEXT NOT NULL DEFAULT '',
  video_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table exists so the quiz page has something real to query against,
-- but per the spec the quiz page itself is a stub for this base layer,
-- so no rows are seeded.
CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  choices JSONB NOT NULL DEFAULT '[]',
  correct_choice INTEGER,
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);
