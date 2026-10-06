import { pathExists } from './util';

/**
 * The locations a Chrome-family executable is looked for when `CHROME_PATH` is not set, in
 * preference order.
 *
 * Chrome is used strictly as a file-to-file print converter here, so any build of it will do; the
 * candidates simply cover the standard install locations on the platforms the resume is generated
 * from. Anything else is reachable by setting `CHROME_PATH`.
 */
const ChromeExecutableCandidates = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/opt/google/chrome/chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
];

/**
 * The flags Chrome prints a page with.
 *
 * The page size and margins are deliberately absent: they come from the document's own
 * `@page { size: Letter; margin: 0 }` rule, so that a page prints exactly as it renders on screen
 * and the two can never drift apart.
 */
export const ChromePrintFlags = ['--headless=new', '--disable-gpu', '--no-pdf-header-footer'];

/**
 * Finds the Chrome executable that prints documents to PDF: the one `CHROME_PATH` names, or the
 * first installed of the standard locations.
 *
 * @throws {Error} If `CHROME_PATH` names no file, or Chrome is installed in none of them.
 *
 * @returns {Promise<string>} The executable.
 */
export const locateChrome = async (): Promise<string> => {
  const override = process.env.CHROME_PATH;
  if (override !== undefined && override.trim().length !== 0) {
    if (!(await pathExists(override))) {
      throw new Error(
        `There is no executable at '${override}', which is the value of 'CHROME_PATH'.`,
      );
    }
    return override;
  }
  const installed = await Promise.all(
    ChromeExecutableCandidates.map(candidate => pathExists(candidate)),
  );
  const executable = ChromeExecutableCandidates.find((_candidate, index) => installed[index]);
  if (executable === undefined) {
    throw new Error(
      'A Chrome executable could not be found in any of its standard locations. Install ' +
        "Chrome, or point the 'CHROME_PATH' environment variable at an existing installation.",
    );
  }
  return executable;
};
