import { useCallback, useState } from 'react';

import { isUuid } from '~/lib/typeguards';

export const useId = (
  initialValue?: null | string,
): [null | string, (v: null | string) => void] => {
  const [id, setId] = useState(isUuid(initialValue) ? initialValue : null);

  const setValidatedId = useCallback((v: null | string) => {
    if (v === null || isUuid(v)) {
      return setId(v);
    }
  }, []);

  return [id, setValidatedId];
};
