/**
 * The lifetime applied to a cookie written by {@link setCookie}, in seconds.
 *
 * The cookies this module writes record a preference the visitor has expressed, so they outlive
 * the session deliberately rather than expiring with it.
 */
const CookieMaxAgeSeconds = 60 * 60 * 24 * 365;

/**
 * Reads a cookie from the document, returning `undefined` when it is not set — and always when
 * called during server rendering, where there is no document.
 *
 * Cookies are read in the browser rather than from the request on the server. Reading them on the
 * server would make the request an input to rendering, which costs every route its prerendered
 * shell; nothing in this application renders a cookie's value into server output.
 */
export const getCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') {
    return undefined;
  }
  const entry = document.cookie.split('; ').find(c => c.startsWith(`${name}=`));
  return entry === undefined ? undefined : decodeURIComponent(entry.slice(name.length + 1));
};

/**
 * Writes a cookie to the document, scoped to the whole site. Does nothing during server rendering.
 */
export const setCookie = (name: string, value: string): void => {
  if (typeof document === 'undefined') {
    return;
  }
  document.cookie =
    `${name}=${encodeURIComponent(value)}; path=/; ` +
    `max-age=${CookieMaxAgeSeconds}; samesite=lax`;
};
