import { preloadProfile } from "~/actions/fetches/get-profile";

// import { UserButton } from "~/components/buttons/UserButton";
import { SiteDropdownMenu } from "~/components/menus/SiteDropdownMenu";
// import { OrganizationSwitcher } from "~/components/OrganizationSwitcher";

import { ProfileSection } from "./ProfileSection";

export const Header = (): JSX.Element => {
  preloadProfile();
  return (
    <>
      <ProfileSection />
      <div className="header__right">
        {/* <OrganizationSwitcher />
        <UserButton /> */}
        <SiteDropdownMenu />
      </div>
    </>
  );
};
