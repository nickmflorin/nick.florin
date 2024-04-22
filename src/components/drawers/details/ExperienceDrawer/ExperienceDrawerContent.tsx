import { type ApiExperience } from "~/prisma/model";
import { DrawerContent } from "~/components/drawers/DrawerContent";
import { ResumeModelTile } from "~/components/tiles/ResumeModelTile";

export interface ExperienceDrawerContentProps {
  readonly experience: ApiExperience<["skills", "details"]>;
}

export const ExperienceDrawerContent = ({ experience }: ExperienceDrawerContentProps) => (
  <DrawerContent>
    <ResumeModelTile className="!gap-[16px]">
      <ResumeModelTile.Header model={experience} size="medium" alignment="left-aligned">
        <ResumeModelTile.Title model={experience} size="medium" />
        <ResumeModelTile.SubTitle model={experience} size="medium" />
      </ResumeModelTile.Header>
      <ResumeModelTile.Body model={experience} alignment="left-aligned" />
    </ResumeModelTile>
  </DrawerContent>
);

export default ExperienceDrawerContent;
