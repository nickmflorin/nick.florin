import fs from 'node:fs/promises';
import path from 'node:path';

import { type ReactElement } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';
import * as sass from 'sass';

import { stdout } from '~/support';

import { ResumeDocument } from '~/documents/resume/components/ResumeDocument';
import { ResumeDocumentSheet } from '~/documents/resume/components/ResumeDocumentSheet';

import {
  AssetsDir,
  AssetsDirName,
  DocumentStylesEntry,
  HtmlDir,
  LogosOutputDir,
  LogosSourceDir,
  PublicDir,
  SheetPages,
  StackedPagePath,
  StylesheetPath,
} from './config';
import { ResumeStaticDocument } from './ResumeStaticDocument';
import { pathExists } from './util';

/**
 * Matches a `url()` in a stylesheet whose target is root-absolute, capturing the optional quote
 * character and the reference itself.
 */
const RootAbsoluteStylesheetUrl = /url\((["']?)(\/[^"')]+)\1\)/g;

/**
 * Matches an asset reference in a document that would only resolve when the document is served
 * from the root of a domain.
 *
 * A page carrying one of these renders with the asset silently missing when it is opened off
 * disk, which is precisely how the PDF converter consumes it, so an emitted page containing one
 * fails the build rather than producing a PDF with holes in it.
 */
const RootAbsoluteDocumentReference = /\b(?:href|src)=["']\/(?!\/)/;

/**
 * Points the document's asset helpers at the emitted assets directory.
 *
 * By default the components build the root-absolute URLs that the app serves the assets from.
 * Those do not resolve over `file://`, so an emitted page has to reference its assets as siblings
 * instead.
 */
const pointAssetHelpersAtEmittedAssets = (): void => {
  process.env.DOCUMENT_ASSET_BASE_PATH = AssetsDirName;
};

/**
 * Matches the preload hints that React emits into the head for every image a document renders.
 *
 * Nothing an emitted page references is fetched over a network, so the hints save nothing, and
 * leaving them in place would make the single-file artifact inline every image a second time.
 */
const ImagePreloadHint = /<link\b[^>]*\brel="preload"[^>]*>/g;

const renderDocument = (element: ReactElement): string =>
  `<!doctype html>\n${renderToStaticMarkup(element).replace(ImagePreloadHint, '')}\n`;

/**
 * Copies a file that the compiled stylesheet references out of `public/` and into the emitted
 * assets directory, preserving the path it is referenced by.
 *
 * Preserving the path is what lets the reference be relativized by nothing more than dropping its
 * leading slash: the stylesheet sits at the root of the assets directory, so a reference to
 * `/fonts/x.woff2` resolves to `fonts/x.woff2` alongside it.
 */
const copyStylesheetAsset = async (reference: string): Promise<void> => {
  const source = path.join(PublicDir, reference);
  if (!(await pathExists(source))) {
    throw new Error(
      `The document stylesheet references '${reference}', which does not exist in 'public'.`,
    );
  }
  const destination = path.join(AssetsDir, reference);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(source, destination);
};

const emitStylesheet = async (): Promise<void> => {
  const { css } = await sass.compileAsync(DocumentStylesEntry, { style: 'expanded' });

  const references = new Set<string>();
  const relativized = css.replace(
    RootAbsoluteStylesheetUrl,
    (_match, quote: string, reference: string) => {
      references.add(reference);
      return `url(${quote}${reference.slice(1)}${quote})`;
    },
  );

  await Promise.all([...references].map(reference => copyStylesheetAsset(reference)));
  await fs.writeFile(StylesheetPath, relativized, 'utf8');

  stdout.info(`Compiled the document stylesheet, inlining ${references.size} asset reference(s).`);
};

const emitPages = async (): Promise<void> => {
  await fs.writeFile(
    StackedPagePath,
    renderDocument(
      <ResumeStaticDocument title=' - Resume'>
        <ResumeDocument />
      </ResumeStaticDocument>,
    ),
    'utf8',
  );

  await Promise.all(
    SheetPages.map(page =>
      fs.writeFile(
        page.path,
        renderDocument(
          <ResumeStaticDocument title={` - Resume - Page ${page.number}`}>
            <ResumeDocumentSheet sheet={page.sheet} />
          </ResumeStaticDocument>,
        ),
        'utf8',
      ),
    ),
  );

  stdout.info(`Rendered the stacked view and ${SheetPages.length} sheet page(s).`);
};

const assertReferencesAreRelative = async (): Promise<void> => {
  const emitted = [StackedPagePath, ...SheetPages.map(page => page.path)];
  const contents = await Promise.all(emitted.map(page => fs.readFile(page, 'utf8')));

  const offenders = emitted.filter((_page, index) =>
    RootAbsoluteDocumentReference.test(contents[index]),
  );
  if (offenders.length !== 0) {
    throw new Error(
      'Root-absolute asset references remain in the emitted document(s): ' +
        `${offenders.map(offender => path.basename(offender)).join(', ')}.`,
    );
  }
};

/**
 * Emits the resume as a directory of static HTML files that render identically whether they are
 * served or opened straight off disk.
 *
 * Nothing here depends on a running app, a browser or a network: the components are rendered to
 * markup in process, the stylesheet is compiled with the Sass API, and every asset either page
 * references is copied in beside it.
 */
export const emitStaticHtml = async (): Promise<void> => {
  pointAssetHelpersAtEmittedAssets();

  await fs.rm(HtmlDir, { force: true, recursive: true });
  await fs.mkdir(AssetsDir, { recursive: true });

  await Promise.all([emitStylesheet(), fs.cp(LogosSourceDir, LogosOutputDir, { recursive: true })]);
  await emitPages();
  await assertReferencesAreRelative();

  stdout.complete(`Emitted the static resume documents to '${HtmlDir}'.`);
};
