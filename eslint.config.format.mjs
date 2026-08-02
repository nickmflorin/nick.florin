import { toFormatOnlyConfig } from '@nickflorin/eslint-config-web/fast-formatting';

import config from './eslint.config.mjs';

/**
 * A modified version of the project's ESLint configuration, {@link config}, that is used for
 * local-development-only ESLint script(s) that are not used as a source of correctness but rather
 * just a formatter.
 *
 * Only auto-fixable rules are maintained, eliminating almost if not all type-aware rules and
 * computationally intensive rules, dramatically improving the performance of ESLint's format
 * pass in local development.
 *
 * This should *never* be used in production or CI environments.
 *
 * @see {@link toFormatOnlyConfig}
 */
export default toFormatOnlyConfig(config);
