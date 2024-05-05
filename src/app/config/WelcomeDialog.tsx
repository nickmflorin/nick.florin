"use client";
import { useState, type ReactNode, useLayoutEffect, useRef } from "react";

import { useCookies } from "next-client-cookies";

import { Dialog } from "~/components/floating/Dialog";
import { Checkbox } from "~/components/input/Checkbox";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import { Text } from "~/components/typography/Text";

interface WelcomeDialogProps {
  readonly children: ReactNode;
}

export const WelcomeDialog = ({ children }: WelcomeDialogProps) => {
  const cookies = useCookies();
  const [isOpen, setIsOpen] = useState(false);
  const wasChecked = useRef<boolean>(false);

  useLayoutEffect(() => {
    if (!wasChecked.current) {
      wasChecked.current = true;
      const cookie = cookies.get("nick.florin:suppress-welcome-dialog");
      if (cookie && cookie.toLocaleLowerCase() === "true") {
        return;
      }
      setIsOpen(true);
    }
    return () => {
      setIsOpen(false);
    };
  }, [cookies]);

  return (
    <Dialog.Provider isOpen={isOpen} onClose={() => setIsOpen(false)}>
      {children}
      <Dialog className="w-[500px]">
        <Dialog.Close />
        <Dialog.Title>Welcome to my Personal Portfolio!</Dialog.Title>
        <Dialog.Content>
          <Dialog.Description className="text-text">
            I hope you get a chance to take a look around.
          </Dialog.Description>
          <Dialog.Description fontSize="sm">
            <Text as="span" fontSize="sm" fontWeight="medium" className="text-text">
              Please note
            </Text>
            &nbsp;that this website is only a few months old, and is currently under active
            development.
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
