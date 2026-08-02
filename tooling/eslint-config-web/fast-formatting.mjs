/**
 * This module defines logic that is capable of modifying an ESLint configuration such that all
 * non-auto-fixable rules are stripped out, leaving only the rules that can be automatically fixed
 * present.
 *
 * Running ESLint's auto-fix routines on even a medium sized workspace is extremely performance
 * intensive and often results in the process running out of available memory.  This is largely
 * because of the type-aware linting rules (from @typescript-eslint) and other performance-intensive
 * rules (mostly import/* rules) that are being simultaneously evaluated during the formatting
 * process.
 *
 * Stripping the configuration so that it only includes rules that would result in an auto-fix if
 * violated largely removes all of these more performance-intensive rules and allows ESLint to be
 * run as _just a formatter_ in cases where that behavior is needed in local development, but
 * much, much faster.
 *
 * This is largely intended for local development situations where the formatter needs to be run
 * on a workspace after large generated code changes have been made by an agent.
 *
 * This should *never* be used in a CI or production environment.
 *
 * Usage
 * -----
 * 1. Create a file at the root of the project called eslint.config.format.mjs.
 * 2. In that file, import both the {@link toFormatOnlyConfig} function and the project's ESLint
 *    configuration.
 * 3. Call the {@link toFormatOnlyConfig} function with the imported configuration to derive a
 *    format-only configuration and export it.
 * 4. Add a script to the project's package.json that runs ESLint with the format-only
 *    configuration. Route it through the sibling 'eslint-progress.mjs' wrapper so each file is
 *    printed to the terminal as it is formatted (the 'ESLINT_PROGRESS_LABEL' environment variable
 *    sets the verb shown in front of each file):
 *
 *    "eslint:format:fast": "ESLINT_PROGRESS_LABEL=formatting node
 *       ./tooling/eslint-config-web/eslint-progress.mjs -c eslint.config.format.mjs --fix
 *       --cache --cache-location .eslintcache.format --no-error-on-unmatched-pattern .",
 *
 * On a project of this size this will still take a handful of seconds, but that is dramatically
 * better than a full type-aware fix pass.
 *
 * @example
 * ```ts
 * import { toFormatOnlyConfig } from '@nickflorin/eslint-config-web/fast-formatting';
 * import config from './eslint.config.mjs';
 * export default toFormatOnlyConfig(config);
 * ```
 */
import { builtinRules } from 'eslint/use-at-your-own-risk';

/**
 * The 'parserOptions' keys that activate typescript-eslint's type-aware linting by instructing the
 * parser to build a full TypeScript program. They are stripped when deriving a format-only
 * configuration so that the parser performs a purely syntactic parse, which is what makes the
 * format-only pass fast and low-memory.
 */
const TypeAwareParserOptionKeys = ['project', 'projectService', 'EXPERIMENTAL_useProjectService'];

/**
 * A trailing configuration entry appended to a format-only configuration that turns off reporting
 * of unused eslint-disable directives.
 *
 * A format-only configuration retains only a subset of the source's rules, so a directive that
 * disables an omitted rule (for example a type-aware rule) would be flagged as unused and, under
 * '--fix', removed. Disabling the report ensures the format-only pass never deletes directives that
 * the full, type-checked lint still relies on.
 *
 * @type {import('eslint').Linter.Config}
 */
const FormatOnlyLinterOptions = { linterOptions: { reportUnusedDisableDirectives: 'off' } };

/**
 * Builds a map of fully-qualified rule id to its metadata for every rule reachable from the
 * provided flat configuration, combining ESLint's built-in core rules with the rules contributed
 * by each plugin registered across the configuration entries.
 *
 * The rule id is assembled from the namespace each plugin is registered under and the rule name, so
 * a plugin aliased to a different namespace (for example 'eslint-plugin-import-x' registered as
 * 'import') resolves to the same id the rules are configured with.
 *
 * @param {import('eslint').Linter.Config[]} config
 *   The flat configuration array to collect rule metadata from.
 *
 * @returns {Map<string, import('eslint').Rule.RuleMetaData | undefined>}
 *   A map keyed by rule id (e.g. 'curly', '@stylistic/quotes', 'import/order') of rule metadata.
 */
const collectRuleMeta = config => {
  const metaById = new Map();
  for (const [ruleId, rule] of builtinRules) {
    metaById.set(ruleId, rule.meta);
  }
  for (const entry of config) {
    if (entry?.plugins) {
      for (const [pluginName, plugin] of Object.entries(entry.plugins)) {
        for (const [ruleName, rule] of Object.entries(plugin.rules ?? {})) {
          metaById.set(`${pluginName}/${ruleName}`, rule.meta);
        }
      }
    }
  }
  return metaById;
};

/**
 * Determines whether a rule is a "formatting" rule that is safe to run in a format-only, type-free
 * configuration.
 *
 * A rule qualifies only when it is auto-fixable and does not require type information. Auto-fixable
 * rules that are type-aware (for example '@typescript-eslint/prefer-optional-chain') are excluded
 * because they throw when run without a TypeScript program, while fixable syntactic rules (for
 * example '@typescript-eslint/consistent-type-imports') are retained because they operate on the
 * AST alone.
 *
 * @param {import('eslint').Rule.RuleMetaData | undefined} meta The rule metadata to evaluate.
 *
 * @returns {boolean} Whether the rule should be retained in a format-only configuration.
 */
const isFormattingRule = meta =>
  Boolean(meta?.fixable) && meta?.docs?.requiresTypeChecking !== true;

/**
 * Removes the type-aware {@link TypeAwareParserOptionKeys} from a 'parserOptions' object, returning
 * a copy that retains every other option. The parser itself is left in place so TypeScript syntax
 * is still parsed, only without constructing a type-checker program.
 *
 * @param {Record<string, unknown>} parserOptions The 'parserOptions' object to strip.
 *
 * @returns {Record<string, unknown>} A copy of the options with the type-aware keys removed.
 */
const stripTypeAwareParserOptions = parserOptions => {
  const next = { ...parserOptions };
  for (const key of TypeAwareParserOptionKeys) {
    delete next[key];
  }
  return next;
};

/**
 * Determines whether a configuration entry uses an ESLint plugin as its parser, as the
 * '@graphql-eslint' configuration does for '.graphql' files.
 *
 * @param {import('eslint').Linter.Config} entry The configuration entry to evaluate.
 *
 * @returns {boolean} Whether the entry uses a plugin as its parser.
 */
const usesPluginAsParser = entry => {
  const parser = entry.languageOptions?.parser;
  return Boolean(parser) && typeof parser === 'object' && 'rules' in parser;
};

/**
 * Modifies a given ESLint configuration by stripping out all rules that are not associated with
 * auto-fixable routines so that the resulting configuration can be used to simply run ESLint as
 * a formatter in a significantly faster way.
 *
 * This should *never* be used in production or CI environments.
 *
 * @param {import('eslint').Linter.Config[]} config The source flat configuration to derive from.
 *
 * @see {@link toFormatOnlyConfig}
 *
 * @returns {import('eslint').Linter.Config[]} The derived format-only flat configuration.
 */
export const toFormatOnlyConfig = config => {
  const metaById = collectRuleMeta(config);
  const derived = config.flatMap(entry => {
    if (!entry || typeof entry !== 'object') {
      return [entry];
    }
    if (usesPluginAsParser(entry)) {
      return [];
    }
    return [
      {
        ...entry,
        ...(entry.languageOptions?.parserOptions
          ? {
              languageOptions: {
                ...entry.languageOptions,
                parserOptions: stripTypeAwareParserOptions(entry.languageOptions.parserOptions),
              },
            }
          : {}),
        ...(entry.rules
          ? {
              rules: Object.fromEntries(
                Object.entries(entry.rules).filter(([ruleId]) =>
                  isFormattingRule(metaById.get(ruleId)),
                ),
              ),
            }
          : {}),
      },
    ];
  });
  return [...derived, FormatOnlyLinterOptions];
};
