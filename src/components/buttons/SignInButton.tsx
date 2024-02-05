"use client";
import { SignInButton as RootSignInButton, SignedOut } from "@clerk/nextjs";

import { IconButton } from "./IconButton";

export const SignInButton = () => (
  <SignedOut>
    <RootSignInButton>
      <IconButton.Primary icon={{ name: "gear" }} size="xlarge" iconSize="medium" />
    </RootSignInButton>
  </SignedOut>
);
