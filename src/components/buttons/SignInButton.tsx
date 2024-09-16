import { SignInButton as RootSignInButton } from "@clerk/nextjs";

import { Button, type ButtonProps } from "~/components/buttons";

export interface SignInButtonProps
  extends Omit<ButtonProps<"div">, "variant" | "scheme" | "size" | "element"> {}

export const SignInButton = (props: SignInButtonProps) => (
  <RootSignInButton>
    <Button.Solid {...props} scheme="primary" element="div" size="medium">
      Sign In
    </Button.Solid>
  </RootSignInButton>
);
