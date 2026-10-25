-- Base-layer schema for the Discrete Math Review App.
-- Kept intentionally simple: this models "definite" requirements only
-- (modules, lessons, and a bare-bones users table standing in for future
-- Onyen/SSO accounts). Practice quizzes live in Google Forms; a module just
-- stores the link to its form.

-- Legacy: the app used to keep native quiz questions in this table. It is no
-- longer created, but it is still dropped here so re-running this script on a
-- database that has it doesn't fail on its foreign key to `modules`.
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
  -- Embeddable Google Form URL for this module's practice quiz (NULL = no
  -- quiz yet). Validated and normalized by backend/src/quizFormUrl.js.
  quiz_form_url TEXT,
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
