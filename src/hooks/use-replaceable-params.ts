import {
  useRouter,
  useSearchParams,
  usePathname,
  type ReadonlyURLSearchParams,
} from "next/navigation";
import { useCallback, useTransition } from "react";

import { type QueryParamValue, encodeQueryParam } from "~/lib/urls";

interface UseReplaceableParamsConfig {
  readonly overwriteParams?: boolean;
  readonly useTransition?: boolean;
}

export const useReplaceableParams = (
  config?: UseReplaceableParamsConfig,
): [ReadonlyURLSearchParams, (k: string, v: Exclude<QueryParamValue, undefined>) => void] => {
  const [_, transition] = useTransition();
  const { replace: _replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const replace = useCallback(
    (key: string, v: Exclude<QueryParamValue, undefined>) => {
      const overwriteParams = config?.overwriteParams ?? false;
      const withTransition = config?.useTransition ?? false;

      const params = new URLSearchParams(overwriteParams ? "" : searchParams?.toString());
      params.set(key, encodeQueryParam(v));
      if (withTransition) {
        transition(() => {
          _replace(`${pathname}?${params.toString()}`);
        });
      } else {
        _replace(`${pathname}?${params.toString()}`);
      }
    },
    [config, pathname, searchParams, _replace],
  );

  return [searchParams, replace];
};
