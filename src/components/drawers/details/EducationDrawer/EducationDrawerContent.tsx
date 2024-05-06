import clsx from "clsx";

import { type ApiEducation } from "~/prisma/model";
import { DrawerContent } from "~/components/drawers/DrawerContent";
import { useDrawers } from "~/components/drawers/hooks";
import { ResumeModelDrawerTile } from "~/components/tiles/resume/ResumeModelDrawerTile";

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
          className: clsx("pr-[30px]", { "pr-[100px]": forwardEnabled || backEnabled }),
        }}
      />
    </DrawerContent>
  );
};

export default EducationDrawerContent;
