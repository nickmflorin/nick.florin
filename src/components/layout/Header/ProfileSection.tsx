import clsx from "clsx";

import { ModelImage } from "~/components/images/ModelImage";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";
import { type Profile } from "~/prisma/model";

export interface ProfileSectionProps extends ComponentProps {
  readonly profile: Profile;
}

export const ProfileSection = async ({
  profile,
  ...props
}: ProfileSectionProps): Promise<JSX.Element> => (
  <div {...props} className={clsx("flex flex-row gap-[16px] items-center", props.className)}>
    <ModelImage url={profile.profileImageUrl} size={60} radius="full" />
    <div className="flex flex-col">
      <Title order={4}>{`${profile.firstName} ${profile.lastName}`}</Title>
      <Title order={5}>{profile.displayName}</Title>
    </div>
  </div>
);
