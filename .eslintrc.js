module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'import', 'check-file'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  settings: {
    'import/resolver': {
      typescript: { project: `${__dirname}/tsconfig.json` },
    },
  },
  overrides: [
    {
      files: ['src/infrastructure/database/schema/**/*.ts'],
      rules: { 'no-restricted-imports': 'off' },
    },
    {
      files: ['src/infrastructure/database/migrations/*.ts'],
      rules: { 'check-file/filename-naming-convention': 'off' },
    },
    {
      files: ['src/**/*.spec.ts'],
      rules: { '@typescript-eslint/no-explicit-any': 'off' },
    },
  ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
    ],
    '@typescript-eslint/no-import-type-side-effects': 'error',
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-console': 'error',
    'no-inline-comments': 'error',
    'no-warning-comments': ['error', { terms: ['todo', 'fixme'] }],
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['./*', '../*'],
            message: 'Use imports absolutos a partir de src/ (ex.: src/modules/...).',
          },
        ],
      },
    ],
    'check-file/filename-naming-convention': [
      'error',
      { 'src/**/*.ts': 'KEBAB_CASE' },
      { ignoreMiddleExtensions: true },
    ],
    'check-file/folder-naming-convention': ['error', { 'src/**/': 'KEBAB_CASE' }],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
};
