import { type JSX, use, useEffect } from 'react';

import { DynamicLoadingContext } from './context';

export const DynamicLoader = (): JSX.Element | null => {
  const setLoading = use(DynamicLoadingContext);

  useEffect(() => {
    setLoading(true);
    return () => setLoading(false);
  }, [setLoading]);

  return null;
};
