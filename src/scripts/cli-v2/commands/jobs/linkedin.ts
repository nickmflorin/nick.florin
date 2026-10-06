import { Command } from 'clipanion';

import { signInToLinkedIn } from '~/scripts/job-search/browser/sign-in';
import { resolveSessionContext } from '~/scripts/job-search/context';

import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Signs the job-search Chrome into LinkedIn with the credentials the settings point to.
 */
export class JobsLinkedInSignInCommand extends JsonCommand {
  public static override paths = [['jobs', 'linkedin', 'sign-in']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Sign the job-search Chrome into LinkedIn, when automatic sign-in is on.',
    details: `
      Runs only when \`signIn.automatic\` is on in the preferences and the environment variables
      \`signIn.emailVariable\` and \`signIn.passwordVariable\` name are set in \`.env.local\`;
      otherwise it refuses, and Nick signs in by hand. The credentials are typed by this command,
      over the browser's debugging port, and never printed. It makes one attempt, refuses another
      for six hours, and refuses — for Nick to finish — at any security check LinkedIn shows.
    `,
    examples: [['Sign in', '$0 jobs linkedin sign-in']],
  });

  protected async run(): Promise<JsonResult> {
    return signInToLinkedIn(await resolveSessionContext(), process.env);
  }
}
