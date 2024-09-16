"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { type BrandResume } from "~/prisma/model";

import { type ISidebarItem } from "~/components/layout";
import { useNavMenu } from "~/hooks";

import { SiteMenu } from "./SiteMenu";

const UserProfileDialog = dynamic(() =>
  import("./UserProfileDialog").then(mod => mod.UserProfileDialog),
);

export interface ClientSiteNavMenuProps {
  readonly nav: ISidebarItem[];
  readonly resume: BrandResume | null;
}

export const ClientSiteNavMenu = async ({ nav, resume }: ClientSiteNavMenuProps) => {
  const [userProfileDialogIsOpen, setUserProfileDialogIsOpen] = useState(false);
  const { close } = useNavMenu();
  return (
    <>
      <SiteMenu
        resume={resume}
        nav={nav}
        onClose={() => close()}
        onOpenDialog={() => setUserProfileDialogIsOpen(true)}
      />
      {userProfileDialogIsOpen && (
        <UserProfileDialog isOpen={true} onClose={() => setUserProfileDialogIsOpen(false)} />
      )}
    </>
  );
};
