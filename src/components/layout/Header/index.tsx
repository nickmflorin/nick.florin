import { SignInButton } from "~/components/buttons/SignInButton";
import { UserButton } from "~/components/buttons/UserButton";

export const Header = (): JSX.Element => (
  <header className="header">
    <div className="header__right">
      <UserButton />
      <SignInButton />
    </div>
  </header>
);
