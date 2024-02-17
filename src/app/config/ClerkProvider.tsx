"use client";
import { useRouter } from "next/navigation";
import { type ReactNode } from "react";

import { ClerkProvider as RootClerkProvider } from "@clerk/nextjs";

export interface ClerkProviderProps {
  readonly children: ReactNode;
}

export const ClerkProvider = ({ children }: ClerkProviderProps): JSX.Element => {
  const router = useRouter();
  return (
    <RootClerkProvider
      navigate={v => {
        router.push(v);
      }}
    >
      {children}
    </RootClerkProvider>
  );
};
