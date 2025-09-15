module.exports = {
  'src/**/*.{ts,js}': ['eslint --fix --ignore-pattern "**/*.spec.ts"', 'prettier --write'],
  '*.{json,md,yml}': ['prettier --write'],
};
