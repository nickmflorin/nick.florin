import { use } from 'react';

import { NavigationContext } from '~/components/config/context';

export const useNavigation = () => {
  const ctx = use(NavigationContext);
  if (!ctx.isInScope) {
    throw new Error("The 'useNavigation' hook must be called within the 'NavigationProvider'!");
  }
  return ctx;
};
