/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    node: true,
    browser: false,
    jest: true,
  },
  ignorePatterns: ['node_modules/**'],
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  overrides: [
    {
      files: [
        '**/*.spec.js',
        '**/*.spec.jsx',
      ],
      env: {
        'jest': true,
      },
      rules: {
        'no-unused-vars': ['off'],
      },
    },
  ],
  rules: {
    // https://eslint.org/docs/latest/rules/indent
    'indent': ['error', 2, {
      'SwitchCase': 1,
      'MemberExpression': 1,
      'ObjectExpression': 1,
      'ImportDeclaration': 1,
    }],
    'quotes': ['error', 'single'],
    'object-curly-spacing': ['error', 'always'],
    'newline-per-chained-call': ['error'],
    'comma-dangle': ['error', 'always-multiline'],
    'semi': ['error', 'never'],
    'space-before-function-paren': ['error', 'never'],
    'keyword-spacing': ['error', { 'before': true, 'after': true }],
    'multiline-ternary': ['error', 'always'],
  },
}
