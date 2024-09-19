import { useDrawers } from "~/components/drawers/hooks/use-drawers";

import { DrawerButtons } from "./DrawerButtons";

export interface ContextDrawerButtonsProps {
  readonly onClose?: () => void;
}

export const ContextDrawerButtons = ({ onClose }: ContextDrawerButtonsProps) => {
  const { close } = useDrawers();
  return (
    <DrawerButtons
      onClose={() => {
        close();
        onClose?.();
      }}
    />
  );
};
