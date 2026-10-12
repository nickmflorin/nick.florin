import { Command, Option } from 'clipanion';
import { z } from 'zod';

import { openLinkedInPage } from '~/scripts/job-search/browser/devtools';
import { resolveSessionContext } from '~/scripts/job-search/context';
import { openPoolMatches } from '~/scripts/job-search/discovery/open-pool';
import { devToolsDriver } from '~/scripts/job-search/discovery/page-driver';
import { nextFromPool } from '~/scripts/job-search/discovery/pool';

import { zodValidator } from '../../args/zod-validator';
import { JsonCommand, type JsonResult } from '../json-command';

/**
 * How many pooled candidates are returned when `--cap` is not given: about as many as one run opens
 * while leaving the day's page budget well clear of its limit.
 */
const DefaultCap = 20;

/**
 * Prints the most promising unopened candidates in a run's pool.
 */
export class JobsPoolNextCommand extends JsonCommand {
  public static override paths = [['jobs', 'pool', 'next']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description: "List the most promising unopened candidates in a run's pool.",
    details: `
      The pool holds every card-stage survivor of the run, once each by company and title. They are
      ranked by listed pay at or above the floor, then by an application needing no account, then by
      recency; candidates already recorded in the ledger — opened, or seen in an earlier run — are
      left out. \`remaining\` counts the unopened candidates beyond the cap.
    `,
    examples: [['List the next candidates to open', '$0 jobs pool next --run 2026-10-04-1']],
  });
  public cap = Option.String('--cap', {
    description: 'How many candidates to list at most.',
    validator: zodValidator(z.coerce.number().int().positive()),
  });
  public runId = Option.String('--run', { description: 'The run.', required: true });

  protected async run(): Promise<JsonResult> {
    return {
      ...(await nextFromPool(await resolveSessionContext(), this.runId, this.cap ?? DefaultCap)),
      status: 'ok',
    };
  }
}

/**
 * How many pooled postings `jobs pool open` opens when `--limit` is not given.
 */
const DefaultOpenLimit = 10;

/**
 * Opens the pooled postings that the LinkedIn page in view shows, and records them.
 */
export class JobsPoolOpenCommand extends JsonCommand {
  public static override paths = [['jobs', 'pool', 'open']];
  public static usage = Command.Usage({
    category: 'Jobs',
    description:
      "Open the run's pooled postings that the search page in view shows, and record them.",
    details: `
      LinkedIn's results differ on every load, so the ranked top of the pool is often absent from
      the page when it is reopened. This reads the cards of the page in view through the
      job-search Chrome's debugging port, matches them against the whole unopened pool by company
      and title, and opens the best-ranked matches, up to \`--limit\`. Each opening takes a page
      view first, receiving the grant before the browser acts. A card whose job identifier is
      known, as the recommendations page publishes it, is opened by loading the posting's own
      page; any other is clicked. A text is kept only when the page shows the target's own job
      identifier. The opened postings are triaged at the \`detail\` stage — pay, company size,
      sponsorship and the application system come from the posting — and the survivors are
      recorded as pending with their text attached, ready for scoring. \`facts\` returns the lines
      of each opened posting that state pay, size, sponsorship or an office arrangement, to read
      in context. The page must already be loaded. Stops, with the abort exit code, when the
      budget refuses, or the page turns into a security or sign-in page, after recording what it
      had opened.
    `,
    examples: [
      ['Open what the page shows', '$0 jobs pool open --run 2026-10-04-1'],
      ['Open at most five', '$0 jobs pool open --run 2026-10-04-1 --limit 5'],
    ],
  });
  public limit = Option.String('--limit', {
    description: 'How many postings to open at most.',
    validator: zodValidator(z.coerce.number().int().positive()),
  });
  public runId = Option.String('--run', { description: 'The run.', required: true });

  protected async run(): Promise<JsonResult> {
    const context = await resolveSessionContext();
    const page = await openLinkedInPage();
    try {
      return await openPoolMatches(
        context,
        devToolsDriver(page),
        this.runId,
        this.limit ?? DefaultOpenLimit,
      );
    } finally {
      page.close();
    }
  }
}
