import { getProfile } from "~/fetches/get-profile";

import { SocialButton } from "./SocialButton";

export const LinkedInButton = async (): Promise<JSX.Element> => {
  const profile = await getProfile();
  return (
    <SocialButton
      icon={{ name: "linkedin", iconStyle: "brands" }}
      size="medium"
      href={profile?.linkedinUrl ?? "#"}
    />
  );
};
