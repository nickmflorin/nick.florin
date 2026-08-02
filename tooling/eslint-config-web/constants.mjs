/**
 * Marks a given rule with a warning level severity for purposes of grandfathering the rule in and
 * allowing existing violations to be fixed over time instead of all at once.
 *
 * All rules that reference this severity level via this constant should not exist in a permanent
 * 'warn' severity state.
 */
export const GrandfatherInRuleSeverity = 'warn';

/**
 * The top-level modules inside of the 'src' directory, grouped by the layer of the application that
 * they belong to.
 *
 * The groups are ordered from the lowest, most foundational layer of the application to the
 * highest, most user-facing layer.  This ordering drives the relative position that each group's
 * imports occupy inside of the 'internal' group of the 'import/order' rule, such that an import of
 * a lower layer always appears above an import of a higher layer.
 *
 * The same groups are used to prohibit parent-relative imports of any of these modules, which must
 * always be performed absolutely via the '~/' alias.
 */
export const ModuleGroups = [
  ['application', 'lib', 'server', 'database', 'internal', 'scripts', 'support'],
  ['app', 'actions', 'api', 'integrations', 'environment'],
  ['components', 'features', 'hooks', 'styles'],
];
