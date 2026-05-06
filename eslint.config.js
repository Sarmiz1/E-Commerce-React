import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import queryPlugin from '@tanstack/eslint-plugin-query'
import { defineConfig, globalIgnores } from 'eslint/config'

const markJsxIdentifierAsUsed = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Mark variables used as JSX tags as used for no-unused-vars.',
    },
    schema: [],
  },
  create(context) {
    function getRootName(node) {
      if (!node) return null
      if (node.type === 'JSXIdentifier') return node.name
      if (node.type === 'JSXMemberExpression') return getRootName(node.object)
      if (node.type === 'JSXNamespacedName') return node.namespace.name
      return null
    }

    return {
      JSXOpeningElement(node) {
        const name = getRootName(node.name)
        if (name) context.sourceCode.markVariableAsUsed(name, node)
      },
    }
  },
}

const unusedVarsOptions = {
  argsIgnorePattern: '^_',
  caughtErrorsIgnorePattern: '^_',
  varsIgnorePattern: '^[A-Z_]',
}

export default defineConfig([
  globalIgnores([
    'dist',
    'temp_build',
    'eslint*.txt',
    'eslint*.json',
    'lint_output.txt',
    'build_output.txt',
  ]),

  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      queryPlugin.configs['flat/recommended'],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      '@tanstack/query': queryPlugin,
      local: {
        rules: {
          'jsx-uses-vars': markJsxIdentifierAsUsed,
        },
      },
    },
    rules: {
      'local/jsx-uses-vars': 'error',
      'no-unused-vars': ['error', unusedVarsOptions],
    },
  },

  {
    files: ['*.{js,cjs}', '*.config.js', 'src/seed.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', unusedVarsOptions],
    },
  },

  {
    files: [
      'src/generate-embedding.js',
      'src/Features/Orders/Components/fix_dark_mode.js',
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        Deno: 'readonly',
      },
    },
  },
])
