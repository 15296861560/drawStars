// 可参照https://cloud.tencent.com/developer/chapter/12618文档说明

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2022: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    babelOptions: {
      parserOpts: {
        plugins: ['jsx', 'typescript']
      }
    }
  },
  extends: ['eslint:recommended', 'plugin:vue/base', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'warn',
    'vue/multi-word-component-names': 'off',
    'vue/no-reserved-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ]
  },
  overrides: [
    {
      files: ['src/utils/directives/emoji.js'],
      rules: {
        'no-misleading-character-class': 'off',
        'no-useless-escape': 'off'
      }
    },
    {
      files: ['*.ts', '*.tsx', '*.vue'],
      rules: {
        // TypeScript 类型与 Vue 编译器宏在 Babel 解析下会误报
        'no-undef': 'off'
      }
    },
    {
      files: ['*.d.ts'],
      rules: {
        'no-unused-vars': 'off',
        'no-undef': 'off'
      }
    }
  ]
}
