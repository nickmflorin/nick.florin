import {
  type WithoutTrailingSlashes,
  type WithoutLeadingSlashes,
  withoutLeadingSlashes,
  withoutTrailingSlashes,
} from "~/integrations/http";

import { type PathActive } from "./types";

export const UUID_PATH_PARAM_REGEX_STRING = "([0-9a-zA-z-]+)";
export const PATH_END_REGEX_STRING = "(?:\\/)?(\\?([^\\/]+)?(\\/)?)?$";

/**
 * Creates a regular expression that can be used to match a path with or without one or multiple
 * UUID path parameters and one or multiple query parameters.
 *
 * @example
 * // This regex will match all of the following:
 * // 1. "customers/407e42c3-4b3d-4f53-9263-4d5d3a4cd35a"
 * // 2. "customers/407e42c3-4b3d-4f53-9263-4d5d3a4cd35a/"
 * // 3. "/customers/407e42c3-4b3d-4f53-9263-4d5d3a4cd35a?name=X"
 * // 4. "/customers/407e42c3-4b3d-4f53-9263-4d5d3a4cd35a?name=X/"
 * const regex = createLeadingPathRegex("/customers/:id/");
 */
export const createLeadingPathRegex = (path: string, options?: { endPath?: boolean }): RegExp => {
  path = path.startsWith("/") ? path.substring(1) : path;
  path = path.endsWith("/") ? path.substring(0, path.length - 1) : path;
  if (options?.endPath !== false) {
    return new RegExp(
      `^/${path.replaceAll(":id", UUID_PATH_PARAM_REGEX_STRING)}${PATH_END_REGEX_STRING}`,
    );
  }
  return new RegExp(`^/${path.replaceAll(":id", UUID_PATH_PARAM_REGEX_STRING)}`);
};

export const pathIsActive = (path: PathActive, pathname: string): boolean => {
  if (!Array.isArray(path)) {
    if (path instanceof RegExp) {
      return path.test(pathname);
    } else if (typeof path === "boolean") {
      return path;
    } else if (typeof path === "function") {
      return path(pathname);
    }
    const regex = createLeadingPathRegex(path.leadingPath, { endPath: path.endPath });
    return pathIsActive(regex, pathname);
  }
  return path.map(p => pathIsActive(p, pathname)).includes(true);
};

export type GetUrlOptions<P extends string> = {
  readonly path?: P;
  readonly trailingSlash?: boolean;
};

type OptionalTrailingSlash<T extends string, O extends GetUrlOptions<string>> = O extends {
  trailingSlash: false;
}
  ? T
  : `${T}/`;

const LOCALHOST = "http://localhost:3000" as const;
type LocalHost = typeof LOCALHOST;

export type ApplicationUrl<O extends GetUrlOptions<P>, P extends string> = O extends {
  readonly path: infer P extends string;
}
  ?
      | OptionalTrailingSlash<`${LocalHost}/${WithoutTrailingSlashes<WithoutLeadingSlashes<P>>}`, O>
      | OptionalTrailingSlash<
          `https://${string}/${WithoutTrailingSlashes<WithoutLeadingSlashes<P>>}`,
          O
        >
  : OptionalTrailingSlash<LocalHost, O> | OptionalTrailingSlash<`https://${string}`, O>;

const withOptionalTrailingSlash = <T extends string, O extends GetUrlOptions<string>>(
  value: T,
  options: O,
): OptionalTrailingSlash<T, O> => {
  if (options.trailingSlash === false) {
    return value as OptionalTrailingSlash<T, O>;
  }
  return `${value}/` as OptionalTrailingSlash<T, O>;
};

const parseEnvironmentVariableUrl = (
  source: "NEXT_PUBLIC_SITE_URL" | "NEXT_PUBLIC_VERCEL_URL",
  url: string | undefined,
): string | undefined => {
  if (url) {
    if ((url.startsWith("http") && !url.startsWith("https")) || url.startsWith("/")) {
      throw new Error(`Detected invalid URL for environment variable '${source}': '${url}'!`);
    }
    return url.startsWith("https://")
      ? withoutTrailingSlashes(url)
      : `https://${withoutTrailingSlashes(url)}`;
  }
  return undefined;
};

export const getApplicationUrl = <O extends GetUrlOptions<P>, P extends string>(
  options: O,
): ApplicationUrl<O, P> => {
  let url: string;

  const publicSiteUrl = parseEnvironmentVariableUrl(
    "NEXT_PUBLIC_SITE_URL",
    process.env.NEXT_PUBLIC_SITE_URL,
  );
  if (publicSiteUrl) {
    url = publicSiteUrl;
  } else {
    const publicVercelURl = parseEnvironmentVariableUrl(
      "NEXT_PUBLIC_VERCEL_URL",
      process.env.NEXT_PUBLIC_VERCEL_URL,
    );
    if (publicVercelURl) {
      url = publicVercelURl;
    } else {
      url = LOCALHOST;
    }
  }
  if (options.path) {
    return withOptionalTrailingSlash(
      `${url}/${withoutTrailingSlashes(withoutLeadingSlashes(options.path))}`,
      options,
    ) as ApplicationUrl<O, P>;
  }
  return withOptionalTrailingSlash(url, options) as ApplicationUrl<O, P>;
};
