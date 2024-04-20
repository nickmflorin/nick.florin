"use client";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { useUser } from "@clerk/nextjs";

import { Loading } from "~/components/feedback/Loading";
import { environment } from "~/environment";

export const ProtectedAdmin = ({ children }: { children: ReactNode }): JSX.Element => {
  const { user, isLoaded } = useUser();
  if (!isLoaded) {
    return <Loading isLoading={true} />;
  } else if (!user) {
    redirect(environment.get("NEXT_PUBLIC_CLERK_SIGN_IN_URL"));
  }
  return <>{children}</>;
};

export default ProtectedAdmin;
