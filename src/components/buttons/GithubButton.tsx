import { getProfile } from "~/actions/fetches/get-profile";

import { SocialButton } from "./SocialButton";

export const GithubButton = async (): Promise<JSX.Element> => {
  const profile = await getProfile();
  return (
    <SocialButton
      icon={{ name: "github", iconStyle: "brands" }}
      href={profile?.githubUrl ?? "#"}
      className="hover:text-[#1f2328]"
    />
  );
};
