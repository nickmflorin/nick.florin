import clsx from "clsx";

import { getProfile } from "~/fetches/get-profile";
import { ModelImage } from "~/components/images/ModelImage";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";

export interface ProfileSectionProps extends ComponentProps {}

export const ProfileSection = async (props: ProfileSectionProps): Promise<JSX.Element> => {
  const profile = await getProfile();

  return (
    <div {...props} className={clsx("flex flex-row gap-[16px] items-center", props.className)}>
      <ModelImage url={profile?.profileImageUrl} size={60} radius="full" priority={true} />
      <div className="flex flex-col">
        <Title order={4}>{profile ? `${profile.firstName} ${profile.lastName}` : ""}</Title>
        <Title order={5}>{profile ? profile.displayName : ""}</Title>
      </div>
    </div>
  );
};
