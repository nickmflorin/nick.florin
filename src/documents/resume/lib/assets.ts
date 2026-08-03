/**
 * The URL prefix under which the document's static assets (logos, icons and the profile photo)
 * are served.
 *
 * It defaults to the path the app serves from `public/documents/`, and is overridable via the
 * `DOCUMENT_ASSET_BASE_PATH` environment variable so the static generation script can emit HTML
 * whose asset references are relative, keeping the emitted files working over `file://` without a
 * server.
 */
const ASSET_BASE_PATH = process.env.DOCUMENT_ASSET_BASE_PATH ?? '/documents';

export function logo(filename: string): string {
  return `${ASSET_BASE_PATH}/logos/${filename}`;
}

/**
 * An icon is a logo referenced by basename, since every icon in the set is an SVG.
 */
export function icon(name: string): string {
  return logo(`${name}.svg`);
}
