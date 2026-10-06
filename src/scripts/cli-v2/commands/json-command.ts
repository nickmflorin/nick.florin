import { Command } from 'clipanion';

import { ExitCodes } from './base-command';

/**
 * The result of a {@link JsonCommand}, written to standard output as a single JSON document.
 *
 * `refused` is the status of an outcome that is correct but negative — a spent budget, an active
 * cooldown — and is reported with the abort exit code, so that a caller can branch on the exit code
 * alone.
 */
export interface JsonResult {
  readonly [field: string]: unknown;
  readonly status: string;
}

/**
 * The base for a command that an agent calls rather than a person: it writes exactly one JSON
 * document to standard output and nothing else, so that its output can be parsed without scraping.
 *
 * It deliberately does not extend {@link BaseCommand}, whose framing and styled messages are
 * written to the same stream and would corrupt the document. A failure is reported as a document
 * too, with the status `error` and the failure exit code.
 */
export abstract class JsonCommand extends Command {
  protected abstract run(): Promise<JsonResult>;

  private emit(result: JsonResult): void {
    this.context.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  }

  public async execute(): Promise<number> {
    try {
      const result = await this.run();
      this.emit(result);
      return result.status === 'refused' ? ExitCodes.aborted : ExitCodes.success;
    } catch (error) {
      this.emit({
        message: error instanceof Error ? error.message : String(error),
        status: 'error',
      });
      return ExitCodes.failure;
    }
  }
}
