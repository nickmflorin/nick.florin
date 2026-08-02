import { TestModule, withModuleConfig } from '../../../jest.config.base';

export default withModuleConfig(__dirname, {
  module: TestModule.unit,
  moduleNameMapper: {
    '^lodash-es$': 'lodash',
  },
  testMatch: [`${__dirname}/**/*.test.ts`],
});
