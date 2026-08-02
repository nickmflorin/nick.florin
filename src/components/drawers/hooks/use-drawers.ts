import { use } from 'react';

import { DrawersContext } from '../context';
import { DrawerIds } from '../types';

export const useDrawers = () => {
  const ctx = use(DrawersContext);
  if (!ctx.isInScope) {
    throw new Error("The 'useDrawers' hook must be called within the 'DrawersProvider'!");
  }
  return { ...ctx, ids: DrawerIds };
};
