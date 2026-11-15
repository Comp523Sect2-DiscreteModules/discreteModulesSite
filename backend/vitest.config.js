import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.js'],
    // Tests never touch the developer's real database. db.js reads PGDATABASE
    // from the environment, and dotenv does not override a variable that is
    // already set, so this wins over backend/.env.
    env: {
      PGDATABASE: process.env.PGDATABASE_TEST || 'discrete_math_review_test',
    },
    // The integration tests share one Postgres database, so run files one at a time.
    fileParallelism: false,
  },
});
