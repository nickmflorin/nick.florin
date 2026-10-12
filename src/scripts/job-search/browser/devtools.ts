import { z } from 'zod';

import { DebuggingPort } from './launch';

/**
 * The address of a LinkedIn security step — a verification code, a CAPTCHA, an identity check —
 * which only Nick may complete.
 */
export const Checkpoint = /\/(?:checkpoint|challenge|authwall)\b/i;

export const SignInPage = /\/(?:login|uas\/login|signin)\b/i;

const EvaluationSchema = z.object({
  exceptionDetails: z
    .object({ exception: z.object({ description: z.string() }).partial().optional() })
    .passthrough()
    .optional(),
  result: z.object({ value: z.unknown() }).passthrough(),
});

const TargetsSchema = z.array(
  z.object({ type: z.string(), url: z.string(), webSocketDebuggerUrl: z.string() }).passthrough(),
);

const MessageSchema = z.object({
  error: z.object({ message: z.string() }).optional(),
  id: z.number(),
  result: z.unknown(),
});

/**
 * A connection to one page of the job-search Chrome over the DevTools protocol, through which work
 * runs in this process: credentials and saved postings never pass through the agent's transcript.
 */
export const connect = async (url: string) => {
  const socket = new WebSocket(url);
  await new Promise<void>((resolve, reject) => {
    socket.addEventListener('open', () => resolve(), { once: true });
    socket.addEventListener(
      'error',
      () => reject(new Error('The browser refused the connection.')),
      { once: true },
    );
  });
  let nextId = 0;
  const send = (method: string, params: Record<string, unknown> = {}): Promise<unknown> =>
    new Promise((resolve, reject) => {
      nextId += 1;
      const id = nextId;
      const onMessage = (event: MessageEvent): void => {
        const parsed = MessageSchema.safeParse(JSON.parse(String(event.data)));
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
  const evaluate = async (expression: string): Promise<unknown> => {
    const { exceptionDetails, result } = EvaluationSchema.parse(
      await send('Runtime.evaluate', { awaitPromise: true, expression, returnByValue: true }),
    );
    if (exceptionDetails !== undefined) {
      throw new Error(
        `The page script failed: ${exceptionDetails.exception?.description ?? 'no description'}`,
      );
    }
    return result.value;
  };
  return { close: () => socket.close(), evaluate, send };
};

export type Page = Awaited<ReturnType<typeof connect>>;

/**
 * Connects to an open page of the job-search Chrome, preferring a LinkedIn one.
 *
 * @throws {Error} If the browser does not answer, or has no open page.
 *
 * @returns {Promise<Page>} The connection, which the caller closes.
 */
export const openLinkedInPage = async (): Promise<Page> => {
  let listing: unknown;
  try {
    listing = await (await fetch(`http://127.0.0.1:${DebuggingPort}/json/list`)).json();
  } catch (error) {
    throw new Error(
      'The job-search Chrome does not answer: run `pnpm --silent jobs browser launch` first.',
      { cause: error },
    );
  }
  const targets = TargetsSchema.parse(listing).filter(({ type }) => type === 'page');
  const target = targets.find(({ url }) => url.includes('linkedin.com')) ?? targets.at(0);
  if (target === undefined) {
    throw new Error('The job-search Chrome has no open page.');
  }
  return connect(target.webSocketDebuggerUrl);
};

/**
 * Connects to the open page of the job-search Chrome whose address contains a given part — an
 * employer's application form, which is not on LinkedIn.
 *
 * @param {string} addressPart A part of the page's address, such as a posting's job id.
 *
 * @throws {Error} If the browser does not answer, or no open page's address contains the part.
 *
 * @returns {Promise<Page>} The connection, which the caller closes.
 */
export const openPageContaining = async (addressPart: string): Promise<Page> => {
  let listing: unknown;
  try {
    listing = await (await fetch(`http://127.0.0.1:${DebuggingPort}/json/list`)).json();
  } catch (error) {
    throw new Error(
      'The job-search Chrome does not answer: run `pnpm --silent jobs browser launch` first.',
      { cause: error },
    );
  }
  const target = TargetsSchema.parse(listing).find(
    ({ type, url }) => type === 'page' && url.includes(addressPart),
  );
  if (target === undefined) {
    throw new Error(`No open page in the job-search Chrome has '${addressPart}' in its address.`);
  }
  return connect(target.webSocketDebuggerUrl);
};

/**
 * Evaluates a page script — the function expression `jobs page-script` prints — in a page.
 *
 * @param {Page} page The page to evaluate in.
 * @param {string} script The function expression.
 *
 * @returns {Promise<unknown>} What the script returned, awaited, as plain data.
 */
export const evaluateInPage = (page: Page, script: string): Promise<unknown> =>
  page.evaluate(`(${script})()`);

/**
 * Navigates a page to an address. The page may still be loading when this resolves.
 *
 * @param {Page} page The page to navigate.
 * @param {string} url The address to load.
 *
 * @returns {Promise<void>} Resolves once the browser has accepted the navigation.
 */
export const navigatePage = async (page: Page, url: string): Promise<void> => {
  await page.send('Page.navigate', { url });
};
