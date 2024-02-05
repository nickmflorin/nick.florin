"use client";
import { ReadonlyURLSearchParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

import { addQueryParamsToUrl, mergeQueryParams, type QueryParams } from "~/lib/urls";

import { useReferentialCallback } from "./useReferentialCallback";

type MutableReturnType = {
  readonly href: string;
  readonly params: ReadonlyURLSearchParams;
};

type MutableOptions = {
  readonly push?: true;
  readonly useTransition?: false;
};

export interface IQueryParams {
  readonly params: ReadonlyURLSearchParams;
  readonly pathname: string;
  readonly pending: boolean;
  readonly updateParams: (
    params: QueryParams,
    options?: MutableOptions & { readonly replaceExisting?: boolean },
  ) => MutableReturnType;
}

export const useQueryParams = (): IQueryParams => {
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const { push } = useRouter();
  const pathname = usePathname();

  /* Use a deep equality check for the memoization to prevent the function from changing its
     reference whenever the URL or pathname changes.  If the URL or pathname changes, the
     searchParams object will have a different reference, even if the actual query parameters and
     their values remains the same. */
  const updateParams = useReferentialCallback(
    (
      params: QueryParams,
      options?: MutableOptions & { readonly replaceExisting?: boolean },
    ): MutableReturnType => {
      const toUpdate =
        options?.replaceExisting === false
          ? new URLSearchParams()
          : new URLSearchParams(searchParams.toString());
      const newParams = mergeQueryParams(toUpdate, params);

      const href = addQueryParamsToUrl(pathname, newParams, {});
      if (options?.push === true) {
        if (options?.useTransition !== false) {
          startTransition(() => push(href));
        } else {
          push(href);
        }
      }
      return { params: new ReadonlyURLSearchParams(newParams), href };
    },
  );

  return { params: searchParams, pathname, pending, updateParams };
};
