const expo = require("eslint-config-expo/flat")
const prettier = require("eslint-config-prettier")
const simpleImportSort = require("eslint-plugin-simple-import-sort")

const simpleImportSortConfig = {
  plugins: {
    "simple-import-sort": simpleImportSort,
  },
  rules: {
    "simple-import-sort/imports": [
      "warn",
      {
        groups: [
          // Side effect imports
          ["^\\u0000"],
          // Packages. `react` related packages come first.
          ["^react", "^@?\\w"],
          // Aliases
          ["^@features", "^@lib", "^@services"],
          // Parent imports
          ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
          // Relative imports
          ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
          // Style imports
          ["^.+\\.s?css$"],
        ],
      },
    ],
    "simple-import-sort/exports": "warn",
  },
}

module.exports = [
  { ignores: ["supabase/functions/**"] },
  ...expo,
  simpleImportSortConfig,
  prettier,
]
