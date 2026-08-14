import { terminal } from '~/support';

import { type ContentIssue } from '../issues';

import { type ChangeClass, type LeafChange } from './diff';
import { type AnyEntityChangeSet, hasChanges } from './plan';

/**
 * How wide a value may be rendered before it is elided. Prose fields run to several hundred
 * characters, and a diff that wraps them in full is one nobody reads to the end of.
 */
const ValueWidth = 96;

const ClassColors = {
  additive: 'green',
  destructive: 'red',
  reorder: 'yellow',
} as const satisfies Record<ChangeClass, terminal.TerminalColor>;

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
  const marker = terminal.applyStyles(
    ClassMarkers[change.classification],
    ClassColors[change.classification],
  );
  const path = terminal.applyStyles(change.path, { effect: 'bright' });
  if (change.classification === 'reorder') {
    return [`      ${marker} ${path}  position ${render(change.before)} → ${render(change.after)}`];
  }
  if (change.before === undefined) {
    return [`      ${marker} ${path}  ${terminal.applyStyles(render(change.after), 'green')}`];
  }
  return [
    `      ${marker} ${path}`,
    `        ${terminal.applyStyles(`- ${render(change.before)}`, 'red')}`,
    `        ${terminal.applyStyles(`+ ${render(change.after)}`, 'green')}`,
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
    creations.length > 0 ? terminal.applyStyles(`${creations.length} new`, 'green') : null,
    updates.length > 0 ? terminal.applyStyles(`${updates.length} changed`, 'yellow') : null,
    changeSet.deletions.length > 0
      ? terminal.applyStyles(`${changeSet.deletions.length} removed`, 'red')
      : null,
    changeSet.orphans.length > 0
      ? terminal.applyStyles(`${changeSet.orphans.length} retained`, 'gray')
      : null,
    unchanged > 0 ? terminal.applyStyles(`${unchanged} unchanged`, 'gray') : null,
    changeSet.unwritable > 0
      ? terminal.applyStyles(`${changeSet.unwritable} not written by this direction`, 'gray')
      : null,
  ].filter(part => part !== null);

  return [
    `  ${terminal.applyStyles(changeSet.binding.key, { effect: 'bright' })}  ${summary.join(', ')}`,
    ...creations.map(record => `    ${terminal.applyStyles(`+ ${record.slug}`, 'green')}`),
    ...updates.flatMap(record => [
      `    ${terminal.applyStyles(`~ ${record.slug}`, 'yellow')}`,
      ...record.changes.flatMap(renderChange),
    ]),
    ...changeSet.deletions.map(
      record => `    ${terminal.applyStyles(`- ${changeSet.binding.slugOf(record)}`, 'red')}`,
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
    return terminal.applyStyles('Both sides already agree; there is nothing to write.', 'green');
  }
  const destructive = countByClass(changed, 'destructive');
  const reordered = countByClass(changed, 'reorder');
  const removals = changed.reduce((total, entity) => total + entity.deletions.length, 0);

  return [
    ...changed.flatMap(renderEntity),
    '',
    destructive + removals + reordered === 0
      ? terminal.applyStyles('Every change is additive.', 'green')
      : terminal.applyStyles(
          `${destructive} value(s) overwritten or cleared, ${removals} record(s) removed, ` +
            `${reordered} reordered.`,
          'red',
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
        `  ${terminal.applyStyles(
          `${issue.severity} [${issue.entity}${issue.slug === null ? '' : `/${issue.slug}`}]`,
          issue.severity === 'error' ? 'red' : 'yellow',
        )} ${issue.message}`,
    )
    .join('\n');
