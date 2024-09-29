import { getProfile } from "~/actions/get-profile";

import { SocialButton } from "./SocialButton";

export const GithubButton = async (): Promise<JSX.Element> => {
  const profile = await getProfile();
  return (
    <SocialButton
      tight
      icon={{ name: "github", iconStyle: "brands" }}
      href={profile?.githubUrl ?? "#"}
      className="hover:text-github-black"
      openInNewTab
    />
  );
};
