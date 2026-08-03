/**
 * Returns the URL prefix under which the document's static assets (logos, icons and the profile
 * photo) are served.
 *
 * It defaults to the path the app serves from `public/documents/`, and is overridable via the
 * `DOCUMENT_ASSET_BASE_PATH` environment variable so the static generation script can emit HTML
 * whose asset references are relative, keeping the emitted files working over `file://` without a
 * server.
 *
 * The variable is read on each call rather than once at module load so that the generation script
 * can set it without having to control the order in which this module is first imported.
 */
const assetBasePath = (): string => process.env.DOCUMENT_ASSET_BASE_PATH ?? '/documents';

export function logo(filename: string): string {
  return `${assetBasePath()}/logos/${filename}`;
}

/**
 * An icon is a logo referenced by basename, since every icon in the set is an SVG.
 */
export function icon(name: string): string {
  return logo(`${name}.svg`);
}
