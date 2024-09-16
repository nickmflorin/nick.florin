"use client";
import { useState } from "react";

import { useOrganization, useOrganizationList } from "@clerk/nextjs";

import { Icon } from "~/components/icons/Icon";
import Spinner from "~/components/icons/Spinner";
import { MenuItem } from "~/components/menus/MenuItem";
import { MenuItemGroup, type MenuItemGroupProps } from "~/components/menus/MenuItemGroup";

export interface OrganizationsMenuItemGroupProps
  extends Omit<
    MenuItemGroupProps,
    "label" | "isLoading" | "labelContainerClassName" | "children"
  > {}

export const OrganizationsMenuItemGroup = (props: OrganizationsMenuItemGroupProps) => {
  const [changingToOrg, setChangingToOrg] = useState<string | null>(null);
  const { isLoaded, setActive, userMemberships } = useOrganizationList({
    userMemberships: {
      infinite: true,
    },
  });
  const { isLoaded: orgIsLoaded, organization } = useOrganization();

  return (
    <MenuItemGroup
      {...props}
      label="Organizations"
      isLoading={!isLoaded || !orgIsLoaded}
      labelContainerClassName="px-[6px] py-[4px]"
    >
      {(userMemberships.data ?? [])?.map(mem => (
        <MenuItem
          key={mem.id}
          contentClassName="gap-[16px]"
          onClick={async () => {
            setChangingToOrg(mem.organization.id);
            await setActive?.({ organization: mem.organization.id });
            setChangingToOrg(null);
          }}
        >
          <div className="w-[16px] h-[16px] flex flex-col items-center justify-center">
            {organization && organization.id === mem.organization.id ? (
              <Icon icon="check" size="14px" iconStyle="solid" className="text-green-600" />
            ) : mem.organization.id === changingToOrg ? (
              <Spinner size="14px" className="text-description" isLoading={true} />
            ) : (
              <></>
            )}
          </div>
          {mem.organization.name}
        </MenuItem>
      ))}
    </MenuItemGroup>
  );
};
