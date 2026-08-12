import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["typescript", "import", "jest"],
  env: {
    node: true,
  },
  ignorePatterns: [
    "types",
    "cjs",
    "esm",
    "src/**/*.test.ts",
    "src/**/*.test_.ts",
    "tsup.config.ts",
  ],
  options: {
    typeAware: true,
  },
  rules: {
    // Explicitly included in eslint ///////////////////////////////////////////

    // I'm fine with
    "no-console": "warn",
    "no-with": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "typescript/no-deprecated": "warn", // TODO turn this back on

    // I think they meant to have this on but it doesn't actually seem to work in eslint
    "import/no-duplicates": "off",

    // I think these are good but understand it's preference
    "dot-notation": "off",
    "no-labels": "error", // Maybe change this to no-extra-labels instead
    "no-multi-str": "off",
    "no-underscore-dangle": "off",


    // oxlint defaults caught these in existing code ////////////////////////////

    // Oxlint default is to allow leading underscore, I think we should use it
    "no-unused-vars": [
      "warn",
      {
        argsIgnorePattern: null,
      },
    ],

    // I think these are good and we should fix them and enable these rules
    "no-unreachable": "off",
    "no-useless-rename": "off",
    "typescript/await-thenable": "off",
    "typescript/no-redundant-type-constituents": "off",

    // I think we should turn on strict null checking in tsconfig and then we can turn this on
    "typescript/no-useless-default-assignment": "off",

    // These oxlint defaults are surprising if not familiar, maybe turn them back on later
    "typescript/no-base-to-string": "off",
    "typescript/no-floating-promises": "off",
    "typescript/restrict-template-expressions": "off",
  },
});
