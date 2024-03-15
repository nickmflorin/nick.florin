import { useCallback, useState } from "react";

import { isUuid } from "~/lib/typeguards";

export const useId = (
  initialValue?: string | null,
): [string | null, (v: string | null) => void] => {
  const [id, _setId] = useState(isUuid(initialValue) ? initialValue : null);

  const setId = useCallback((v: string | null) => {
    if (v === null || isUuid(v)) {
      return _setId(v);
    }
  }, []);

  return [id, setId];
};
