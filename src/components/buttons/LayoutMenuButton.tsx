"use client";
import { IconButton } from "~/components/buttons";
import { useNavMenu } from "~/hooks";

export const LayoutMenuButton = () => {
  const { isOpen, toggle } = useNavMenu();
  return (
    <IconButton.Solid
      scheme="secondary"
      element="button"
      icon={{ name: "bars" }}
      className="hidden max-[450px]:flex"
      isActive={isOpen}
      onClick={() => toggle()}
    />
  );
};
