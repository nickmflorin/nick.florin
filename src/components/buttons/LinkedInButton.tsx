import { getProfile } from "~/actions-v2/get-profile";

import { SocialButton } from "./SocialButton";

export const LinkedInButton = async (): Promise<JSX.Element> => {
  const profile = await getProfile();
  return (
    <SocialButton
      tight
      icon={{ name: "linkedin", iconStyle: "brands" }}
      href={profile?.linkedinUrl ?? "#"}
      className="hover:text-[#0a66c2]"
      openInNewTab
    />
  );
};
