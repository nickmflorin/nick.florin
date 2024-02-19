import { type Profile } from "~/prisma/model";
import { GithubButton } from "~/components/buttons/GithubButton";
import { LinkedInButton } from "~/components/buttons/LinkedInButton";
import { UserButton } from "~/components/buttons/UserButton";

import { ProfileSection } from "./ProfileSection";

export const Header = (): JSX.Element => (
  <>
    <ProfileSection />
    <div className="header__right">
      <LinkedInButton />
      <GithubButton />
      <UserButton />
    </div>
  </>
);
