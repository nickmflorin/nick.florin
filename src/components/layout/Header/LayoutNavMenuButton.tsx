"use client";
import { IconButton } from "~/components/buttons";
import { useNavMenu } from "~/hooks";

export interface LayoutNavMenuButtonProps {}

export const LayoutNavMenuButton = () => {
  const { isOpen, setIsOpen } = useNavMenu();
  return (
    <IconButton.Solid
      scheme="secondary"
      element="button"
      icon={{ name: "bars" }}
      className="hidden max-xs:flex"
      isActive={isOpen}
      onClick={() => setIsOpen(!isOpen)}
    />
  );
};
