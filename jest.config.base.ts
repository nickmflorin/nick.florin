import nextJest from "next/jest.js";

import type { Config } from "jest";

// Jest configuration options that are allowed to be overridden on a per-project basis.
type AllowedConfig = Omit<
  Config,
  | "rootDir"
  | "prettierPath"
  | "globalSetup"
  | "preset"
  | "transform"
  | "moduleDirectories"
  | "moduleFileExtensions"
>;

const createNextJestConfig = nextJest({
  /*
  Provide the path to your Next.js app to load next.config.js and .env files in your test
  environment
  */
  dir: "./",
});

export enum TestModule {
  unit = "unit",
  prettier = "prettier",
  eslint = "eslint",
}

const TestModuleDisplayNames: { [key in TestModule]: string } = {
  [TestModule.unit]: "unit-tests",
  [TestModule.eslint]: "eslint-tests",
  [TestModule.prettier]: "prettier-tests",
};

/**
 * Returns the {@link Config} values that define the base Jest configuration for all "project"(s) in
 * the application with project-scoped overrides included.
 *
 * A Jest "project" is defined as a subset of tests that require separate or modified
 * configurations.  These projects are associated with scoped configuration files, with are denoted
 * as either jest-*.config.ts or jest.config.ts.
 *
 * Note: Root Dir
 * --------------
 * The Jest configuration string placeholder, <rootDir>, refers to the root directory where the
 * project's Jest configuration file (jest-*.config.ts or jest.config.ts) is located - not the root
 * directory of the repository or the root directory that Jest is configured with via the `rootDir`
 * option.
 *
 * For cases where the actual repository root directory is required, the __dirname variable should
 * be used (only in this file or other root `jest-*.config.ts` files), and individual projects will
 * need to provide the __dirname to these methods.
 *
 * @param {string} rootDir
 *   The root directory of the project which contains the tests it is responsible for.  This should
 * be provided by the  __dirname variable inside of the project's `jest.config.ts`.
 *
 * @param {AllowedConfig} config
 *   Optional, additional Jest configuration options (or a function returning additional Jest
 *   configuration options) specific to that project.
 */
export const withBaseConfig = (rootDir: string, config: AllowedConfig): Config => ({
  ...config,
  rootDir,
});

/**
 * Returns an async function that establishes the overall Jest configuration for the application.
 *
 * This function should not be used for establishing the configuration of individual "projects" in
 * the application.
 *
 * @see withModuleConfig
 *
 * @param {string} rootDir
 *   The root directory of the project which contains the tests it is responsible for.  This should
 *   be provided by the __dirname variable inside of the project's `jest.config.ts`.
 *
 * @param {string[]} projects
 *   The Jest "projects" for the application.
 */
export const withApplicationConfig = (rootDir: string, projects: string[]) =>
  createNextJestConfig(
    withBaseConfig(rootDir, {
      projects,
    }),
  );

export type ModuleConfig = Omit<AllowedConfig, "displayName"> & {
  readonly module: TestModule;
};

/**
 * Returns an async function that Jest will use to establish the configuration for a given "module"
 * in the application.
 *
 * @param {string} rootDir
 *   The root directory of the project which contains the tests that the returned configuration is
 *   responsible for.  This should be provided as the __dirname variable inside of the project's
 *   `jest.config.ts`.
 *
 * @param {ModuleConfig} config
 *   Optional, additional Jest configuration options for the specific module.
 */
export const withModuleConfig = (rootDir: string, { module, ...config }: ModuleConfig) => {
  const resulting = createNextJestConfig(
    withBaseConfig(rootDir, {
      ...config,
      displayName: TestModuleDisplayNames[module],
      setupFilesAfterEnv: [
        ...(config?.setupFilesAfterEnv ?? []),
        // `${__dirname}/src/application/support/global-ts-test-setup.ts`,
        "jest-expect-message",
      ],
    }),
  );
  return resulting;
};
