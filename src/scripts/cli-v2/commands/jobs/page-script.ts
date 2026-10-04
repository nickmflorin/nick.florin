import { Command, Option, UsageError } from 'clipanion';
import { z } from 'zod';

import { chooseOptionScript, FormScripts } from '~/scripts/job-search/applying/form-scripts';
import {
  openCardScript,
  PageScriptNames,
  PageScripts,
} from '~/scripts/job-search/discovery/page-scripts';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

const ScriptNames = [
  ...PageScriptNames,
  'choose-option',
  'combobox-options',
  'form-read',
  'open-card',
  'submission-result',
] as const;

/**
 * Prints a page script for the agent to run in a LinkedIn page through the browser server, so that
 * the scripts have one definition, in the repository, rather than being retyped.
 */
export class JobsPageScriptCommand extends JsonCommand {
  public static override paths = [['jobs', 'page-script']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Print a script that reads, or acts on, a LinkedIn jobs page or application form.',
    details: `
      \`result-cards\` reads the result cards and the applied filters of a search or the
      recommendations, and \`job-detail\` reads the opened posting; neither navigates, clicks or
      fetches. \`open-card\` clicks the result card with the given \`--company\` and \`--title\` and
      reads what the detail stage needs, which costs one page view.

      \`form-read\` reads the application form or Easy Apply step in view without changing it.
      \`combobox-options\` reads the options of the combobox whose menu was just opened through the
      browser server, and \`choose-option\` chooses the option reading \`--value\` from the open
      menu. \`submission-result\` waits for the confirmation that a submitted application went
      through, and reports the page's errors when none appears.

      Pass the printed \`function\` to the browser server's \`evaluate_script\` tool.
    `,
    examples: [
      ['Print the result-card reader', '$0 jobs page-script result-cards'],
      [
        'Print the script that opens one card',
        '$0 jobs page-script open-card --company "Hooli" --title "Senior Software Engineer"',
      ],
      ['Print the form reader', '$0 jobs page-script form-read'],
      ['Print the script that chooses an option', '$0 jobs page-script choose-option --value No'],
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
  public value = Option.String('--value', {
    description: 'The option to choose, for `choose-option`.',
  });

  protected run(): Promise<JsonResult> {
    return Promise.resolve({ function: this.script(), status: 'ok' });
  }

  private script(): string {
    switch (this.name) {
      case 'choose-option':
        if (this.value === undefined) {
          throw new UsageError('The choose-option script requires --value.');
        }
        return chooseOptionScript(this.value);
      case 'combobox-options':
      case 'form-read':
      case 'submission-result':
        return FormScripts[this.name];
      case 'job-detail':
      case 'result-cards':
        return PageScripts[this.name];
      case 'open-card':
        if (this.company === undefined || this.title === undefined) {
          throw new UsageError('The open-card script requires both --company and --title.');
        }
        return openCardScript({ company: this.company, title: this.title });
    }
  }
}
