import globals from 'globals'
import pluginJs from '@eslint/js'

export default [
    pluginJs.configs.recommended,
    {
        files: ['**/*.js'],
        rules: {
            indent: ['error', 4],
            quotes: ['error', 'single'],
            semi: ['error', 'never'],
            'no-async-promise-executor': 'off',
            'no-multi-spaces': ['error'],
            'no-multiple-empty-lines': ['error', { max: 1 }],
            'arrow-spacing': ['error', { before: true, after: true }],
            'arrow-parens': ['error', 'as-needed'],
            'comma-spacing': ['error', { before: false, after: true }],
            'padding-line-between-statements': [
                'error',
                { blankLine: 'always', prev: 'import', next: '*' },
                { blankLine: 'any', prev: 'import', next: 'import' }
            ]
        },
        languageOptions: {
            sourceType: 'module',
            globals: {
                ...globals.node,
                jest: 'readonly',
                beforeAll: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly'
            }
        }
    }
]