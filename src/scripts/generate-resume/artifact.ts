import fs from 'node:fs/promises';
import path from 'node:path';

import { stdout } from '~/support';

import { ArtifactPath, HtmlDir, StackedPagePath } from './config';
import { pathExists, replaceAsync } from './util';

/**
 * The MIME types of every kind of asset the document is allowed to reference.
 *
 * The map is exhaustive rather than a lookup with a fallback: an asset of an unrecognized kind is
 * more likely to be a mistake than a deliberate addition, and a wrongly typed data URI fails
 * silently at render time.
 */
const MimeTypes: Record<string, string | undefined> = {
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

const StylesheetLink = /<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi;

const HrefAttribute = /\bhref=["']([^"']+)["']/i;

const AssetAttribute = /\b(href|src)=(["'])([^"']+)\2/gi;

const StylesheetAssetUrl = /url\((["']?)([^"')]+)\1\)/g;

const UnbundledReference = /\b(?:href|src)=["'](?!data:)([^"']+)["']/g;

type ReferenceResolution =
  | { readonly kind: 'external' }
  | { readonly kind: 'missing' }
  | { readonly kind: 'resolved'; readonly path: string };

const isExternal = (reference: string): boolean =>
  reference.startsWith('data:') || reference.includes('://');

const resolveReference = async (
  reference: string,
  baseDir: string,
): Promise<ReferenceResolution> => {
  const target = reference.split('?')[0].split('#')[0];
  if (isExternal(target)) {
    return { kind: 'external' };
  }
  const resolved = path.resolve(baseDir, target);
  return (await pathExists(resolved)) ? { kind: 'resolved', path: resolved } : { kind: 'missing' };
};

const dataUri = async (filePath: string): Promise<string> => {
  const extension = path.extname(filePath).toLowerCase();
  const mimeType = MimeTypes[extension];
  if (mimeType === undefined) {
    throw new Error(
      `The asset '${path.basename(filePath)}' has the extension '${extension}', which has no ` +
        'configured MIME type.',
    );
  }
  const contents = await fs.readFile(filePath);
  return `data:${mimeType};base64,${contents.toString('base64')}`;
};

const inlineStylesheetAssets = async (
  css: string,
  stylesheetPath: string,
  misses: string[],
): Promise<string> =>
  replaceAsync(css, StylesheetAssetUrl, async match => {
    const [, quote, reference] = match;
    const resolution = await resolveReference(reference, path.dirname(stylesheetPath));
    if (resolution.kind === 'resolved') {
      return `url(${quote}${await dataUri(resolution.path)}${quote})`;
    } else if (resolution.kind === 'missing') {
      misses.push(reference);
    }
    return match[0];
  });

const inlineStylesheets = async (html: string, misses: string[]): Promise<string> =>
  replaceAsync(html, StylesheetLink, async match => {
    const href = HrefAttribute.exec(match[0])?.[1];
    if (href === undefined) {
      return match[0];
    }
    const resolution = await resolveReference(href, HtmlDir);
    if (resolution.kind !== 'resolved') {
      if (resolution.kind === 'missing') {
        misses.push(href);
      }
      return match[0];
    }
    const css = await fs.readFile(resolution.path, 'utf8');
    return `<style>\n${await inlineStylesheetAssets(css, resolution.path, misses)}\n</style>`;
  });

const inlineAssetAttributes = async (html: string, misses: string[]): Promise<string> =>
  replaceAsync(html, AssetAttribute, async match => {
    const [, attribute, quote, reference] = match;
    const resolution = await resolveReference(reference, HtmlDir);
    if (resolution.kind === 'resolved') {
      return `${attribute}=${quote}${await dataUri(resolution.path)}${quote}`;
    } else if (resolution.kind === 'missing') {
      misses.push(reference);
    }
    return match[0];
  });

/**
 * Fails unless every reference the bundled document still carries points at a data URI or an
 * external host.
 *
 * A reference to a sibling file that survives bundling would resolve for whoever generated the
 * artifact and for nobody else, which is the one failure the artifact exists to make impossible.
 */
const assertNothingPointsAtASiblingFile = (html: string): void => {
  const unbundled = [...html.matchAll(UnbundledReference)]
    .map(match => match[1])
    .filter(reference => !isExternal(reference));
  if (unbundled.length !== 0) {
    throw new Error(
      `The bundled document still references ${unbundled.length} sibling file(s): ` +
        `${[...new Set(unbundled)].sort().join(', ')}.`,
    );
  }
};

/**
 * Bundles the stacked browsing view into a single self-contained HTML file.
 *
 * Everything the document references, including the stylesheet, the fonts it loads and every logo
 * and photograph, is inlined as a data URI, so the result is one file that can be emailed or
 * uploaded anywhere and renders identically with no network and no sibling assets.
 *
 * @returns {Promise<string>} The path the artifact was written to.
 */
export const buildArtifact = async (): Promise<string> => {
  if (!(await pathExists(StackedPagePath))) {
    throw new Error(
      `The stacked view has not been emitted to '${StackedPagePath}'. Run the HTML step first.`,
    );
  }

  const misses: string[] = [];
  const source = await fs.readFile(StackedPagePath, 'utf8');
  const bundled = await inlineAssetAttributes(await inlineStylesheets(source, misses), misses);

  if (misses.length !== 0) {
    throw new Error(
      `${misses.length} reference(s) in the document could not be resolved to a file: ` +
        `${[...new Set(misses)].sort().join(', ')}.`,
    );
  }
  assertNothingPointsAtASiblingFile(bundled);

  await fs.writeFile(ArtifactPath, bundled, 'utf8');

  const { size } = await fs.stat(ArtifactPath);
  stdout.complete(
    `Wrote the self-contained resume to '${ArtifactPath}' (${Math.round(size / 1024)} KB).`,
  );
  return ArtifactPath;
};
