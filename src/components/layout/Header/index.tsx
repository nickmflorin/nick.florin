import { preloadProfile } from "~/actions/fetches/get-profile";
import { GithubButton } from "~/components/buttons/GithubButton";
import { LinkedInButton } from "~/components/buttons/LinkedInButton";
import { UserButton } from "~/components/buttons/UserButton";

import { ProfileSection } from "./ProfileSection";

export const Header = (): JSX.Element => {
  preloadProfile();
  return (
    <>
      <ProfileSection />
      <div className="header__right">
        <LinkedInButton />
        <GithubButton />
        <UserButton />
      </div>
    </>
  );
};
