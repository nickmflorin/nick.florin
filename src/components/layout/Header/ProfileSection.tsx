import clsx from "clsx";

import { logger } from "~/application/logger";
import { ModelImage } from "~/components/images/ModelImage";
import { type ComponentProps } from "~/components/types";
import { Title } from "~/components/typography/Title";
import { prisma } from "~/prisma/client";

export interface ProfileSectionProps extends ComponentProps {}

export const ProfileSection = async (props: ProfileSectionProps): Promise<JSX.Element> => {
  const profiles = await prisma.profile.findMany({ take: 1, orderBy: { createdAt: "desc" } });
  if (profiles.length === 0) {
    logger.error("No profile found!  The profile section will not be rendered.");
    return <></>;
  }
  const profile = profiles[0];
  return (
    <div {...props} className={clsx("flex flex-row gap-[16px] items-center", props.className)}>
      <ModelImage url={profile.profileImageUrl} size={60} radius="full" />
      <div className="flex flex-col">
        <Title order={4}>{`${profile.firstName} ${profile.lastName}`}</Title>
        <Title order={5}>{profile.displayName}</Title>
      </div>
    </div>
  );
};
