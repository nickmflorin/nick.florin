export type WithoutLeadingSlashes<T extends string> = T extends `/${infer R extends string}`
  ? WithoutLeadingSlashes<R>
  : T;

export type WithoutTrailingSlashes<T extends string> = T extends `${infer R extends string}/`
  ? WithoutTrailingSlashes<R>
  : T;

export const withoutTrailingSlashes = <T extends string>(url: T): WithoutTrailingSlashes<T> => {
  while (url.endsWith("/")) {
    url = url.slice(0, -1) as T;
  }
  return url as WithoutTrailingSlashes<T>;
};

export const withoutLeadingSlashes = <T extends string>(url: T): WithoutLeadingSlashes<T> => {
  while (url.startsWith("/")) {
    url = url.slice(1) as T;
  }
  return url as WithoutLeadingSlashes<T>;
};
