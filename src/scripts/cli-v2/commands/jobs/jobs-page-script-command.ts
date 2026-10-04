import { Command, Option, UsageError } from 'clipanion';
import { z } from 'zod';

import {
  openCardScript,
  PageScriptNames,
  PageScripts,
} from '~/scripts/job-search/discovery/page-scripts';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

const ScriptNames = [...PageScriptNames, 'open-card'] as const;

/**
 * Prints a page script for the agent to run in a LinkedIn page through the browser server, so that
 * the scripts have one definition, in the repository, rather than being retyped.
 */
export class JobsPageScriptCommand extends JsonCommand {
  public static override paths = [['jobs', 'page-script']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Print a script that reads, or opens a card on, a LinkedIn jobs page.',
    details: `
      \`result-cards\` reads the result cards and the applied filters of a search or the
      recommendations, and \`job-detail\` reads the opened posting; neither navigates, clicks or
      fetches. \`open-card\` clicks the result card with the given \`--company\` and \`--title\` and
      reads what the detail stage needs, which costs one page view. Pass the printed \`function\`
      to the browser server's \`evaluate_script\` tool.
    `,
    examples: [
      ['Print the result-card reader', '$0 jobs page-script result-cards'],
      [
        'Print the script that opens one card',
        '$0 jobs page-script open-card --company "Hooli" --title "Senior Software Engineer"',
      ],
    ],
  });
  public company = Option.String('--company', {
    description: 'The company of the card to open, for `open-card`.',
  });
  public name = Option.String({
    name: 'name',
    required: true,
    validator: zodValidator(z.enum(ScriptNames)),
  });
  public title = Option.String('--title', {
    description: 'The title of the card to open, for `open-card`.',
  });

  protected run(): Promise<JsonResult> {
    if (this.name !== 'open-card') {
      return Promise.resolve({ function: PageScripts[this.name], status: 'ok' });
    } else if (this.company === undefined || this.title === undefined) {
      throw new UsageError('The open-card script requires both --company and --title.');
    }
    return Promise.resolve({
      function: openCardScript({ company: this.company, title: this.title }),
      status: 'ok',
    });
  }
}
