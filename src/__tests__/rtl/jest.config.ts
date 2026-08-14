import { TestModule, withModuleConfig } from '../../../jest.config.base';

export default withModuleConfig(__dirname, {
  module: TestModule.rtl,
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
  setupFilesAfterEnv: [`${__dirname}/jest.rtl.setup.ts`],
  testEnvironment: `${__dirname}/jest.rtl.environment.ts`,
  testMatch: [`${__dirname}/**/*.rtl.test.tsx`],
});
