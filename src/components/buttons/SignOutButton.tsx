import { SignOutButton as RootSignOutButton } from "@clerk/nextjs";

import { Button, type ButtonProps } from "~/components/buttons";

export interface SignOutButtonProps
  extends Omit<ButtonProps<"div">, "variant" | "scheme" | "size" | "element"> {}

export const SignOutButton = (props: SignOutButtonProps) => (
  <RootSignOutButton>
    <Button.Solid {...props} element="div" scheme="secondary" size="medium">
      Log Out
    </Button.Solid>
  </RootSignOutButton>
);
