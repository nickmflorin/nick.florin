"use client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { useUser } from "@clerk/nextjs";

import { Loading } from "~/components/feedback/Loading";

export const ProtectedAdmin = ({ children }: { children: ReactNode }): JSX.Element => {
  const { push } = useRouter();
  const { user, isLoaded } = useUser();
  if (!isLoaded) {
    return <Loading isLoading={true} />;
  } else if (!user) {
    push("/sign-in");
    return <></>;
  }
  return <>{children}</>;
};

export default ProtectedAdmin;
