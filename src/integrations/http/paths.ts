export type WithoutLeadingSlashes<T extends string> = T extends `/${infer R extends string}`
  ? WithoutLeadingSlashes<R>
  : T;

export type WithoutTrailingSlashes<T extends string> = T extends `${infer R extends string}/`
  ? WithoutTrailingSlashes<R>
  : T;

export const withoutTrailingSlashes = <T extends string>(url: T): WithoutTrailingSlashes<T> => {
  let trimmed: string = url;
  while (trimmed.endsWith('/')) {
    trimmed = trimmed.slice(0, -1);
  }
  return trimmed as WithoutTrailingSlashes<T>;
};

export const withoutLeadingSlashes = <T extends string>(url: T): WithoutLeadingSlashes<T> => {
  let trimmed: string = url;
  while (trimmed.startsWith('/')) {
    trimmed = trimmed.slice(1);
  }
  return trimmed as WithoutLeadingSlashes<T>;
};
