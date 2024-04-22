import { useSearchParams, type ReadonlyURLSearchParams } from "next/navigation";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import qs from "qs";

import { parseQuery } from "~/lib/urls";

interface UseMutableParamsConfig {
  readonly overwriteParams?: boolean;
  readonly useTransition?: boolean;
}

type SetOpts = { useTransition?: boolean; clear?: string | string[] | true };

type Set = {
  (key: string, v: unknown, opts?: SetOpts): void;
  (params: Record<string, unknown>, opts?: SetOpts): void;
};

export const useMutableParams = (
  config?: UseMutableParamsConfig,
): {
  params: ReadonlyURLSearchParams;
  set: Set;
  clear: (key: string | string[], opts?: { useTransition?: boolean }) => void;
} => {
  const [_, transition] = useTransition();
  const { push } = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const clear = useCallback(
    (param: string | string[], opts?: { useTransition?: boolean }) => {
      const withTransition =
        opts?.useTransition === undefined
          ? config?.useTransition === undefined ?? false
          : opts.useTransition;

      const pms = new URLSearchParams(params?.toString());
      const toDelete = Array.isArray(param) ? param : [param];
      for (const p of toDelete) {
        pms.delete(p);
      }
      if (withTransition) {
        transition(() => {
          push(`${pathname}?${pms.toString()}`);
          window.history.pushState(null, "", `?${pms.toString()}`);
        });
      } else {
        push(`${pathname}?${pms.toString()}`);
      }
    },
    [config, params, pathname, push],
  );

  const set: Set = useCallback(
    (arg0: string | Record<string, unknown>, arg1?: unknown | SetOpts, arg2?: SetOpts) => {
      let toSet: Record<string, unknown>;
      let options: SetOpts;
      if (typeof arg0 === "string") {
        options = arg2 ?? {};
        toSet = { [arg0]: arg1 as unknown };
      } else {
        options = (arg1 as SetOpts | undefined) ?? {};
        toSet = arg0;
      }

      const overwriteParams = config?.overwriteParams ?? options.clear === true;
      const withTransition =
        options.useTransition === undefined
          ? config?.useTransition === undefined ?? false
          : options.useTransition;

      const existing = parseQuery(new URLSearchParams(overwriteParams ? "" : params?.toString()));

      const pms: Record<string, unknown> = {
        ...existing,
        ...toSet,
      };

      if (options.clear && options.clear !== true) {
        const clr = Array.isArray(options.clear) ? options.clear : [options.clear];
        for (const c of clr) {
          delete pms[c];
        }
      }

      if (withTransition) {
        transition(() => {
          push(`${pathname}?${qs.stringify(pms, { allowEmptyArrays: true })}`);
        });
      } else {
        push(`${pathname}?${qs.stringify(pms, { allowEmptyArrays: true })}}`);
      }
    },
    [config, params, pathname, push],
  );

  return { params, set, clear };
};
