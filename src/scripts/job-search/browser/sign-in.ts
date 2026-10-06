import path from 'node:path';

import { z } from 'zod';

import { readYamlRecord, writeYamlRecord } from '../ledger/yaml-records';
import { TimestampSchema } from '../schemas';
import { type SessionContext, takeBudget } from '../session';

import { DebuggingPort } from './launch';

/**
 * How long after an automatic sign-in attempt another is refused, so that a failing sign-in is
 * never retried in a loop: repeated automated logins are what gets an account restricted.
 */
const AttemptIntervalMs = 6 * 60 * 60 * 1000;

const LoginUrl = 'https://www.linkedin.com/login';

/**
 * How long a navigation is given to settle — LinkedIn redirects a signed-in browser from the login
 * page to the feed — before the address is read.
 */
const NavigationSettleMs = 3000;

/**
 * The address of a LinkedIn security step — a verification code, a CAPTCHA, an identity check —
 * which only Nick may complete.
 */
const Checkpoint = /\/(?:checkpoint|challenge|authwall)\b/i;

const SignInPage = /\/(?:login|uas\/login|signin)\b/i;

const AttemptSchema = z.object({ attemptedAt: TimestampSchema }).strict();

const TargetsSchema = z.array(
  z.object({ type: z.string(), url: z.string(), webSocketDebuggerUrl: z.string() }).passthrough(),
);

export interface Credentials {
  readonly email: string;
  readonly password: string;
}

export type SignInResult =
  | { readonly reason: string; readonly status: 'refused' }
  | { readonly status: 'already-signed-in' | 'signed-in' };

/**
 * A connection to one page of the job-search Chrome over the DevTools protocol, through which the
 * sign-in runs in this process: the credentials never pass through the agent or its transcript.
 */
const connect = async (url: string) => {
  const socket = new WebSocket(url);
  await new Promise<void>((resolve, reject) => {
    socket.addEventListener('open', () => resolve(), { once: true });
    socket.addEventListener(
      'error',
      () => reject(new Error('The browser refused the connection.')),
      {
        once: true,
      },
    );
  });
  let nextId = 0;
  const send = (method: string, params: Record<string, unknown> = {}): Promise<unknown> =>
    new Promise((resolve, reject) => {
      nextId += 1;
      const id = nextId;
      const onMessage = (event: MessageEvent): void => {
        const message: unknown = JSON.parse(String(event.data));
        const parsed = z
          .object({
            error: z.object({ message: z.string() }).optional(),
            id: z.number(),
            result: z.unknown(),
          })
          .safeParse(message);
        if (!parsed.success || parsed.data.id !== id) {
          return;
        }
        socket.removeEventListener('message', onMessage);
        if (parsed.data.error === undefined) {
          resolve(parsed.data.result);
        } else {
          reject(new Error(`The browser failed '${method}': ${parsed.data.error.message}`));
        }
      };
      socket.addEventListener('message', onMessage);
      socket.send(JSON.stringify({ id, method, params }));
    });
  const evaluate = async (expression: string): Promise<unknown> =>
    z
      .object({ result: z.object({ value: z.unknown() }) })
      .parse(
        await send('Runtime.evaluate', { awaitPromise: true, expression, returnByValue: true }),
      ).result.value;
  return { close: () => socket.close(), evaluate, send };
};

type Page = Awaited<ReturnType<typeof connect>>;

const currentUrl = async (page: Page): Promise<string> =>
  z.string().parse(await page.evaluate('window.location.href'));

/**
 * Waits for the page to leave an address matching a pattern, or for the time to run out.
 */
const waitWhile = async (
  page: Page,
  pattern: RegExp,
  sleep: SessionContext['clock']['sleep'],
): Promise<string> => {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    /* eslint-disable-next-line no-await-in-loop -- Each check waits for the previous one. */
    const url = await currentUrl(page);
    if (!pattern.test(new URL(url).pathname) && !url.startsWith('about:')) {
      return url;
    }
    /* eslint-disable-next-line no-await-in-loop -- Each check waits for the previous one. */
    await sleep(500);
  }
  return currentUrl(page);
};

/**
 * Types text into the field a selector names, with the keyboard events a person's typing makes.
 */
const typeInto = async (page: Page, selector: string, text: string): Promise<void> => {
  await page.evaluate(
    `(() => { const el = document.querySelector(${JSON.stringify(selector)}); el.focus(); ` +
      'el.select(); })()',
  );
  await page.send('Input.insertText', { text });
};

export type CredentialsLookup =
  | { readonly credentials: Credentials; readonly status: 'found' }
  | { readonly reason: string; readonly status: 'refused' };

/**
 * Finds the LinkedIn credentials automatic sign-in uses: the values of the environment variables
 * the `signIn` settings name, when automatic sign-in is on and both are set.
 *
 * The variables are read from the process environment by name, rather than through the typed
 * environment, because their names are settings: `.env.local` is loaded into the environment
 * before any `jobs` command runs.
 *
 * @param {SessionContext['preferences']['signIn']} settings The `signIn` settings.
 * @param {Readonly<Record<string, string | undefined>>} environment The process environment.
 *
 * @returns {CredentialsLookup} The credentials, or why automatic sign-in may not run.
 */
export const lookUpCredentials = (
  { automatic, emailVariable, passwordVariable }: SessionContext['preferences']['signIn'],
  environment: Readonly<Record<string, string | undefined>>,
): CredentialsLookup => {
  if (!automatic) {
    return {
      reason: 'Automatic sign-in is off (signIn.automatic): Nick signs in by hand.',
      status: 'refused',
    };
  }
  const email = environment[emailVariable]?.trim() ?? '';
  const password = environment[passwordVariable] ?? '';
  return email === '' || password === ''
    ? {
        reason:
          `${emailVariable} or ${passwordVariable} is not set in .env.local: Nick signs in by ` +
          'hand in the job-search window.',
        status: 'refused',
      }
    : { credentials: { email, password }, status: 'found' };
};

/**
 * Signs into LinkedIn in the job-search Chrome with the credentials from the environment, once.
 *
 * With automatic sign-in off, or its environment variables unset, it refuses, and Nick signs in by
 * hand. It refuses as well within six hours of an earlier attempt, so that a failing sign-in is
 * never repeated. A verification code, a CAPTCHA or any other security step after the credentials
 * are submitted ends the attempt for Nick to finish: it is never answered here. Each page it loads
 * is taken from the day's budget.
 *
 * @param {SessionContext} context The ledger, the clock, the preferences and the data directory.
 * @param {Readonly<Record<string, string | undefined>>} environment
 *   The process environment, holding the variables the `signIn` settings name.
 *
 * @returns {Promise<SignInResult>} Whether the browser is signed in, or why it was not attempted.
 */
export const signInToLinkedIn = async (
  context: SessionContext,
  environment: Readonly<Record<string, string | undefined>>,
): Promise<SignInResult> => {
  const lookup = lookUpCredentials(context.preferences.signIn, environment);
  if (lookup.status === 'refused') {
    return lookup;
  }
  const { credentials } = lookup;
  const attemptFile = path.join(context.dataDirectory, 'browser', 'sign-in.yaml');
  const previous = await readYamlRecord(attemptFile, AttemptSchema);
  const now = context.clock.now();
  if (
    previous !== null &&
    now.getTime() - new Date(previous.attemptedAt).getTime() < AttemptIntervalMs
  ) {
    return {
      reason:
        `An automatic sign-in was already attempted at ${previous.attemptedAt}: Nick signs in ` +
        'by hand.',
      status: 'refused',
    };
  }
  const targets = TargetsSchema.parse(
    await (await fetch(`http://127.0.0.1:${DebuggingPort}/json/list`)).json(),
  ).filter(({ type }) => type === 'page');
  const target = targets.find(({ url }) => url.includes('linkedin.com')) ?? targets.at(0);
  if (target === undefined) {
    return { reason: 'The job-search Chrome has no open page.', status: 'refused' };
  }
  const page = await connect(target.webSocketDebuggerUrl);
  try {
    if (!SignInPage.test(new URL(await currentUrl(page)).pathname)) {
      const decision = await takeBudget(context, 'page-view');
      if (decision.status === 'refused') {
        return decision;
      }
      await page.send('Page.navigate', { url: LoginUrl });
      await context.clock.sleep(NavigationSettleMs);
      if (!SignInPage.test(new URL(await currentUrl(page)).pathname)) {
        return { status: 'already-signed-in' };
      }
    }
    await writeYamlRecord(attemptFile, { attemptedAt: now.toISOString() }, AttemptSchema);
    const decision = await takeBudget(context, 'page-view');
    if (decision.status === 'refused') {
      return decision;
    }
    await typeInto(page, '#username', credentials.email);
    await context.clock.sleep(400 + Math.floor(context.clock.random() * 600));
    await typeInto(page, '#password', credentials.password);
    await context.clock.sleep(300 + Math.floor(context.clock.random() * 500));
    await page.evaluate('document.querySelector(\'button[type="submit"]\').click()');
    const landed = new URL(await waitWhile(page, SignInPage, context.clock.sleep));
    if (Checkpoint.test(landed.pathname)) {
      return {
        reason: 'LinkedIn asked for a security check after sign-in: Nick completes it by hand.',
        status: 'refused',
      };
    } else if (SignInPage.test(landed.pathname)) {
      return {
        reason:
          'LinkedIn did not accept the sign-in: Nick checks the credentials and signs in by hand.',
        status: 'refused',
      };
    }
    return { status: 'signed-in' };
  } finally {
    page.close();
  }
};
