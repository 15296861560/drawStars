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
      files: ['src/utils/directives/emoji.ts'],
      rules: {
        'no-misleading-character-class': 'off',
        'no-useless-escape': 'off'
      }
    },
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
      },
      plugins: ['@typescript-eslint'],
      rules: {
        // 关闭 Babel 规则，改用 TS 规则（能识别 import type / 类型注解中的引用）
        'no-undef': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_'
          }
        ]
      }
    },
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        parser: {
          ts: '@typescript-eslint/parser',
          js: '@babel/eslint-parser'
        },
        requireConfigFile: false,
        babelOptions: {
          parserOpts: {
            plugins: ['jsx', 'typescript']
          }
        }
      },
      plugins: ['@typescript-eslint'],
      rules: {
        'no-undef': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_'
          }
        ]
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
