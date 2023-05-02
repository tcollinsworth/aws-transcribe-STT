module.exports = {
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: 'airbnb-base',
  plugins: [
    'import',
  ],
  rules: {
    semi: [2, 'never'],
    indent: [
      'error', 2,
      { SwitchCase: 1 },
    ],
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'max-len': 'off',
    'import/prefer-default-export': 'off',
    'no-use-before-define': 'off',
    'no-plusplus': 'off',
    'no-continue': 'off',
    'no-param-reassign': 'off',
  },
  env: {
    node: true,
    browser: true,
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [
          ['Util', './src/util'],
        ],
      },
    },
  },
}
