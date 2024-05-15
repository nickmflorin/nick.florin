"use client";
import dynamic from "next/dynamic";

import { useTour } from "./use-tour";

const WelcomeDialog = dynamic(() => import("~/components/floating/dialogs/WelcomeDialog"), {
  ssr: false,
});

export const Tour = () => {
  const { modalIsOpen, waitingForTour, setTourIsOpen, setModalIsOpen } = useTour();

  if (modalIsOpen) {
    return (
      <WelcomeDialog
        isOpen={true}
        waitingForTour={waitingForTour}
        onStart={() => setTourIsOpen(true)}
        onClose={() => setModalIsOpen(false)}
      />
    );
  }
  return <></>;
};

export default Tour;
