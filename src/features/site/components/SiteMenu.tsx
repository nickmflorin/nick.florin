import dynamic from "next/dynamic";

import { useUser } from "@clerk/nextjs";

import { type BrandResume } from "~/prisma/model";

import { Button, IconButton } from "~/components/buttons";
import { NavMenuAnchor } from "~/components/buttons/NavMenuAnchor";
import { SignInButton } from "~/components/buttons/SignInButton";
import { SignOutButton } from "~/components/buttons/SignOutButton";
import { Avatar } from "~/components/images/Avatar";
import { type ISidebarItem, flattenSidebarItems } from "~/components/layout/types";
import { Menu } from "~/components/menus/Menu";
import { Label, Text } from "~/components/typography";
import { useUserProfile } from "~/hooks";

const OrganizationsMenuItemGroup = dynamic(() =>
  import("./OrganizationsMenuItemGroup").then(mod => mod.OrganizationsMenuItemGroup),
);

export interface SiteMenuProps {
  readonly nav?: ISidebarItem[];
  readonly resume: BrandResume | null;
  readonly onClose: (
    e: React.MouseEvent<HTMLButtonElement> | React.MouseEvent<HTMLDivElement>,
  ) => void;
}

export const SiteMenu = ({ nav, resume, onClose }: SiteMenuProps) => {
  const { isSignedIn, user } = useUser();
  const { open } = useUserProfile();

  return (
    <Menu className="site-menu">
      <Menu.Content className="flex flex-col justify-between gap-[8px]">
        <div className="flex flex-col gap-[8px]">
          {isSignedIn && user ? (
            <Menu.Item highlightOnHover={false} className="px-[6px] py-[6px]">
              <Avatar src={user.imageUrl} size="40px" />
              <div className="flex flex-col gap-1">
                <Label fontSize="sm">{user.fullName}</Label>
                <Text fontSize="xs">{user.emailAddresses[0]?.emailAddress}</Text>
              </div>
            </Menu.Item>
          ) : (
            <></>
          )}
          {isSignedIn ? <OrganizationsMenuItemGroup /> : <></>}
          {nav && nav.length !== 0 ? (
            <div className="flex flex-col gap-[4px]">
              {flattenSidebarItems(nav).map((item, index) => (
                <Menu.Item key={index} highlightOnHover={false} className="p-0">
                  <NavMenuAnchor item={item} />
                </Menu.Item>
              ))}
            </div>
          ) : (
            <></>
          )}
        </div>
        <div className="flex flex-col gap-[8px]">
          {resume ? (
            <Menu.Item
              highlightOnHover={false}
              id="site-dropdown-menu-resume-item"
              className="flex flex-row items-center gap-[8px] p-0"
            >
              <Button.Outlined
                element="a"
                className="grow"
                size="medium"
                href={resume.url}
                openInNewTab
                onClick={e => e.stopPropagation()}
              >
                View Resume
              </Button.Outlined>
              <IconButton.Solid
                element="a"
                scheme="primary"
                size="medium"
                icon={{ name: "cloud-arrow-down" }}
                href={resume.downloadUrl}
                target="_blank"
                onClick={e => e.stopPropagation()}
              />
            </Menu.Item>
          ) : (
            <></>
          )}
          {isSignedIn ? (
            <Menu.Item highlightOnHover={false} className="p-0">
              <Button.Outlined
                size="medium"
                element="button"
                onClick={e => {
                  open();
                  onClose(e);
                }}
                className="w-full"
              >
                Manage Account
              </Button.Outlined>
            </Menu.Item>
          ) : (
            <></>
          )}
          <Menu.Item className="p-0">
            {isSignedIn ? (
              <SignOutButton className="w-full" onClick={e => onClose(e)} />
            ) : (
              <SignInButton className="w-full" onClick={e => onClose(e)} />
            )}
          </Menu.Item>
        </div>
      </Menu.Content>
    </Menu>
  );
};
