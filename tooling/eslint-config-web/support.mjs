/**
 * Generates the glob patterns that match absolute, alias-based imports of a given module name.
 *
 * @param {string} name The name of the module that absolute imports should be generated for.
 *
 * @returns {string[]} The glob patterns matching absolute imports of the module.
 */
export const generateAbsoluteImports = name => [`~/${name}`, `~/${name}/**`];

/**
 * @typedef {{
 *   readonly importNames?: string[];
 *   readonly message?: string;
 *   readonly name: string;
 * }} RestrictedImportPath
 */

/**
 * @typedef {{
 *   readonly group: string[];
 *   readonly message?: string;
 * }} RestrictedImportPattern
 */

/**
 * @typedef {{
 *   readonly paths?: RestrictedImportPath[];
 *   readonly patterns?: RestrictedImportPattern[];
 *   readonly severity?: 'error' | 'warn';
 * }} ConstructRestrictedImportsRuleOptions
 */

/**
 * Constructs the ESLint rule 'no-restricted-imports' by combining the project-wide base
 * restrictions with any additional paths or patterns that the caller provides.
 *
 * Because ESLint flat config replaces a rule's options wholesale rather than merging them, any
 * config that assigns its own 'no-restricted-imports' must route through this helper so that the
 * base restrictions are preserved rather than clobbered.
 *
 * @param {ConstructRestrictedImportsRuleOptions} [config]
 * @param {RestrictedImportPath[]} [config.paths]
 *   Paths that should be inserted directly into the rule's 'paths' option.
 * @param {RestrictedImportPattern[]} [config.patterns]
 *   Patterns that should be inserted directly into the rule's 'patterns' option.
 * @param {'error'|'warn'} [config.severity='error']
 *   The severity that the 'no-restricted-imports' rule should be treated as.  Defaults to 'error'.
 *
 * @returns {import('eslint').Linter.RuleEntry}
 *   The fully constructed 'no-restricted-imports' rule entry, ready to be assigned in a config.
 */
export const constructRestrictedImportsRule = config => [
  config?.severity ?? 'error',
  {
    paths: [
      {
        message: "Please import from 'lodash-es' instead.",
        name: 'lodash',
      },
      ...(config?.paths ?? []),
    ],
    patterns: [
      {
        group: ['clsx'],
        message: "Please import 'classNames' from '~/components/types' instead.",
      },
      {
        group: ['@prisma/client', '@prisma/client/*', '@prisma/client/**'],
        message: "It is important that content be imported from '~/database/model' instead.",
      },
      {
        group: ['~/database/model/generated', '~/database/model/generated/**'],
        message: "Please import directly from '~/database/model' instead.",
      },
      {
        group: ['**/*/index.ts', '**/*/index.tsx', '**/*/index.js', '**/*/index.jsx', '**/*/index'],
        message: 'Please do not include index files in the import path.',
      },
      ...(config?.patterns ?? []),
    ],
  },
];

/**
 * The message reported when a context is rendered through its deprecated `<Context.Provider>`
 * form instead of being rendered directly as `<Context>` (React 19).
 *
 * This exists to backstop `@eslint-react/no-context-provider`, which is a pure naming heuristic:
 * it only fires when the identifier the `.Provider` is accessed on ends with the literal string
 * `Context`. A context stored under any other name slips past that rule entirely, so this
 * syntactic ban catches every `<X.Provider>` regardless of how the underlying context is named.
 */
const NoContextProviderMessage =
  'In React 19 a context is rendered directly as <Context>; use that instead of the deprecated ' +
  '<Context> form. This is banned syntactically because ' +
  '@eslint-react/no-context-provider only catches it when the identifier ends in "Context".';

/**
 * @typedef {{
 *   readonly message: string;
 *   readonly selector: string;
 * }} RestrictedSyntaxEntry
 */

/**
 * The base 'no-restricted-syntax' entries applied everywhere across the project.
 *
 * Because ESLint flat config replaces a rule's options wholesale rather than merging them, any
 * config that assigns its own 'no-restricted-syntax' must route through
 * {@link constructRestrictedSyntaxRule} so these base entries are preserved rather than clobbered.
 *
 * @type {RestrictedSyntaxEntry[]}
 */
export const BaseRestrictedSyntax = [
  {
    message: NoContextProviderMessage,
    selector: "JSXOpeningElement > JSXMemberExpression[property.name='Provider']",
  },
];

/**
 * @typedef {{
 *   readonly restrictions?: RestrictedSyntaxEntry[];
 *   readonly severity?: 'error' | 'warn';
 * }} ConstructRestrictedSyntaxRuleOptions
 */

/**
 * Constructs the ESLint rule 'no-restricted-syntax' by combining the project-wide base
 * restrictions, {@link BaseRestrictedSyntax}, with any additional restrictions the caller provides.
 *
 * Routing every 'no-restricted-syntax' assignment through this helper avoids the flat-config
 * footgun where a later config object silently replaces the base restrictions instead of adding to
 * them.
 *
 * @param {ConstructRestrictedSyntaxRuleOptions} [config]
 * @param {RestrictedSyntaxEntry[]} [config.restrictions]
 *   Additional syntax restrictions to merge on top of the base restrictions.
 * @param {'error'|'warn'} [config.severity='error']
 *   The severity that the 'no-restricted-syntax' rule should be treated as. Defaults to 'error'.
 *
 * @returns {import('eslint').Linter.RuleEntry}
 *   The fully constructed 'no-restricted-syntax' rule entry, ready to be assigned in a config.
 */
export const constructRestrictedSyntaxRule = config => [
  config?.severity ?? 'error',
  ...BaseRestrictedSyntax,
  ...(config?.restrictions ?? []),
];
