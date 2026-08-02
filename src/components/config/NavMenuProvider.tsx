'use client';
import { type ReactNode, useState } from 'react';

import { MobileNavigationCutoff } from '~/components/constants';
import { useWindowResize } from '~/hooks';

import { NavMenuContext } from './context';

export const NavMenuProvider = ({ children }: { readonly children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  useWindowResize(w => {
    if (w.innerWidth > MobileNavigationCutoff) {
      setIsOpen(false);
    }
  });

  return (
    <NavMenuContext
      value={{
        close: () => setIsOpen(false),
        isInScope: true,
        isOpen,
        open: () => setIsOpen(true),
        setIsOpen,
        toggle: () => setIsOpen(v => !v),
      }}
    >
      {children}
    </NavMenuContext>
  );
};
