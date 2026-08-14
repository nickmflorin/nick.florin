import { type IssueCollector } from '../issues';
import { type AnyContentBinding, type LoadedContent, validateContentSet } from '../registry';
import { type ContentStore } from '../stores/content-store';

import { type AnyEntityChangeSet, planEntity, toWritePlan } from './plan';

/**
 * The direction of a sync, named for where the content is going. Both are the same operation with
 * the two stores swapped; the name exists for reporting and for the checks that only make sense in
 * one direction.
 */
export type SyncDirection = 'pull' | 'push';

export interface SyncPlanOptions {
  readonly bindings: readonly AnyContentBinding[];
  readonly source: ContentStore;
  readonly target: ContentStore;
}

/**
 * Reads both sides, validates the source as a set, and correlates them into the complete change
 * set — without writing anything.
 *
 * Reading and planning are deliberately separable from applying, so that the operator confirms a
 * plan computed outside any transaction. Blocking on a human answer with an interactive transaction
 * open would hold row locks for as long as the terminal sat unattended.
 */
export const planSync = async (
  options: SyncPlanOptions,
  issues: IssueCollector,
): Promise<AnyEntityChangeSet[]> => {
  const loaded: LoadedContent[] = [];
  const changeSets: AnyEntityChangeSet[] = [];

  for (const binding of options.bindings) {
    /* eslint-disable-next-line no-await-in-loop -- Entities are read in dependency order, and the
       database adapter reads through one transaction, which admits no concurrent operations. */
    const source = await options.source.read(binding, issues);
    /* eslint-disable-next-line no-await-in-loop -- See above. */
    const target = await options.target.read(binding, issues);
    loaded.push({ binding, records: source });
    changeSets.push(
      planEntity(binding, source, target, issues, options.target.writableFields(binding)),
    );
  }

  /* Cross-entity validation runs against the source as a whole, after every entity has been read,
     because a slug reference can only be resolved once the entity it names is loaded. */
  validateContentSet(loaded, issues);
  return changeSets;
};

/**
 * Applies a confirmed change set to the target, entity by entity in dependency order so that a
 * record is never written before the records it references.
 */
export const applySync = async (
  changeSets: readonly AnyEntityChangeSet[],
  target: ContentStore,
  issues: IssueCollector,
): Promise<void> => {
  for (const changeSet of changeSets) {
    /* eslint-disable-next-line no-await-in-loop -- Entities are written in dependency order inside
       one interactive transaction, which does not support concurrent operations. */
    await target.write(changeSet.binding, toWritePlan(changeSet), issues);
  }
};
