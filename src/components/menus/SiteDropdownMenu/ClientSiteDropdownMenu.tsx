"use client";
import { useUser } from "@clerk/nextjs";

import { type BrandResume } from "~/prisma/model";

import { IconButton } from "~/components/buttons";
import { SignInButton } from "~/components/buttons/SignInButton";
import { SignOutButton } from "~/components/buttons/SignOutButton";
import { Icon } from "~/components/icons/Icon";
import { type ComponentProps } from "~/components/types";
import { Text } from "~/components/typography/Text";

import { DropdownMenu } from "../generic/DropdownMenu";
import { Menu } from "../generic/Menu";
import { MenuItem } from "../generic/MenuItem";

import { OrganizationsMenuItemGroup } from "./OrganizationsMenuItemGroup";

export interface ClientSiteDropdownMenuProps extends ComponentProps {
  readonly resume: BrandResume | null;
}

export const ClientSiteDropdownMenu = ({ resume, ...props }: ClientSiteDropdownMenuProps) => {
  const { isSignedIn } = useUser();

  return (
    <DropdownMenu
      {...props}
      placement="bottom-end"
      width={300}
      content={
        <div className="flex flex-col">
          <Menu isBordered itemClassName="px-[18px] py-[12px]">
            {resume && (
              <MenuItem
                id="site-dropdown-menu-resume-item"
                contentClassName="gap-[16px]"
                onClick={() => {
                  /* Note: We cannot use the 'href' property of a MenuItem because a button and/or
                     anchor element cannot be a descendant of a button and/or anchor element. */
                  window.open(resume.url, "_blank");
                }}
              >
                <Icon name="file-user" size="14px" iconStyle="solid" className="text-inherit" />
                <Text fontSize="xs" className="grow text-inherit">
                  Resume
                </Text>
                <IconButton.Secondary
                  as="button"
                  icon={{ name: "cloud-arrow-down" }}
                  onClick={e => {
                    e.stopPropagation();
                    window.open(resume.downloadUrl, "_blank");
                  }}
                />
              </MenuItem>
            )}
            {isSignedIn ? <OrganizationsMenuItemGroup /> : <></>}
            <div className="flex flex-row items-center px-[8px] py-[6px]">
              {isSignedIn ? (
                <SignOutButton className="w-full" />
              ) : (
                <SignInButton className="w-full" />
              )}
            </div>
          </Menu>
        </div>
      }
    >
      <IconButton.Secondary as="button" icon={{ name: "bars" }} id="site-dropdown-menu-button" />
    </DropdownMenu>
  );
};
