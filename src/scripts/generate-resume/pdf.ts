import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

import { PDFDocument } from 'pdf-lib';

import { stdout } from '~/support';

import { OutputDir, SheetPages } from './config';
import { pathExists } from './util';

const execFileAsync = promisify(execFile);

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
const ChromePrintFlags = ['--headless=new', '--disable-gpu', '--no-pdf-header-footer'];

const locateChrome = async (): Promise<string> => {
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

/**
 * Builds the name the PDF is written under, which carries the time it was generated.
 *
 * Every export is therefore uniquely named and previous ones are preserved beside it, so a resume
 * that has already been sent somewhere is never overwritten by a later regeneration.
 *
 * @param {Date} generatedAt The time the export was generated.
 *
 * @returns {string} The file name, of the form `Resume-Aug-03-2026-2:47pm.pdf`.
 */
const timestampedPdfName = (generatedAt: Date): string => {
  const date = generatedAt.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const time = generatedAt.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
    minute: '2-digit',
  });
  return `Resume-${date.replace(/,?\s/gu, '-')}-${time.replace(/\s/gu, '').toLowerCase()}.pdf`;
};

const assertPagesWereEmitted = async (): Promise<void> => {
  const emitted = await Promise.all(SheetPages.map(page => pathExists(page.path)));
  const missing = SheetPages.filter((_page, index) => !emitted[index]);
  if (missing.length !== 0) {
    throw new Error(
      `${missing.length} sheet page(s) have not been emitted: ` +
        `${missing.map(page => path.basename(page.path)).join(', ')}. Run the HTML step first.`,
    );
  }
};

/**
 * Prints each emitted sheet to its own single-page PDF and returns their paths in print order.
 *
 * Every sheet is printed as a separate document because that is what makes a mid-role page break
 * structurally impossible: a document containing exactly one fixed-size sheet can only ever
 * produce exactly one PDF page.
 */
const printSheets = async (chrome: string, directory: string): Promise<string[]> => {
  const printed: string[] = [];
  for (const page of SheetPages) {
    const target = path.join(directory, `${path.basename(page.path, '.html')}.pdf`);
    /* eslint-disable-next-line no-await-in-loop -- Chrome instances are run one at a time because
       concurrent headless instances contend for the same default user data directory. */
    await execFileAsync(chrome, [
      ...ChromePrintFlags,
      `--print-to-pdf=${target}`,
      pathToFileURL(page.path).href,
    ]);
    /* eslint-disable-next-line no-await-in-loop -- Part of the sequential print above; Chrome can
       exit successfully without having written anything, so each print is checked as it happens. */
    if (!(await pathExists(target))) {
      throw new Error(`Chrome produced no PDF for '${path.basename(page.path)}'.`);
    }
    printed.push(target);
    stdout.info(`Printed page ${page.number} of ${SheetPages.length}.`);
  }
  return printed;
};

const mergePdfs = async (sources: string[], target: string): Promise<void> => {
  const loaded = await Promise.all(
    sources.map(async source => PDFDocument.load(await fs.readFile(source))),
  );

  const merged = await PDFDocument.create();
  for (const source of loaded) {
    /* eslint-disable-next-line no-await-in-loop -- The pages are appended in order, so each copy
       must complete before the next one begins. */
    const pages = await merged.copyPages(source, source.getPageIndices());
    pages.forEach(page => merged.addPage(page));
  }

  await fs.writeFile(target, await merged.save());
};

/**
 * Converts the emitted sheet pages into a single print-ready PDF.
 *
 * Chrome is used here purely as a file-to-file converter: it is handed a path and writes a PDF,
 * with no app running, no automation framework driving it and no page it loads over the network.
 *
 * @param {Date} generatedAt The time the export was generated, which the file is named for.
 *
 * @returns {Promise<string>} The path the PDF was written to.
 */
export const generatePdf = async (generatedAt: Date): Promise<string> => {
  await assertPagesWereEmitted();

  const chrome = await locateChrome();
  stdout.info(`Printing with the Chrome executable at '${chrome}'.`);

  const target = path.join(OutputDir, timestampedPdfName(generatedAt));
  const scratch = await fs.mkdtemp(path.join(os.tmpdir(), 'resume-pdf-'));
  try {
    await mergePdfs(await printSheets(chrome, scratch), target);
  } finally {
    await fs.rm(scratch, { force: true, recursive: true });
  }

  stdout.complete(`Wrote the resume PDF to '${target}'.`);
  return target;
};
