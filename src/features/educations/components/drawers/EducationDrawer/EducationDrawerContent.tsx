import { type ApiEducation } from "~/database/model";

import { Drawer } from "~/components/drawers/Drawer";
import { ResumeModelDrawerTile } from "~/features/resume/components/tiles/ResumeModelDrawerTile";

export interface EducationDrawerContentProps {
  readonly education: ApiEducation<["courses", "skills", "details"]>;
}

export const EducationDrawerContent = ({ education }: EducationDrawerContentProps) => (
  <Drawer.Content>
    <ResumeModelDrawerTile
      model={education}
      titleProps={{
        className: "pr-[30px]",
      }}
    />
  </Drawer.Content>
);

export default EducationDrawerContent;
