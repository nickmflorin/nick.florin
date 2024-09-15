import { type ApiExperience } from "~/prisma/model";

import { Drawer } from "~/components/drawers/Drawer";
import { ResumeModelDrawerTile } from "~/features/resume/components/tiles/ResumeModelDrawerTile";

export interface ExperienceDrawerContentProps {
  readonly experience: ApiExperience<["skills", "details"]>;
}

export const ExperienceDrawerContent = ({ experience }: ExperienceDrawerContentProps) => (
  <Drawer.Content>
    <ResumeModelDrawerTile
      model={experience}
      titleProps={{
        className: "pr-[30px]",
      }}
    />
  </Drawer.Content>
);

export default ExperienceDrawerContent;
