import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { PageScriptNames, PageScripts } from '~/scripts/job-search/discovery/page-scripts';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Prints a read-only page script for the agent to run in a LinkedIn page through the browser
 * server, so that the scripts have one definition, in the repository, rather than being retyped.
 */
export class JobsPageScriptCommand extends JsonCommand {
  public static override paths = [['jobs', 'page-script']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Print a read-only script that reads a LinkedIn jobs page.',
    details: `
      \`result-cards\` reads the result cards and the applied filters of a search or the
      recommendations; \`job-detail\` reads the opened posting. Neither navigates, clicks or
      fetches. Pass the printed \`function\` to the browser server's \`evaluate_script\` tool.
    `,
    examples: [['Print the result-card reader', '$0 jobs page-script result-cards']],
  });
  public name = Option.String({
    name: 'name',
    required: true,
    validator: zodValidator(z.enum(PageScriptNames)),
  });

  protected run(): Promise<JsonResult> {
    return Promise.resolve({ function: PageScripts[this.name], status: 'ok' });
  }
}
