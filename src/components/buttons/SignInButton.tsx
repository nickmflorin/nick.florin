import { SignInButton as RootSignInButton } from "@clerk/nextjs";

import { Button } from "~/components/buttons";
import { type ButtonClassNameStyleProps } from "~/components/buttons/util";

export interface SignInButtonProps
  extends Omit<ButtonClassNameStyleProps<"button", "button">, "variant" | "buttonType"> {}

export const SignInButton = (props: SignInButtonProps) => (
  <RootSignInButton>
    <Button.Primary {...props} as="div">
      Sign In
    </Button.Primary>
  </RootSignInButton>
);