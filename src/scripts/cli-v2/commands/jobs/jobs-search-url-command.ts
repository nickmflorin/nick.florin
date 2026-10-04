import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { resolveSessionContext } from '~/scripts/job-search/context';
import {
  buildSearchUrl,
  ExperienceLevels,
  searchNameFor,
} from '~/scripts/job-search/discovery/search-urls';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

const LevelChoices = ExperienceLevels.join(', ');

/**
 * Builds a LinkedIn job-search URL from keywords and the saved hard filters, as an entry ready for
 * the `searches` list in `preferences.yaml`.
 */
export class JobsSearchUrlCommand extends JsonCommand {
  public static override paths = [['jobs', 'search', 'url']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Build a LinkedIn job-search URL from keywords and the saved hard filters.',
    details: `
      The accepted workplaces and the posting-age limit come from \`preferences.yaml\` and are
      applied through LinkedIn's own filters, so postings they exclude never cost a page view.
      Results are ordered newest first.
    `,
    examples: [
      [
        'A remote-or-hybrid senior search, Easy Apply only',
        '$0 jobs search url --keywords "senior frontend engineer" --level mid-senior --easy-apply',
      ],
    ],
  });
  public easyApply = Option.Boolean('--easy-apply', false, {
    description: 'Restrict the search to postings that take an Easy Apply application.',
  });
  public keywords = Option.String('--keywords', {
    description: 'The search keywords.',
    required: true,
    validator: zodValidator(z.string().trim().min(1)),
  });
  public levels = Option.Array('--level', {
    description: `An experience level to restrict to; repeatable: ${LevelChoices}.`,
    validator: zodValidator(z.array(z.enum(ExperienceLevels))),
  });
  public location = Option.String('--location', {
    description: "The location to search within. Defaults to the LinkedIn profile's location.",
  });

  protected async run(): Promise<JsonResult> {
    const { preferences } = await resolveSessionContext();
    return {
      search: {
        name: searchNameFor(this.keywords),
        origin: 'generated',
        url: buildSearchUrl(
          {
            easyApplyOnly: this.easyApply,
            experienceLevels: this.levels ?? [],
            keywords: this.keywords,
            location: this.location ?? null,
          },
          preferences.hard,
        ),
      },
      status: 'ok',
    };
  }
}
