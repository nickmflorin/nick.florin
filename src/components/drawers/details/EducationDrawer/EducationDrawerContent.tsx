import { type ApiEducation } from "~/prisma/model";
import { DrawerContent } from "~/components/drawers/DrawerContent";
import { ResumeModelTile } from "~/components/tiles/ResumeModelTile";

export interface EducationDrawerContentProps {
  readonly education: ApiEducation<["courses", "skills", "details"]>;
}

export const EducationDrawerContent = ({ education }: EducationDrawerContentProps) => (
  <DrawerContent>
    <ResumeModelTile className="!gap-[16px]">
      <ResumeModelTile.Header model={education} size="medium" alignment="left-aligned">
        <ResumeModelTile.Title model={education} size="medium" />
        <ResumeModelTile.SubTitle model={education} size="medium" />
      </ResumeModelTile.Header>
      <ResumeModelTile.Body model={education} alignment="left-aligned" />
    </ResumeModelTile>
  </DrawerContent>
);

export default EducationDrawerContent;
