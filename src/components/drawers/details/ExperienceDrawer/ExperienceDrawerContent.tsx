import { type ApiExperience } from "~/prisma/model";

import { DrawerContent } from "~/components/drawers/DrawerContent";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { ResumeModelDrawerTile } from "~/components/tiles/resume/ResumeModelDrawerTile";
import { classNames } from "~/components/types";

export interface ExperienceDrawerContentProps {
  readonly experience: ApiExperience<["skills", "details"]>;
}

export const ExperienceDrawerContent = ({ experience }: ExperienceDrawerContentProps) => {
  const { forwardEnabled, backEnabled } = useDrawers();
  return (
    <DrawerContent>
      <ResumeModelDrawerTile
        model={experience}
        titleProps={{
          className: classNames("pr-[30px]", { "pr-[100px]": forwardEnabled || backEnabled }),
        }}
      />
    </DrawerContent>
  );
};

export default ExperienceDrawerContent;
