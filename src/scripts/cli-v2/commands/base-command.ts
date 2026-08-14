import { Command } from 'clipanion';

import { Output, OutputAbortedError } from '../output/output';

/**
 * The exit codes the CLI reports.
 *
 * An abort is separated from a failure because they mean different things to whatever is reading
 * the code: a declined confirmation is the tool working correctly, while a failure is not.
 */
export const ExitCodes = {
  aborted: 2,
  failure: 1,
  success: 0,
} as const;

/**
 * The base every command in the CLI extends.
 *
 * It owns the parts of a run that must not be re-implemented per command: the terminal surface,
 * the framing of a run, and the translation of a thrown error into an exit code. Subclasses
 * implement {@link BaseCommand.run} and let anything they cannot handle propagate.
 */
export abstract class BaseCommand extends Command {
  /**
   * The label shown when the command starts, naming what is about to happen.
   */
  protected abstract readonly label: string;

  protected readonly output = new Output();

  protected abstract run(): Promise<void>;

  /**
   * Releases whatever the command acquired, whether or not it succeeded. The base acquires nothing,
   * so this does nothing until a subclass opens a database connection.
   */
  protected teardown(): Promise<void> {
    return Promise.resolve();
  }

  public async execute(): Promise<number> {
    this.output.intro(this.label);
    try {
      await this.run();
      return ExitCodes.success;
    } catch (error) {
      if (error instanceof OutputAbortedError) {
        this.output.warn(error.message);
        return ExitCodes.aborted;
      }
      this.output.error(error instanceof Error ? error.message : String(error));
      return ExitCodes.failure;
    } finally {
      await this.teardown();
    }
  }
}
