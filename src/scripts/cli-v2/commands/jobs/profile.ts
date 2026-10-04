import { Command } from 'clipanion';

import { buildProfileDigest } from '~/scripts/job-search/profile/digest';
import { loadCareerContent } from '~/scripts/job-search/profile/load';

import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Writes the profile digest: the compact summary of the career content that the scoring agent
 * reads, and the source of every "years of experience with" answer on an application form.
 */
export class JobsProfileDigestCommand extends JsonCommand {
  public static override paths = [['jobs', 'profile', 'digest']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Summarize the career content for the scoring agent.',
    details: `
      Reads the roles, competencies and companies from the resume fixtures. Years of experience
      per competency are computed from the dates of the roles that list it, with overlapping roles
      counted once, unless the competency states its own experience.
    `,
    examples: [['Write the digest', '$0 jobs profile digest']],
  });

  protected async run(): Promise<JsonResult> {
    return { ...buildProfileDigest(await loadCareerContent(), new Date()), status: 'ok' };
  }
}
