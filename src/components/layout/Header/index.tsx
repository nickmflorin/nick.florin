import { preloadProfile } from "~/actions-v2/get-profile";

import { LayoutMenuButton } from "~/components/buttons/LayoutMenuButton";
import { SiteDropdownMenu } from "~/features/site/components/SiteDropdownMenu";

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
