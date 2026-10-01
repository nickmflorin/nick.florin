import path from 'node:path';

import { Command, Option, UsageError } from 'clipanion';
import { z } from 'zod';

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

import { zodValidator } from '../args/zod-validator';
import { renderChangeSets, renderIssues } from '../sync/render';

import { ContextCommand } from './context-command';

const FixturesDir = path.join(process.cwd(), 'src', 'documents', 'resume', 'fixtures');

/**
 * The write transaction's timeout, matched to the seed script's. A full push is several hundred
 * serial round trips — an interactive transaction admits no concurrency — which comfortably exceeds
 * Prisma's five-second default.
 */
const TransactionTimeout = 500000;

const Directions = ['pull', 'push'] as const;

const DirectionDescriptions = {
  pull: 'Read the database and rewrite the YAML fixtures to match it.',
  push: 'Read the YAML fixtures and write the database to match them.',
} as const satisfies Record<SyncDirection, string>;

/**
 * Moves resume content between the YAML fixture files and the database, in either direction, behind
 * a reviewed diff.
 *
 * Both directions are the same operation with the two stores swapped, because each side implements
 * the same storage port. The run reads and plans outside any transaction so that the operator
 * confirms a complete, itemized change set before a single row is locked, then applies the whole
 * plan inside one transaction so that it commits or rolls back as a unit.
 */
export class ContentSyncCommand extends ContextCommand {
  public static override paths = [['content', 'sync']];
  public static usage = Command.Usage({
    category: 'Content',
    description: 'Sync resume content between the YAML fixtures and the database.',
    details: `
      Plans the change set first and renders it in full, then asks before writing anything. The
      direction is asked for interactively when \`--direction\` is not given.

      A push applies inside one transaction, so it commits or rolls back as a unit. A pull rewrites
      fixture files, and the written YAML should be formatted afterwards with
      \`pnpm resume:fixtures:format\`.
    `,
    examples: [
      ['Choose a direction interactively', '$0 content sync'],
      ['Push every entity, without the confirmation', '$0 content sync --direction=push --yes'],
      [
        'Plan a pull of two entities without writing',
        '$0 content sync --direction=pull --entity=role --entity=course --dry-run',
      ],
    ],
  });
  protected readonly label = 'Content sync';
  public direction = Option.String('--direction', {
    description: 'Which way content moves: `push` (fixtures to database) or `pull` (the reverse).',
    validator: zodValidator(z.enum(Directions)),
  });
  public dryRun = Option.Boolean('--dry-run', false, {
    description: 'Plan and render the change set, then stop without writing.',
  });
  public entities = Option.Array('--entity', {
    description: 'Restrict the sync to one entity; repeatable. Defaults to every entity.',
  });
  public yes = Option.Boolean('--yes', false, {
    description: 'Skip the confirmation. Required when the terminal is not interactive.',
  });

  protected async run(): Promise<void> {
    const bindings = this.selectedBindings();
    const direction = await this.resolveDirection();
    const { user } = await this.scriptContext();

    const fixtures = new YamlFixtureStore(FixturesDir);
    /* The planning phase reads through the client directly rather than a transaction: nothing is
       written until the change set has been confirmed, and holding a transaction open across that
       wait would keep row locks for as long as the prompt goes unanswered. */
    const database = new PrismaContentStore(db, {
      inheritedCreatedAt: NoLegacyCreatedAt,
      userId: user.id,
    });

    const source: ContentStore = direction === 'push' ? fixtures : database;
    const target: ContentStore = direction === 'push' ? database : fixtures;

    const issues = new IssueCollector();
    const changeSets = await this.output.spin(
      `Planning a ${direction} of ${bindings.length} entities`,
      () => planSync({ bindings, source, target }, issues),
    );

    this.reportIssues(issues);
    issues.assertValid();

    this.output.write(renderChangeSets(changeSets));

    /* Whether anything changed decides only whether to run and what to ask; the run itself applies
       every entity. An entity whose records all compare equal may still hold rows whose stored form
       differs from the canonical one the comparison used, and its writes are idempotent anyway. */
    if (!changeSets.some(hasChanges)) {
      this.output.outro('Nothing to write.');
      return;
    }
    if (this.dryRun) {
      this.output.outro('Dry run: nothing was written.');
      return;
    }
    if (!this.yes && !(await this.output.confirm(`Apply this ${direction}?`, '--yes'))) {
      this.output.outro('Aborted; nothing was written.');
      return;
    }

    if (direction === 'pull') {
      await this.output.spin('Writing fixture files', () =>
        applySync(changeSets, fixtures, issues),
      );
      this.reportIssues(issues);
      this.output.success(`Wrote ${changeSets.length} fixture file(s).`);
      this.output.outro("Run 'pnpm resume:fixtures:format' to format them.");
      return;
    }

    await this.output.spin('Writing to the database', () =>
      db.$transaction(
        async tx => {
          const writeContext = {
            inheritedCreatedAt: await buildLegacyCreatedAtResolver(tx),
            userId: user.id,
          };
          await applySync(changeSets, new PrismaContentStore(tx, writeContext), issues);
        },
        { timeout: TransactionTimeout },
      ),
    );

    this.reportIssues(issues);
    this.output.outro(`Pushed ${changeSets.length} entities.`);
  }

  private reportIssues(issues: IssueCollector): void {
    if (issues.issues.length === 0) {
      return;
    }
    this.output.info(
      `Issues (${issues.errors.length} error(s), ${issues.warnings.length} warning(s)):`,
    );
    this.output.write(renderIssues(issues.issues));
  }

  private async resolveDirection(): Promise<SyncDirection> {
    return (
      this.direction ??
      this.output.select(
        'Which direction should content move?',
        Directions.map(direction => ({
          hint: DirectionDescriptions[direction],
          label: direction,
          value: direction,
        })),
      )
    );
  }

  /**
   * Resolves the entities the run covers, defaulting to all of them.
   *
   * The keys are checked against the registry rather than against a hard-coded list, so a binding
   * added to the registry is selectable here without this command being touched.
   */
  private selectedBindings(): typeof ContentBindings {
    const requested = (this.entities ?? []).map(entity => entity.trim()).filter(e => e.length > 0);
    if (requested.length === 0) {
      return ContentBindings;
    }
    const known = ContentBindings.map(binding => binding.key);
    const unrecognized = requested.filter(entity => !known.includes(entity));
    if (unrecognized.length > 0) {
      throw new UsageError(
        `Unknown entity '${unrecognized.join("', '")}'. The known entities are ` +
          `'${known.join("', '")}'.`,
      );
    }
    return ContentBindings.filter(binding => requested.includes(binding.key));
  }
}
