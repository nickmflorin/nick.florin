import { db } from '~/database/prisma';

import { resolveScriptContext, type ScriptContext } from '../context/script-context';

import { BaseCommand } from './base-command';

/**
 * The base for a command that reads or writes the database as an authenticated user.
 *
 * It resolves the Clerk identity on first use rather than on construction, so that a run which
 * fails argument validation never pays for the network round trips, and it closes the database
 * connection afterwards whether or not the command succeeded.
 *
 * The resolved identity is deliberately not called `context`: Clipanion already puts its own
 * `context` — the streams a command reads and writes through — on every command instance.
 */
export abstract class ContextCommand extends BaseCommand {
  /**
   * Whether the Clerk user is written into the database when it is not already present.
   *
   * @default false
   */
  protected readonly upsertUser: boolean = false;
  private resolved: null | ScriptContext = null;

  protected async scriptContext(): Promise<ScriptContext> {
    this.resolved ??= await resolveScriptContext({ upsertUser: this.upsertUser });
    return this.resolved;
  }

  protected override async teardown(): Promise<void> {
    await db.$disconnect();
  }
}
