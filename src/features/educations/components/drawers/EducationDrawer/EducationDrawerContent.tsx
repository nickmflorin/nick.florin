import { type ApiEducation } from "~/database/model";

import { ContextDrawer } from "~/components/drawers/ContextDrawer";
import { ResumeModelDrawerTile } from "~/features/resume/components/tiles/ResumeModelDrawerTile";

export interface EducationDrawerContentProps {
  readonly education: ApiEducation<["courses", "skills", "details"]>;
}

export const EducationDrawerContent = ({ education }: EducationDrawerContentProps) => (
  <ContextDrawer.Content>
    <ResumeModelDrawerTile
      model={education}
      titleProps={{
        className: "pr-[30px]",
      }}
    />
  </ContextDrawer.Content>
);

export default EducationDrawerContent;
