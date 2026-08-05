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
 * Type-Aware Mode
 * ---------------
 * {@link toFormatOnlyConfig} accepts an `includeTypeAware` option that additionally retains the
 * auto-fixable rules requiring type information, along with the type-aware parser options they
 * need. The consuming eslint.config.format.mjs can key the option off of the
 * 'ESLINT_FORMAT_TYPE_AWARE' environment variable, which the sibling 'eslint-progress.mjs' wrapper
 * sets when it is invoked with the '--type-aware' flag, so the mode is selectable per run from the
 * command line (e.g. `pnpm eslint:format:fast --type-aware`). This mode is substantially slower —
 * it builds a full TypeScript program — but still excludes every non-fixable rule.
 *
 * @example
 * ```ts
 * import { toFormatOnlyConfig } from '@nickflorin/eslint-config-web/fast-formatting';
 * import config from './eslint.config.mjs';
 * export default toFormatOnlyConfig(config, {
 *   includeTypeAware: process.env.ESLINT_FORMAT_TYPE_AWARE === '1',
 * });
 * ```
 */
import { builtinRules } from 'eslint/use-at-your-own-risk';

/**
 * The 'parserOptions' keys that activate typescript-eslint's type-aware linting by instructing the
 * parser to build a full TypeScript program. They are stripped when deriving a format-only
 * configuration so that the parser performs a purely syntactic parse, which is what makes the
 * format-only pass fast and low-memory. When the configuration is derived with `includeTypeAware`,
 * they are left in place instead, because the retained type-aware rules throw without a program.
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
 * Determines whether a rule is a "formatting" rule that is safe to run in a format-only
 * configuration.
 *
 * A rule qualifies only when it is auto-fixable. By default, auto-fixable rules that are type-aware
 * (for example '@typescript-eslint/prefer-optional-chain') are additionally excluded because they
 * throw when run without a TypeScript program, while fixable syntactic rules (for example
 * '@typescript-eslint/consistent-type-imports') are retained because they operate on the AST
 * alone. When `includeTypeAware` is set, type-aware auto-fixable rules qualify as well — the
 * derived configuration then retains the type-aware parser options so a TypeScript program is
 * available to them.
 *
 * @param {import('eslint').Rule.RuleMetaData | undefined} meta The rule metadata to evaluate.
 * @param {boolean} includeTypeAware
 *   Whether auto-fixable rules that require type information also qualify as formatting rules.
 *
 * @returns {boolean} Whether the rule should be retained in a format-only configuration.
 */
const isFormattingRule = (meta, includeTypeAware) =>
  Boolean(meta?.fixable) && (includeTypeAware || meta?.docs?.requiresTypeChecking !== true);

/**
 * Determines whether a rule entry explicitly disables its rule, in either the bare severity form
 * ('off' or 0) or the array form (['off', ...options]).
 *
 * Explicitly disabled entries are always retained in a format-only configuration, whether or not
 * the rule they disable qualifies as a formatting rule. An 'off' entry commonly exists to override
 * a rule enabled by an earlier (often preset) configuration entry; if the 'off' entry were dropped
 * while the enabling entry survived the formatting filter, the format-only pass would run — and
 * auto-fix under — a rule the real configuration has deliberately turned off, producing output the
 * full lint then rejects. Retaining every disabled entry is free, since ESLint never executes a
 * rule that resolves to 'off'.
 *
 * @param {import('eslint').Linter.RuleEntry} entry The configured rule entry to evaluate.
 *
 * @returns {boolean} Whether the entry explicitly disables its rule.
 */
const isDisabledEntry = entry => {
  const severity = Array.isArray(entry) ? entry[0] : entry;
  return severity === 'off' || severity === 0;
};

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
 * Rule entries that explicitly disable their rule are always retained (see
 * {@link isDisabledEntry}), so an override that turns off a preset-enabled rule keeps doing so in
 * the derived configuration.
 *
 * By default the derived configuration is fully type-free: type-aware auto-fixable rules are
 * dropped and the type-aware parser options are stripped, which is what makes the format-only pass
 * fast and low-memory. Setting `includeTypeAware` retains the auto-fixable type-aware rules — and
 * with them the type-aware parser options they need — trading speed for a more complete fix pass;
 * non-fixable rules remain excluded either way.
 *
 * This should *never* be used in production or CI environments.
 *
 * @param {import('eslint').Linter.Config[]} config The source flat configuration to derive from.
 * @param {{ includeTypeAware?: boolean }} [options]
 *   Options controlling the derivation, currently limited to `includeTypeAware` (defaulting to
 *   `false`).
 *
 * @see {@link toFormatOnlyConfig}
 *
 * @returns {import('eslint').Linter.Config[]} The derived format-only flat configuration.
 */
export const toFormatOnlyConfig = (config, { includeTypeAware = false } = {}) => {
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
        ...(entry.languageOptions?.parserOptions && !includeTypeAware
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
                Object.entries(entry.rules).filter(
                  ([ruleId, ruleEntry]) =>
                    isDisabledEntry(ruleEntry) ||
                    isFormattingRule(metaById.get(ruleId), includeTypeAware),
                ),
              ),
            }
          : {}),
      },
    ];
  });
  return [...derived, FormatOnlyLinterOptions];
};
