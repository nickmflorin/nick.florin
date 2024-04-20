"use client";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { useUser } from "@clerk/nextjs";

import { Loading } from "~/components/feedback/Loading";

export const SignInWrapper = ({ children }: { children: ReactNode }) => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <Loading isLoading={true} />;
  } else if (user) {
    redirect("/");
  }
  return <>{children}</>;
};

export default SignInWrapper;
