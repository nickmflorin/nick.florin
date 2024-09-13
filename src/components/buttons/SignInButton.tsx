import { SignInButton as RootSignInButton } from "@clerk/nextjs";

import { Button } from "~/components/buttons";
import { type ComponentProps } from "~/components/types";

export interface SignInButtonProps extends ComponentProps {}

export const SignInButton = (props: SignInButtonProps) => (
  <RootSignInButton>
    <Button.Solid {...props} scheme="primary" element="div">
      Sign In
    </Button.Solid>
  </RootSignInButton>
);
