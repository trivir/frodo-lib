import { defineConfig } from "oxfmt"

export default defineConfig({
  sortImports: {
    groups: [
      "builtin",
      "external",
      "internal",
      ["parent", "sibling", "index"]
    ],
    newlinesBetween: true
  },
  trailingComma: "es5",
  singleQuote: true,
  ignorePatterns: ["*.test.ts"],
  printWidth: 80,
})
