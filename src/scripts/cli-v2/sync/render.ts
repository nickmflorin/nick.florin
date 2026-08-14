/* The concrete modules are imported rather than the `~/database/content` barrel: the barrel
   re-exports the bindings, which reach the Prisma client and through it the logger and the
   environment configuration. A renderer that turns records into strings would then refuse to load
   without a fully populated environment. */
import { type ContentIssue } from '~/database/content/issues';
import { type ChangeClass, type LeafChange } from '~/database/content/sync/diff';
import { type AnyEntityChangeSet, hasChanges } from '~/database/content/sync/plan';

import { styled, type StyleRole } from '../output/styles';

/**
 * How wide a value may be rendered before it is elided. Prose fields run to several hundred
 * characters, and a diff that wraps them in full is one nobody reads to the end of.
 */
const ValueWidth = 96;

const ClassRoles = {
  additive: 'added',
  destructive: 'removed',
  reorder: 'reordered',
} as const satisfies Record<ChangeClass, StyleRole>;

const ClassMarkers = {
  additive: '+',
  destructive: '~',
  reorder: '↕',
} as const satisfies Record<ChangeClass, string>;

const render = (value: unknown): string => {
  if (value === undefined) {
    return '(absent)';
  }
  const collapsed = (typeof value === 'string' ? value : JSON.stringify(value)).replace(
    /\s+/g,
    ' ',
  );
  return collapsed.length > ValueWidth ? `${collapsed.slice(0, ValueWidth - 1)}…` : collapsed;
};

const renderChange = (change: LeafChange): string[] => {
  const marker = styled(ClassRoles[change.classification], ClassMarkers[change.classification]);
  const path = styled('emphasis', change.path);
  if (change.classification === 'reorder') {
    return [`      ${marker} ${path}  position ${render(change.before)} → ${render(change.after)}`];
  }
  if (change.before === undefined) {
    return [`      ${marker} ${path}  ${styled('added', render(change.after))}`];
  }
  return [
    `      ${marker} ${path}`,
    `        ${styled('removed', `- ${render(change.before)}`)}`,
    `        ${styled('added', `+ ${render(change.after)}`)}`,
  ];
};

const countByClass = (changeSets: readonly AnyEntityChangeSet[], target: ChangeClass): number =>
  changeSets.reduce(
    (total, changeSet) =>
      total +
      changeSet.records.reduce(
        (records, record) =>
          records + record.changes.filter(change => change.classification === target).length,
        0,
      ),
    0,
  );

/**
 * Renders one entity's planned changes: creations named only, updates itemized down to the leaf,
 * and removals called out. Records that would not change are counted rather than listed, so the
 * output is proportional to what is actually happening.
 */
const renderEntity = (changeSet: AnyEntityChangeSet): string[] => {
  const creations = changeSet.records.filter(record => record.action === 'create');
  const updates = changeSet.records.filter(record => record.action === 'update');
  const unchanged = changeSet.records.length - creations.length - updates.length;

  const summary = [
    creations.length > 0 ? styled('added', `${creations.length} new`) : null,
    updates.length > 0 ? styled('changed', `${updates.length} changed`) : null,
    changeSet.deletions.length > 0
      ? styled('removed', `${changeSet.deletions.length} removed`)
      : null,
    changeSet.orphans.length > 0 ? styled('muted', `${changeSet.orphans.length} retained`) : null,
    unchanged > 0 ? styled('muted', `${unchanged} unchanged`) : null,
    changeSet.unwritable > 0
      ? styled('muted', `${changeSet.unwritable} not written by this direction`)
      : null,
  ].filter(part => part !== null);

  return [
    `  ${styled('emphasis', changeSet.binding.key)}  ${summary.join(', ')}`,
    ...creations.map(record => `    ${styled('added', `+ ${record.slug}`)}`),
    ...updates.flatMap(record => [
      `    ${styled('changed', `~ ${record.slug}`)}`,
      ...record.changes.flatMap(renderChange),
    ]),
    ...changeSet.deletions.map(
      record => `    ${styled('removed', `- ${changeSet.binding.slugOf(record)}`)}`,
    ),
  ];
};

/**
 * Renders the whole change set as one reviewable report, in the dependency order the writes will
 * follow.
 *
 * The report is what the operator confirms against, so it states the destructive total separately:
 * deletions and overwrites of authored values are the two failure modes the gate exists to prevent,
 * and a count of them is the one number worth reading before answering.
 */
export const renderChangeSets = (changeSets: readonly AnyEntityChangeSet[]): string => {
  const changed = changeSets.filter(hasChanges);
  if (changed.length === 0) {
    return styled('added', 'Both sides already agree; there is nothing to write.');
  }
  const destructive = countByClass(changed, 'destructive');
  const reordered = countByClass(changed, 'reorder');
  const removals = changed.reduce((total, entity) => total + entity.deletions.length, 0);

  return [
    ...changed.flatMap(renderEntity),
    '',
    destructive + removals + reordered === 0
      ? styled('added', 'Every change is additive.')
      : styled(
          'removed',
          `${destructive} value(s) overwritten or cleared, ${removals} record(s) removed, ` +
            `${reordered} reordered.`,
        ),
  ].join('\n');
};

/**
 * Renders the issues collected while planning. Warnings are advisory and the run continues past
 * them; errors abort it before anything is written, so they are rendered last and loudest.
 */
export const renderIssues = (issues: readonly ContentIssue[]): string =>
  issues
    .map(
      issue =>
        `  ${styled(
          issue.severity === 'error' ? 'removed' : 'warning',
          `${issue.severity} [${issue.entity}${issue.slug === null ? '' : `/${issue.slug}`}]`,
        )} ${issue.message}`,
    )
    .join('\n');
