import path from 'node:path';

import { Sheets } from '~/documents/resume/data/pages';

const RepoRoot = process.cwd();

export const PublicDir = path.join(RepoRoot, 'public');

export const LogosSourceDir = path.join(PublicDir, 'documents', 'logos');

export const DocumentStylesEntry = path.join(RepoRoot, 'src', 'styles', 'document', 'index.scss');

export const OutputDir = path.join(RepoRoot, 'build', 'documents', 'resume');

export const HtmlDir = path.join(OutputDir, 'html');

/**
 * The directory, relative to each emitted page, that every asset the document references is
 * emitted under.
 *
 * This doubles as the value that `DOCUMENT_ASSET_BASE_PATH` is set to while the pages are
 * rendered, so that the `src` attributes the components emit resolve as siblings of the page
 * rather than as root-absolute URLs, which do not resolve over `file://`.
 */
export const AssetsDirName = 'assets';

export const AssetsDir = path.join(HtmlDir, AssetsDirName);

/**
 * The directory the document's logos, icons and profile photo are emitted into.
 *
 * The trailing segment must match the one that the document's `logo` helper builds its URLs with,
 * since the pages reference these files by the URLs that helper returns.
 */
export const LogosOutputDir = path.join(AssetsDir, 'logos');

export const StylesheetName = 'style.css';

export const StylesheetPath = path.join(AssetsDir, StylesheetName);

/**
 * The URL the emitted pages reference the compiled stylesheet by, relative to a page sitting at
 * the root of the HTML output directory.
 */
export const StylesheetUrl = `${AssetsDirName}/${StylesheetName}`;

export const StackedPageName = 'index.html';

export const StackedPagePath = path.join(HtmlDir, StackedPageName);

export const ArtifactPath = path.join(OutputDir, 'resume.html');

/**
 * The emitted page files, in print order.
 *
 * The pages are derived from {@link Sheets} rather than discovered on disk, so the PDF step prints
 * exactly the sheets the content defines, in the order it defines them, with no dependence on
 * filename sorting.
 */
export const SheetPages = Sheets.map((sheet, index) => ({
  number: index + 1,
  path: path.join(HtmlDir, `${sheet.slug}.html`),
  sheet,
}));
