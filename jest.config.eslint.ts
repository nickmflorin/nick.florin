import { TestModule } from "./jest.config.base";
import { withLintConfig } from "./jest.config.lint";

export default withLintConfig(__dirname, {
  module: TestModule.eslint,
  runner: "jest-runner-eslint",
  // Prettier works on scss files, but ESLint does not.
  testMatch: ["!**/*.scss", "!.vercel/**/*", "!**/*.json"],
  testPathIgnorePatterns: [`${__dirname}/src/styles/`],
});
