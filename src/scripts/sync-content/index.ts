/**
 * Moves resume content between the YAML fixture files and the database, in either direction, behind
 * a reviewed diff.
 *
 * Both directions are the same operation with the two stores swapped, because each side implements
 * the same storage port. The run reads and plans outside any transaction so that the operator
 * confirms a complete, itemized change set before a single row is locked, then applies the whole
 * plan inside one transaction so that it commits or rolls back as a unit.
 */
import path from 'node:path';

import {
  applySync,
  buildLegacyCreatedAtResolver,
  ContentBindings,
  type ContentStore,
  hasChanges,
  IssueCollector,
  NoLegacyCreatedAt,
  planSync,
  PrismaContentStore,
  type SyncDirection,
  YamlFixtureStore,
} from '~/database/content';
import { db } from '~/database/prisma';
import { cli } from '~/scripts';
import { renderChangeSets, renderIssues } from '~/scripts/cli-v2/sync/render';
import { stdout } from '~/support';

import { confirm } from './confirm';

const FixturesDir = path.join(process.cwd(), 'src', 'documents', 'resume', 'fixtures');

/**
 * The write transaction's timeout, matched to the seed script's. A full push is several hundred
 * serial round trips — an interactive transaction admits no concurrency — which comfortably exceeds
 * Prisma's five-second default.
 */
const TransactionTimeout = 500000;

const Directions = ['pull', 'push'] as const;

const isDirection = (value: string): value is SyncDirection =>
  Directions.includes(value as SyncDirection);

const requestedDirection = (): SyncDirection => {
  const value = cli.getNamedArgument('direction', { defaultValue: 'push' }).trim().toLowerCase();
  if (!isDirection(value)) {
    throw new cli.InvalidCommandLineArgumentError(
      'direction',
      value,
      `The direction must be one of '${Directions.join("', '")}'.`,
    );
  }
  return value;
};

const requestedEntities = (): readonly string[] => {
  const requested = cli
    .getNamedArgument('entity', { defaultValue: '' })
    .split(',')
    .map(entity => entity.trim())
    .filter(entity => entity.length !== 0);
  const unrecognized = requested.filter(
    entity => !ContentBindings.some(binding => binding.key === entity),
  );
  if (unrecognized.length !== 0) {
    throw new cli.InvalidCommandLineArgumentError(
      'entity',
      unrecognized.join(','),
      `The known entities are '${ContentBindings.map(binding => binding.key).join("', '")}'.`,
    );
  }
  return requested;
};

const reportIssues = (issues: IssueCollector): void => {
  if (issues.issues.length > 0) {
    stdout.info(`Issues (${issues.errors.length} error(s), ${issues.warnings.length} warning(s)):`);
    /* eslint-disable-next-line no-console -- Standalone CLI tooling; the logger is not in
       context, and the rendering carries its own terminal styling. */
    console.log(renderIssues(issues.issues));
  }
};

const script: cli.Script = async ctx => {
  const direction = requestedDirection();
  const entities = requestedEntities();
  const isDryRun = cli.getBooleanCliArgument('dry-run', { defaultValue: false });
  const isConfirmed = cli.getBooleanCliArgument('yes', { defaultValue: false });

  const bindings =
    entities.length === 0
      ? ContentBindings
      : ContentBindings.filter(binding => entities.includes(binding.key));

  const fixtures = new YamlFixtureStore(FixturesDir);
  /* The planning phase reads through the client directly rather than a transaction: nothing is
     written until the change set has been confirmed, and holding a transaction open across that
     wait would keep row locks for as long as the prompt goes unanswered. */
  const readContext = { inheritedCreatedAt: NoLegacyCreatedAt, userId: ctx.user.id };
  const database = new PrismaContentStore(db, readContext);

  const source: ContentStore = direction === 'push' ? fixtures : database;
  const target: ContentStore = direction === 'push' ? database : fixtures;

  stdout.begin(`Planning a ${direction} of ${bindings.length} entities.`);
  const issues = new IssueCollector();
  const changeSets = await planSync({ bindings, source, target }, issues);

  reportIssues(issues);
  issues.assertValid();

  /* eslint-disable-next-line no-console -- See above. */
  console.log(renderChangeSets(changeSets));

  /* Whether anything changed decides only whether to run and what to ask; the run itself applies
     every entity. An entity whose records all compare equal may still hold rows whose stored form
     differs from the canonical one the comparison used, and its writes are idempotent anyway. */
  if (!changeSets.some(hasChanges)) {
    stdout.complete('Nothing to write.');
    return;
  }
  if (isDryRun) {
    stdout.complete('Dry run: nothing was written.');
    return;
  }
  if (!isConfirmed && !(await confirm(`Apply this ${direction}?`))) {
    stdout.warn('Aborted; nothing was written.');
    return;
  }

  if (direction === 'pull') {
    await applySync(changeSets, fixtures, issues);
    stdout.complete(
      `Wrote ${changeSets.length} fixture file(s). Run 'pnpm resume:fixtures:format'.`,
    );
    return;
  }

  await db.$transaction(
    async tx => {
      const writeContext = {
        inheritedCreatedAt: await buildLegacyCreatedAtResolver(tx),
        userId: ctx.user.id,
      };
      await applySync(changeSets, new PrismaContentStore(tx, writeContext), issues);
    },
    { timeout: TransactionTimeout },
  );

  reportIssues(issues);
  stdout.complete(`Pushed ${changeSets.length} entities.`);
};

void cli.runScript(script, { devOnly: false, upsertUser: false });
