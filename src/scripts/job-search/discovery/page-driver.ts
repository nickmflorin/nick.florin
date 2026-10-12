import {
  Checkpoint,
  evaluateInPage,
  navigatePage,
  type Page,
  SignInPage,
} from '../browser/devtools';

import { type ResultCardsReading, ResultCardsReadingSchema } from './cards';
import { PageScripts } from './page-scripts';

/**
 * How a command drives the job-search Chrome's page: by running a page script in it and by loading
 * an address. The DevTools connection implements it; tests substitute a fake page.
 */
export interface PageDriver {
  /**
   * Navigates the page. The page may still be loading when this resolves.
   */
  readonly navigate: (url: string) => Promise<void>;
  /**
   * Runs a page script — the function expression `jobs page-script` prints — in the page.
   */
  readonly run: (script: string) => Promise<unknown>;
}

/**
 * Why a page must not be worked on: LinkedIn showed a security step, or the browser is signed out.
 */
export type PageProblem = 'challenge' | 'logged-out';

/**
 * How many times the result cards are read before a page is taken to show none, and how long to
 * wait between reads: LinkedIn renders the results a couple of seconds after navigation.
 */
export const CardReadAttempts = 6;

export const CardReadIntervalMs = 2000;

/**
 * Classifies a page address as a security step, a sign-in page, or neither.
 *
 * @param {string} url The page's address.
 *
 * @returns {PageProblem | null} The problem the address reveals, or `null` for an ordinary page.
 */
export const pageProblemOf = (url: string): null | PageProblem => {
  const { pathname } = new URL(url);
  if (Checkpoint.test(pathname)) {
    return 'challenge';
  }
  return SignInPage.test(pathname) ? 'logged-out' : null;
};

/**
 * Reads the result cards of the page in view, waiting for the results to render: it reads again,
 * after a short wait, while the page shows no cards, and stops at once on a security or sign-in
 * page.
 *
 * @param {PageDriver} driver The driver of the job-search Chrome's page.
 * @param {(milliseconds: number) => Promise<void>} sleep Waits between reads.
 *
 * @returns {Promise<ResultCardsReading>} The last reading, which holds no cards if none rendered.
 */
export const readPageCards = async (
  driver: PageDriver,
  sleep: (milliseconds: number) => Promise<void>,
): Promise<ResultCardsReading> => {
  let reading = ResultCardsReadingSchema.parse(await driver.run(PageScripts['result-cards']));
  for (
    let attempt = 1;
    attempt < CardReadAttempts && reading.cards.length === 0 && pageProblemOf(reading.url) === null;
    attempt += 1
  ) {
    /* eslint-disable-next-line no-await-in-loop -- Each read waits for the results to render. */
    await sleep(CardReadIntervalMs);
    /* eslint-disable-next-line no-await-in-loop -- Each read follows the wait before it. */
    reading = ResultCardsReadingSchema.parse(await driver.run(PageScripts['result-cards']));
  }
  return reading;
};

/**
 * Adapts a DevTools connection to the {@link PageDriver} the discovery commands work through.
 *
 * @param {Page} page The connection to the job-search Chrome's page.
 *
 * @returns {PageDriver} A driver that evaluates scripts and navigates over the connection.
 */
export const devToolsDriver = (page: Page): PageDriver => ({
  navigate: url => navigatePage(page, url),
  run: script => evaluateInPage(page, script),
});
