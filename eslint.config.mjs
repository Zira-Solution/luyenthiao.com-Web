import nextConfig from 'eslint-config-next'
import * as importX from 'eslint-plugin-import-x'

const eslintConfig = [
  { ignores: ['.claude/**'] },
  ...nextConfig,
  {
    plugins: { 'import-x': importX },
    rules: {
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import-x/no-duplicates': 'error',
    },
  },
]

export default eslintConfig
