"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

import { type BrandResume } from "~/prisma/model";

import { IconButton } from "~/components/buttons";
import { Loading } from "~/components/loading/Loading";
import { DropdownMenu, type DropdownMenuProps } from "~/components/menus/DropdownMenu";

const UserProfileDialog = dynamic(() =>
  import("./UserProfileDialog").then(mod => mod.UserProfileDialog),
);

const SiteMenu = dynamic(() => import("./SiteMenu").then(mod => mod.SiteMenu), {
  loading: () => <Loading isLoading={true} />,
});

export interface ClientSiteDropdownMenuProps
  extends Omit<DropdownMenuProps, "placement" | "width" | "content" | "children" | "triggers"> {
  readonly resume: BrandResume | null;
}

export const ClientSiteDropdownMenu = ({ resume, ...props }: ClientSiteDropdownMenuProps) => {
  const [userProfileDialogIsOpen, setUserProfileDialogIsOpen] = useState(false);

  return (
    <>
      <DropdownMenu
        {...props}
        placement="bottom-end"
        width={300}
        content={({ setIsOpen }) => (
          <div className="flex flex-col relative min-h-[40px] p-[8px]">
            <SiteMenu
              resume={resume}
              onClose={e => setIsOpen(false, e)}
              onOpenDialog={() => setUserProfileDialogIsOpen(true)}
            />
          </div>
        )}
      >
        <IconButton.Solid
          id="site-dropdown-menu-button"
          scheme="secondary"
          element="button"
          icon="bars"
          radius="sm"
          className="max-[450px]:hidden"
        />
      </DropdownMenu>
      {userProfileDialogIsOpen && (
        <UserProfileDialog isOpen={true} onClose={() => setUserProfileDialogIsOpen(false)} />
      )}
    </>
  );
};
