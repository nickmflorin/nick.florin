import { SignInButton } from "~/components/buttons/SignInButton";
import { UserButton } from "~/components/buttons/UserButton";

import { ProfileSection } from "./ProfileSection";

export const Header = (): JSX.Element => (
  <header className="header">
    <ProfileSection />
    <div className="header__right">
      <UserButton />
      <SignInButton />
    </div>
  </header>
);
