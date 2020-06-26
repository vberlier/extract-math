module.exports = {
  extends: 'standard-with-typescript',
  parserOptions: {
    project: './tsconfig.lint.json'
  },
  rules: {
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/strict-boolean-expressions': 'off'
  }
}
