'use client';
import dynamic from 'next/dynamic';

import { useTour } from './use-tour';

const WelcomeDialog = dynamic(
  () => import('~/components/dialogs/WelcomeDialog').then(mod => mod.WelcomeDialog),
  {
    ssr: false,
  },
);

/**
 * Drives the tour flow — the welcome dialog and the transition into the guided tour — and must be
 * rendered inside the tour provider, which the {@link Tour} gate mounts around it.
 */
export const TourFlow = () => {
  const { error, modalIsOpen, setModalIsOpen, setTourIsOpen } = useTour();

  if (modalIsOpen) {
    return (
      <WelcomeDialog
        error={error}
        isOpen
        onClose={() => setModalIsOpen(false)}
        onStart={() => setTourIsOpen(true)}
      />
    );
  }
  return null;
};
