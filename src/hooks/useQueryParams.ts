"use client";
import { ReadonlyURLSearchParams, useSearchParams, useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";

import { mergeQueryParams } from "~/lib/urls";

import { useReferentialCallback } from "./useReferentialCallback";

type Params<
  K extends string = string,
  V extends string | null | undefined = string | null,
> = Record<K, V>;

type MutableReturnType = {
  readonly href: string;
  readonly queryString: string | null;
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
    params: Params<string, string | null | undefined>,
    options?: MutableOptions & { readonly clearOthers?: true },
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
      params: Params<string, string | null | undefined>,
      options?: MutableOptions & { readonly clearOthers?: true },
    ): MutableReturnType => {
      const toUpdate = options?.clearOthers
        ? new URLSearchParams()
        : new URLSearchParams(searchParams.toString());
      const newParams = mergeQueryParams(toUpdate, params);

      let href = pathname;
      const queryString = newParams.toString();
      if (newParams.size !== 0 && queryString.length !== 0) {
        href = `${pathname}?${queryString}`;
      }
      if (options?.push === true) {
        if (options?.useTransition !== false) {
          startTransition(() => push(href));
        } else {
          push(href);
        }
      }
      return { params: new ReadonlyURLSearchParams(newParams), queryString, href };
    },
  );

  return { params: searchParams, pathname, pending, updateParams };
};
