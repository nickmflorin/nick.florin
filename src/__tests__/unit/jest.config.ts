import { TestModule, withModuleConfig } from '../../../jest.config.base';

export default withModuleConfig(__dirname, {
  module: TestModule.unit,
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
  setupFilesAfterEnv: [`${__dirname}/jest.unit.setup.ts`],
  testMatch: [`${__dirname}/**/*.unit.test.ts`],
});
