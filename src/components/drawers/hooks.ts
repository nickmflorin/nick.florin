import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { type DrawerParam, parseSearchParams } from "./types";

export const useDrawerParams = () => {
  const searchParams = useSearchParams();
  return useMemo(() => parseSearchParams(searchParams), [searchParams]);
};

export const useDrawerParam = (param: DrawerParam) => {
  const params = useDrawerParams();
  return params[param];
};
