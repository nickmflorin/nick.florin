import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { resolveSessionContext } from '~/scripts/job-search/context';
import { buildSearchUrl, searchNameFor } from '~/scripts/job-search/discovery/search-urls';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Builds a LinkedIn job-search URL for a query phrase, as an entry ready for the `searches` list in
 * `preferences.yaml`.
 */
export class JobsSearchUrlCommand extends JsonCommand {
  public static override paths = [['jobs', 'search', 'url']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: 'Build a LinkedIn job-search URL for a query phrase.',
    details: `
      LinkedIn's job search reads the query as natural language and discards most URL filters, so
      the phrase carries the workplace and location itself. The posting-age limit comes from
      \`preferences.yaml\`.
    `,
    examples: [
      ['A remote search', '$0 jobs search url --query "senior full stack engineer remote"'],
      [
        'A hybrid search in one city',
        '$0 jobs search url --query "senior software engineer hybrid Washington DC"',
      ],
    ],
  });
  public query = Option.String('--query', {
    description: 'The query phrase, including any workplace and location.',
    required: true,
    validator: zodValidator(z.string().trim().min(1)),
  });

  protected async run(): Promise<JsonResult> {
    const { preferences } = await resolveSessionContext();
    return {
      search: {
        name: searchNameFor(this.query),
        origin: 'generated',
        url: buildSearchUrl(this.query, preferences.hard),
      },
      status: 'ok',
    };
  }
}
