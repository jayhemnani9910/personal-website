import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "v1-old-site/**",
    "docs/**",
    // Scratch files written by the remember plugin, at the repo root and
    // inside the practice-problem folders. Not ours, and not code.
    "**/.remember/**",
    // Playwright's own output. Both are gitignored, but ESLint reads the
    // working tree rather than the index, so after any test:visual or
    // test:perf run a plain `npm run lint` reported about 3000 errors out of
    // the vendor JS bundled into the HTML reporter, which buries anything
    // real. Deleting the directories by hand before linting is not a fix, it
    // is a thing to forget.
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
