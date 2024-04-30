import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useCallback } from "react";

import qs from "qs";

import { type QueryParamValue, decodeQueryParams, encodeQueryParams } from "~/lib/urls";

interface UseMutableParamsConfig {
  readonly overwriteParams?: boolean;
}

type SetOpts = { clear?: string | string[] | true };

type SetCallback = (existing: QueryParamValue | undefined) => QueryParamValue;

type Set = {
  (key: string, v: QueryParamValue, opts?: SetOpts): void;
  (key: string, v: SetCallback, opts?: SetOpts): void;
  (params: Record<string, QueryParamValue>, opts?: SetOpts): void;
};

export const useMutableParams = (
  config?: UseMutableParamsConfig,
): {
  params: ReadonlyURLSearchParams;
  set: Set;
  clear: (key: string | string[], opts?: { useTransition?: boolean }) => void;
} => {
  const { replace } = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const clear = useCallback(
    (param: string | string[]) => {
      const pms = new URLSearchParams(params?.toString());
      const toDelete = Array.isArray(param) ? param : [param];
      for (const p of toDelete) {
        pms.delete(p);
      }
      replace(`${pathname}?${pms.toString()}`);
    },
    [params, pathname, replace],
  );

  const set: Set = useCallback(
    (
      arg0: string | Record<string, QueryParamValue>,
      arg1?: QueryParamValue | SetCallback | SetOpts,
      arg2?: SetOpts,
    ) => {
      let options: SetOpts;
      if (typeof arg0 === "string") {
        options = arg2 ?? {};
      } else {
        options = (arg1 as SetOpts | undefined) ?? {};
      }

      const overwriteParams = config?.overwriteParams ?? options.clear === true;
      const existing = decodeQueryParams(
        new URLSearchParams(overwriteParams ? "" : params?.toString()),
      );

      let toSet: Record<string, QueryParamValue>;
      if (typeof arg0 === "string") {
        if (typeof arg1 === "function") {
          toSet = { [arg0]: arg1(existing[arg0]) };
        } else if (arg1 === undefined) {
          // This is not to satisfy TS, but rather to ensure proper implementation of the method.
          throw new TypeError(
            `Encountered undefined query parameter value for argument '${arg0}'!`,
          );
        } else {
          toSet = { [arg0]: arg1 as QueryParamValue };
        }
      } else {
        toSet = arg0;
      }

      const pms: Record<string, QueryParamValue> = {
        ...existing,
        ...toSet,
      };
      if (options.clear && options.clear !== true) {
        const clr = Array.isArray(options.clear) ? options.clear : [options.clear];
        for (const c of clr) {
          delete pms[c];
        }
      }
      const newUrl = `${pathname}?${encodeQueryParams(pms)}`;
      replace(newUrl, {});
    },
    [config, params, pathname, replace],
  );

  return { params, set, clear };
};
