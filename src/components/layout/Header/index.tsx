import { preloadProfile } from "~/actions/fetches/get-profile";

import { SiteDropdownMenu } from "~/features/site/components/SiteDropdownMenu";

import { LayoutMenuButton } from "./LayoutMenuButton";
import { ProfileSection } from "./ProfileSection";

export const Header = (): JSX.Element => {
  preloadProfile();
  return (
    <>
      <ProfileSection />
      <div className="header__right">
        <SiteDropdownMenu />
        <LayoutMenuButton />
      </div>
    </>
  );
};
