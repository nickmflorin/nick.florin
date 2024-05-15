import { SignOutButton as RootSignOutButton } from "@clerk/nextjs";

import { Button } from "~/components/buttons";
import { type ButtonClassNameStyleProps } from "~/components/buttons/util";

export interface SignOutButtonProps
  extends Omit<ButtonClassNameStyleProps<"button", "button">, "variant" | "buttonType"> {}

export const SignOutButton = (props: SignOutButtonProps) => (
  <RootSignOutButton>
    <Button.Secondary {...props} as="div">
      Log Out
    </Button.Secondary>
  </RootSignOutButton>
);
