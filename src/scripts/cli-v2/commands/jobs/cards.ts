import { Command, Option } from 'clipanion';

import { openLinkedInPage } from '~/scripts/job-search/browser/devtools';
import { resolveSessionContext } from '~/scripts/job-search/context';
import { parseCards } from '~/scripts/job-search/discovery/cards';
import {
  devToolsDriver,
  pageProblemOf,
  readPageCards,
} from '~/scripts/job-search/discovery/page-driver';
import { addToPool } from '~/scripts/job-search/discovery/pool';
import { type Candidate } from '~/scripts/job-search/schemas';
import { triageBatch } from '~/scripts/job-search/session';

import { JsonCommand, type JsonResult } from '../json-command';

/**
 * Reads the result cards of the LinkedIn page in view, converts them into candidates, and triages
 * them at the card stage in one step.
 */
export class JobsCardsReadCommand extends JsonCommand {
  public static override paths = [['jobs', 'cards', 'read']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description:
      'Read the result cards of the search or recommendations page in view and triage them.',
    details: `
      Reads the cards through the job-search Chrome's debugging port, as the \`result-cards\` page
      script does, and waits a few seconds for them to render when the page shows none yet. The
      page must already be loaded, which was a page view the agent took. Each card becomes a
      candidate — the company is the first line after the title's repeats, and the location,
      workplace, pay, age and Easy Apply come from its lines — which is triaged at the \`card\`
      stage and pooled for \`jobs pool next\`. \`--search\` names the search the page shows; without
      it the page is taken to be the recommendations. Cards whose text names no company are
      listed under \`unreadable\`, and \`filters\` reports what LinkedIn applied to the search.
      Refused, with the abort exit code, on a security or sign-in page.
    `,
    examples: [
      ['Triage the recommendations page', '$0 jobs cards read --run 2026-10-03-1'],
      [
        'Triage a search page',
        '$0 jobs cards read --run 2026-10-03-1 --search senior-frontend-remote',
      ],
    ],
  });
  public runId = Option.String('--run', {
    description: 'The open run the cards are read in.',
    required: true,
  });
  public search = Option.String('--search', {
    description: 'The name of the search the page shows; omit for the recommendations.',
  });

  protected async run(): Promise<JsonResult> {
    const context = await resolveSessionContext();
    const page = await openLinkedInPage();
    try {
      const reading = await readPageCards(devToolsDriver(page), context.clock.sleep);
      const problem = pageProblemOf(reading.url);
      if (problem !== null) {
        return {
          reason:
            `The page is not a jobs page (${reading.url}): finish the run with ` +
            `--ended-by ${problem}.`,
          status: 'refused',
        };
      }
      const { facts, unreadable } = parseCards(reading.cards, context.clock.now());
      const source: Candidate['source'] =
        this.search === undefined
          ? { kind: 'recommendations' }
          : { kind: 'search', search: this.search };
      const result = await triageBatch(
        context,
        this.runId,
        'card',
        facts.map(fact => ({ ...fact, source })),
      );
      return {
        ...result,
        filters: reading.filters,
        location: reading.location,
        pooled: await addToPool(context, this.runId, result.survivors),
        read: reading.cards.length,
        status: 'triaged',
        unreadable,
        url: reading.url,
      };
    } finally {
      page.close();
    }
  }
}
