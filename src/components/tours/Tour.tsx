"use client";
import dynamic from "next/dynamic";

import { useTour } from "./use-tour";

const WelcomeDialog = dynamic(() => import("~/components/dialogs/WelcomeDialog"), {
  ssr: false,
});

export const Tour = () => {
  const { error, modalIsOpen, waitingForTour, setTourIsOpen, setModalIsOpen } = useTour();

  if (modalIsOpen) {
    return (
      <WelcomeDialog
        isOpen={true}
        error={error}
        waitingForTour={waitingForTour}
        onStart={() => setTourIsOpen(true)}
        onClose={() => setModalIsOpen(false)}
      />
    );
  }
  return <></>;
};

export default Tour;
