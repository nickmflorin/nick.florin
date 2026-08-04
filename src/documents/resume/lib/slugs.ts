/**
 * Derives a URL-safe slug from a human-readable string.
 *
 * The input may carry inline HTML, because content titles do: tags and entities are stripped before
 * the remaining text is kebab-cased, so `Bundle Size &amp; First Load Performance` becomes
 * `bundle-size-first-load-performance`.
 *
 * @param {string} value The string to derive a slug from.
 *
 * @returns {string} The slug, which may be empty when the input holds no alphanumeric characters.
 */
export function slugify(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[#0-9a-z]+;/gi, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
