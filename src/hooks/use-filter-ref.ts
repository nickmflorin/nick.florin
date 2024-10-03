import { useRef } from "react";

import { type Filters, type FilterFieldName, type FilterRefObj } from "~/lib/filters";

export const useFilterRef = <K extends FilterFieldName<F>, F extends Filters>() =>
  useRef<FilterRefObj<K, F>>(null);
