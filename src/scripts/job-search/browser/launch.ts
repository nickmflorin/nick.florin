import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

import { z } from 'zod';

import { pathExists } from '../fs';

/**
 * The port the job-search Chrome serves the DevTools protocol on, which the `job-search-browser`
 * server in `.mcp.json` attaches to through `--browserUrl`.
 */
export const DebuggingPort = 9222;

/**
 * The dedicated Chrome profile the job search runs in, kept apart from Nick's everyday browser.
 */
export const ProfileDirectory = path.join(os.homedir(), 'job-search', 'profiles', 'chrome');

const ChromeExecutable = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const DebuggerVersionSchema = z.object({ Browser: z.string() }).passthrough();

export type BrowserStatus =
  { readonly browser: string; readonly status: 'running' } | { readonly status: 'stopped' };

/**
 * Reports whether the job-search Chrome is running and accepting a debugger on its port.
 *
 * @returns {Promise<BrowserStatus>} The running browser's version, or that none answers.
 */
export const browserStatus = async (): Promise<BrowserStatus> => {
  try {
    const response = await fetch(`http://127.0.0.1:${DebuggingPort}/json/version`);
    if (!response.ok) {
      return { status: 'stopped' };
    }
    const body: unknown = await response.json();
    const parsed = DebuggerVersionSchema.safeParse(body);
    return parsed.success
      ? { browser: parsed.data.Browser, status: 'running' }
      : { status: 'stopped' };
  } catch {
    return { status: 'stopped' };
  }
};

/**
 * Launches the job-search Chrome as an ordinary window of the dedicated profile, with the DevTools
 * protocol served on {@link DebuggingPort}, and waits for it to answer.
 *
 * Launched this way rather than by the browser server, Chrome is not in test-automation mode: it
 * carries no `navigator.webdriver` flag and no automation banner, which application systems'
 * invisible bot checks score as a bot — Ashby rejected the first submission from an
 * automation-mode window as possible spam.
 *
 * @param {(milliseconds: number) => Promise<void>} sleep Waits between checks for the port.
 *
 * @throws {Error}
 *   If Chrome is not installed, or its port never answers — most often because another window of
 *   the profile, such as one the browser server launched itself, is still open.
 *
 * @returns {Promise<BrowserStatus & { readonly status: 'running' }>} The running browser.
 */
export const launchBrowser = async (
  sleep: (milliseconds: number) => Promise<void>,
): Promise<Extract<BrowserStatus, { status: 'running' }>> => {
  const current = await browserStatus();
  if (current.status === 'running') {
    return current;
  } else if (!(await pathExists(ChromeExecutable))) {
    throw new Error(`Google Chrome is not installed at '${ChromeExecutable}'.`);
  }
  spawn(
    ChromeExecutable,
    [
      `--user-data-dir=${ProfileDirectory}`,
      `--remote-debugging-port=${DebuggingPort}`,
      '--no-first-run',
      '--no-default-browser-check',
    ],
    { detached: true, stdio: 'ignore' },
  ).unref();
  for (let attempt = 0; attempt < 30; attempt += 1) {
    /* eslint-disable-next-line no-await-in-loop -- Each check waits for the previous one. */
    await sleep(500);
    /* eslint-disable-next-line no-await-in-loop -- Each check waits for the previous one. */
    const status = await browserStatus();
    if (status.status === 'running') {
      return status;
    }
  }
  throw new Error(
    `Chrome did not answer on port ${DebuggingPort}. Close any other window of the job-search ` +
      'profile — including one the browser server launched in automation mode — and launch again.',
  );
};
