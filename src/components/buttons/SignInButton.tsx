"use client";
import { SignInButton as RootSignInButton, SignedOut } from "@clerk/nextjs";

import { type ComponentProps } from "~/components/types";

import { IconButton } from "./generic";

export interface SignInButtonProps extends ComponentProps {}

export const SignInButton = (props: SignInButtonProps) => (
  <SignedOut>
    <RootSignInButton>
      <IconButton.Primary {...props} icon={{ name: "gear" }} size="xlarge" iconSize="medium" />
    </RootSignInButton>
  </SignedOut>
);
