import { z } from 'zod';

import { DebuggingPort } from './launch';

const TargetsSchema = z.array(
  z.object({ type: z.string(), url: z.string(), webSocketDebuggerUrl: z.string() }).passthrough(),
);

const ResponseSchema = z.object({
  error: z.object({ message: z.string() }).optional(),
  id: z.number(),
  result: z.unknown(),
});

const EvaluationSchema = z.object({
  exceptionDetails: z
    .object({ exception: z.object({ description: z.string() }).partial().optional() })
    .passthrough()
    .optional(),
  result: z.object({ value: z.unknown() }).passthrough(),
});

/**
 * A connection to one page of the job-search Chrome over the DevTools protocol, alongside the
 * browser server's own: work that should not pass through the agent — typing credentials, carrying
 * a page script or a reading — runs through it in this process.
 *
 * @param {string} url The page's DevTools WebSocket address.
 *
 * @returns {Promise<DevToolsPage>} The open connection.
 */
export const connect = async (url: string) => {
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
        const parsed = ResponseSchema.safeParse(JSON.parse(String(event.data)));
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

export type DevToolsPage = Awaited<ReturnType<typeof connect>>;

/**
 * The open pages of the job-search Chrome, most recently used first, as the DevTools protocol lists
 * them.
 */
export const listPages = async () =>
  TargetsSchema.parse(
    await (await fetch(`http://127.0.0.1:${DebuggingPort}/json/list`)).json(),
  ).filter(({ type }) => type === 'page');

/**
 * Runs a script in the open page whose address contains a given part, and returns its value.
 *
 * @param {string} addressPart A part of the page's address, such as the posting's job id.
 * @param {string} expression The script, as an expression; a promise it gives is awaited.
 *
 * @throws {Error} If no open page's address contains the part, or the script throws.
 *
 * @returns {Promise<unknown>} The script's value, copied out of the page.
 */
export const evaluateInPage = async (addressPart: string, expression: string): Promise<unknown> => {
  const target = (await listPages()).find(({ url }) => url.includes(addressPart));
  if (target === undefined) {
    throw new Error(`No open page in the job-search Chrome has '${addressPart}' in its address.`);
  }
  const page = await connect(target.webSocketDebuggerUrl);
  try {
    return await page.evaluate(expression);
  } finally {
    page.close();
  }
};
