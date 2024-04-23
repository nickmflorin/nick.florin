import { type ApiEducation } from "~/prisma/model";
import { DrawerContent } from "~/components/drawers/DrawerContent";
import { ResumeModelDrawerTile } from "~/components/tiles/resume/ResumeModelDrawerTile";

export interface EducationDrawerContentProps {
  readonly education: ApiEducation<["courses", "skills", "details"]>;
}

export const EducationDrawerContent = ({ education }: EducationDrawerContentProps) => (
  <DrawerContent>
    <ResumeModelDrawerTile model={education} />
  </DrawerContent>
);

export default EducationDrawerContent;
