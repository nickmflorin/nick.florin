import { SignOutButton as RootSignOutButton } from "@clerk/nextjs";

import { Button } from "~/components/buttons";
import { type ComponentProps } from "~/components/types";

export interface SignOutButtonProps extends ComponentProps {}

export const SignOutButton = (props: SignOutButtonProps) => (
  <RootSignOutButton>
    <Button.Solid {...props} element="div" scheme="secondary">
      Log Out
    </Button.Solid>
  </RootSignOutButton>
);
