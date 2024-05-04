import { withModuleConfig, TestModule } from "./jest.config.base";

export default withModuleConfig(__dirname, {
  module: TestModule.stylelint,
  runner: "jest-runner-stylelint",
  testMatch: ["/**/*.scss", "./**/*.module.scss", "./**/*.css", "./**/*.module.css"],
});
