import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

import { type QueryParamValue, encodeQueryParam } from "~/lib/urls";

interface UseMutableParamsConfig {
  readonly overwriteParams?: boolean;
  readonly useTransition?: boolean;
}

type SetOpts = { useTransition?: boolean; clear?: string | string[] };

type Set = {
  (key: string, v: Exclude<QueryParamValue, undefined>, opts?: SetOpts): void;
  (params: Record<string, Exclude<QueryParamValue, undefined>>, opts?: SetOpts): void;
};

export const useMutableParams = (
  config?: UseMutableParamsConfig,
): {
  params: ReadonlyURLSearchParams;
  set: Set;
  clear: (key: string) => void;
} => {
  const [_, transition] = useTransition();
  // const { replace: _replace } = useRouter();
  const params = useSearchParams();
  // const pathname = usePathname();

  const clear = useCallback(
    (param: string, opts?: { useTransition?: boolean }) => {
      const withTransition =
        opts?.useTransition === undefined
          ? config?.useTransition === undefined ?? false
          : opts.useTransition;

      const pms = new URLSearchParams(params?.toString());
      pms.delete(param);
      if (withTransition) {
        transition(() => {
          // _replace(`${pathname}?${pms.toString()}`);
          window.history.pushState(null, "", `?${pms.toString()}`);
        });
      } else {
        // _replace(`${pathname}?${pms.toString()}`);
        window.history.pushState(null, "", `?${pms.toString()}`);
      }
    },
    [config, params],
  );

  const set: Set = useCallback(
    (
      arg0: string | Record<string, Exclude<QueryParamValue, undefined>>,
      arg1?: Exclude<QueryParamValue, undefined> | SetOpts,
      arg2?: SetOpts,
    ) => {
      let toSet: Record<string, Exclude<QueryParamValue, undefined>>;
      let options: SetOpts;
      if (typeof arg0 === "string") {
        options = arg2 ?? {};
        toSet = { [arg0]: arg1 as Exclude<QueryParamValue, undefined> };
      } else {
        options = (arg1 as SetOpts | undefined) ?? {};
        toSet = arg0;
      }

      const overwriteParams = config?.overwriteParams ?? false;
      const withTransition =
        options.useTransition === undefined
          ? config?.useTransition === undefined ?? false
          : options.useTransition;

      const pms = new URLSearchParams(overwriteParams ? "" : params?.toString());
      for (const [key, v] of Object.entries(toSet)) {
        pms.set(key, encodeQueryParam(v));
      }

      if (options.clear) {
        const clr = Array.isArray(options.clear) ? options.clear : [options.clear];
        for (const c of clr) {
          pms.delete(c);
        }
      }

      if (withTransition) {
        transition(() => {
          window.history.pushState(null, "", `?${pms.toString()}`);
          // _replace(`${pathname}?${pms.toString()}`);
        });
      } else {
        // _replace(`${pathname}?${pms.toString()}`);
        window.history.pushState(null, "", `?${pms.toString()}`);
      }
    },
    [config, params],
  );

  return { params, set, clear };
};
