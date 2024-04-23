"use client";
import { useState, type ReactNode, useLayoutEffect } from "react";

import { useCookies } from "next-client-cookies";

import { Dialog } from "~/components/floating/Dialog";
import { Checkbox } from "~/components/input/Checkbox";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { Text } from "~/components/typography/Text";
import { environment } from "~/environment";

interface WelcomeDialogProps {
  readonly children: ReactNode;
}

export const WelcomeDialog = ({ children }: WelcomeDialogProps) => {
  const cookies = useCookies();
  const [isOpen, setIsOpen] = useState(false);

  useLayoutEffect(() => {
    // if (environment.get("NEXT_PUBLIC_WELCOME_TOAST") !== false) {
    const cookie = cookies.get("nick.florin:suppress-welcome-dialog");
    if (cookie && cookie.toLocaleLowerCase() === "true") {
      return;
    }
    setIsOpen(true);
    // }
  }, [cookies]);

  return (
    <Dialog.Provider isOpen={isOpen} onClose={() => setIsOpen(false)}>
      {children}
      <Dialog className="max-w-[500px]">
        <Dialog.Close />
        <Dialog.Title>Welcome to my Personal Portfolio!</Dialog.Title>
        <Dialog.Content>
          <Dialog.Description>Feel free to take a look around.</Dialog.Description>
          <Dialog.Description fontSize="sm">
            <Text span size="sm" fontWeight="medium" className="text-body">
              Please note
            </Text>{" "}
            that this website is only a few weeks old, and is currently not mobile-friendly. We
            suggest viewing on a desktop or laptop for the best experience.
          </Dialog.Description>
          <Checkbox
            label="Do not show this message again."
            onChange={e => {
              if (e.target.checked === true) {
                cookies.set("nick.florin:suppress-welcome-dialog", "true");
              } else {
                cookies.remove("nick.florin:suppress-welcome-dialog");
              }
            }}
          />
        </Dialog.Content>
        <Dialog.Footer>
          <ButtonFooter
            submitText="OK"
            submitButtonType="button"
            onSubmit={() => setIsOpen(false)}
          />
        </Dialog.Footer>
      </Dialog>
    </Dialog.Provider>
  );
};

export default WelcomeDialog;
