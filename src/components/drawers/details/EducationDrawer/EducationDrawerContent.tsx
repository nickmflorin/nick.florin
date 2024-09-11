import { type ApiEducation } from "~/prisma/model";

import { DrawerContent } from "~/components/drawers/DrawerContent";
import { useDrawers } from "~/components/drawers/hooks/use-drawers";
import { ResumeModelDrawerTile } from "~/components/tiles/resume/ResumeModelDrawerTile";
import { classNames } from "~/components/types";

export interface EducationDrawerContentProps {
  readonly education: ApiEducation<["courses", "skills", "details"]>;
}

export const EducationDrawerContent = ({ education }: EducationDrawerContentProps) => {
  const { forwardEnabled, backEnabled } = useDrawers();
  return (
    <DrawerContent>
      <ResumeModelDrawerTile
        model={education}
        titleProps={{
          className: classNames("pr-[30px]", { "pr-[100px]": forwardEnabled || backEnabled }),
        }}
      />
    </DrawerContent>
  );
};

export default EducationDrawerContent;
