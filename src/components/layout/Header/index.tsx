import { preloadProfile } from "~/actions/fetches/get-profile";

import { SiteDropdownMenu } from "~/components/menus/SiteDropdownMenu";

import { LayoutNavMenuButton } from "./LayoutNavMenuButton";
import { ProfileSection } from "./ProfileSection";

export const Header = (): JSX.Element => {
  preloadProfile();
  return (
    <>
      <ProfileSection />
      <div className="header__right">
        <SiteDropdownMenu />
        <LayoutNavMenuButton />
      </div>
    </>
  );
};
