import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/coverage/**',
    ],
  },
  js.configs.recommended,

  // React (frontend)
  {
    files: ['frontend/**/*.{js,jsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react/no-unescaped-entities': ['error', { forbid: ['>', '}', '"'] }],
    },
  },

  // Express (backend)
  {
    files: ['backend/**/*.js'],
    languageOptions: {
      globals: globals.node,
      sourceType: 'module', // change to 'module' if backend/package.json has "type": "module"
    },
  },

  // Config files at the frontend root (vite, tailwind, postcss) run in Node
  {
    files: ['frontend/*.config.js'],
    languageOptions: { globals: globals.node, sourceType: 'module' },
  },

  // Allow unused args that start with _ (Express error handlers need 4 params)
  {
    rules: {
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },

  prettier, // must be last
];
