"use client";
import dynamic from "next/dynamic";

import { useUserProfile } from "~/hooks";

const UserProfileDialog = dynamic(() => import("./UserProfileDialog"), { ssr: false });

export const UserProfile = () => {
  const { isOpen } = useUserProfile();

  return <>{isOpen && <UserProfileDialog isOpen={true} />}</>;
};
