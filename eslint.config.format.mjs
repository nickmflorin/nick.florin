import { toFormatOnlyConfig } from '@nickflorin/eslint-config-web/fast-formatting';

import config from './eslint.config.mjs';

/**
 * Whether the format-only configuration should also retain auto-fixable rules that require type
 * information, along with the type-aware parser options they need.
 *
 * The 'eslint-progress.mjs' wrapper sets this environment variable when it is invoked with the
 * '--type-aware' flag (e.g. `pnpm eslint:format:fast --type-aware`), so the mode is selectable per
 * run from the command line without a second configuration file.
 */
const IncludeTypeAware = process.env.ESLINT_FORMAT_TYPE_AWARE === '1';

/**
 * A modified version of the project's ESLint configuration, {@link config}, that is used for
 * local-development-only ESLint script(s) that are not used as a source of correctness but rather
 * just a formatter.
 *
 * Only auto-fixable rules are maintained, eliminating almost if not all type-aware rules and
 * computationally intensive rules, dramatically improving the performance of ESLint's format
 * pass in local development. When {@link IncludeTypeAware} is set, the auto-fixable type-aware
 * rules are retained as well, trading speed for a more complete fix pass.
 *
 * This should *never* be used in production or CI environments.
 *
 * @see {@link toFormatOnlyConfig}
 */
export default toFormatOnlyConfig(config, { includeTypeAware: IncludeTypeAware });
