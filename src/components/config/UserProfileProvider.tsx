'use client';
import { type ReactNode, useState } from 'react';

import { useNavMenu } from '~/hooks';

import { UserProfileContext } from './context';

export const UserProfileProvider = ({ children }: { readonly children: ReactNode }) => {
  const { close: closeNavMenu } = useNavMenu();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <UserProfileContext
      value={{
        close: () => setIsOpen(false),
        isInScope: true,
        isOpen,
        open: () => {
          setIsOpen(true);
          setTimeout(() => {
            closeNavMenu();
          });
        },
      }}
    >
      {children}
    </UserProfileContext>
  );
};
