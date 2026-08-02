import { use } from 'react';

import { UserProfileContext } from '~/components/config/context';

export const useUserProfile = () => {
  const ctx = use(UserProfileContext);
  if (!ctx.isInScope) {
    throw new Error("The 'useUserProfile' hook must be called within the 'UserProfileProvider'!");
  }
  return ctx;
};
