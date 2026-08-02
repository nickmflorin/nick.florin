'use client';
import dynamic from 'next/dynamic';

import { useTour } from './use-tour';

const WelcomeDialog = dynamic(
  () => import('~/components/dialogs/WelcomeDialog').then(mod => mod.WelcomeDialog),
  {
    ssr: false,
  },
);

export const Tour = () => {
  const { error, modalIsOpen, setModalIsOpen, setTourIsOpen, waitingForTour } = useTour();

  if (modalIsOpen) {
    return (
      <WelcomeDialog
        error={error}
        isOpen
        isWaitingForTour={waitingForTour}
        onClose={() => setModalIsOpen(false)}
        onStart={() => setTourIsOpen(true)}
      />
    );
  }
  return null;
};
