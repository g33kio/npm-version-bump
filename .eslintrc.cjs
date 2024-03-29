/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  env: {
    node: true,
    browser: false,
  },
  extends: [
    'eslint:recommended',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
  },
  rules: {
    'indent': [
      'error', 4, {
        'SwitchCase': 1,
        'MemberExpression': 1,
        'ObjectExpression': 1,
        'ImportDeclaration': 1,
      }
    ],
    'quotes': [ 'error', 'single' ],
    'object-curly-spacing': [ 'error', 'always' ],
    'newline-per-chained-call': [ 'error' ],
    'comma-dangle': [ 'error', 'always-multiline' ],
    'semi': [ 'error', 'never' ],
    'space-before-function-paren': [ 'error', 'always' ],
    'keyword-spacing': [ 'error', { 'before': true, 'after': true } ],
    'multiline-ternary': [ 'error', 'always' ],
  },
}
