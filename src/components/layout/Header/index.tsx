import { SocialButton } from "~/components/buttons/SocialButton";
import { UserButton } from "~/components/buttons/UserButton";
import { type Profile } from "~/prisma/model";

import { ProfileSection } from "./ProfileSection";

export interface HeaderProps {
  /* The profile is allowed to be null to account for edge cases where a profile does not
     yet exist in the database. */
  readonly profile: Profile | null;
}

export const Header = ({ profile }: HeaderProps): JSX.Element => (
  <header className="header">
    {profile && <ProfileSection profile={profile} />}
    <div className="header__right">
      {profile?.linkedinUrl && (
        <SocialButton
          icon={{ name: "linkedin", iconStyle: "brands" }}
          size="medium"
          href={profile.linkedinUrl}
        />
      )}
      {profile?.githubUrl && (
        <SocialButton
          icon={{ name: "github", iconStyle: "brands" }}
          size="medium"
          href={profile.githubUrl}
        />
      )}
      <UserButton />
    </div>
  </header>
);
