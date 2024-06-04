import { useCookies } from "next-client-cookies";

import { Button } from "~/components/buttons";

import { Dialog } from "./Dialog";

export interface WelcomeDialogProps {
  readonly isOpen: boolean;
  readonly waitingForTour: boolean;
  readonly onClose: () => void;
  readonly onStart: () => void;
}

export const WelcomeDialog = ({ isOpen, waitingForTour, onStart, onClose }: WelcomeDialogProps) => {
  const cookies = useCookies();

  return (
    <Dialog.Provider isOpen={isOpen} onClose={onClose}>
      <Dialog className="w-[500px]">
        <Dialog.Close />
        <Dialog.Title>Welcome to my Personal Portfolio!</Dialog.Title>
        <Dialog.Content>
          <Dialog.Description>
            I hope you get a chance to take a look around, but first - a few quick things to help
            you find your way...
          </Dialog.Description>
        </Dialog.Content>
        <Dialog.Footer>
          <div className="flex flex-row items-center gap-[8px]">
            <Button.Secondary
              className="flex-1"
              onClick={() => {
                cookies.set("nick.florin:suppress-tour", "true");
                onClose();
              }}
            >
              Skip and don&apos;t ask again
            </Button.Secondary>
            <Button.Secondary className="flex-1" onClick={onClose}>
              Skip for now
            </Button.Secondary>
            <Button.Primary className="flex-1" onClick={() => onStart()} isLoading={waitingForTour}>
              Next
            </Button.Primary>
          </div>
        </Dialog.Footer>
      </Dialog>
    </Dialog.Provider>
  );
};

export default WelcomeDialog;