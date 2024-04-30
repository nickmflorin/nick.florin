import { withModuleConfig, TestModule } from "../../../jest.config.base";

export default withModuleConfig(__dirname, {
  module: TestModule.unit,
  // Scope the tests that Jest will run to just tests in the `__tests__/unit` directory.
  testMatch: [`${__dirname}/**/*.test.ts`],
});
