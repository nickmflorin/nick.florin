import { useRef } from 'react';

import { type FilterFieldName, type FilterRefObj, type Filters } from '~/lib/filters';

export const useFilterRef = <K extends FilterFieldName<F>, F extends Filters>() =>
  useRef<FilterRefObj<K, F>>(null);
