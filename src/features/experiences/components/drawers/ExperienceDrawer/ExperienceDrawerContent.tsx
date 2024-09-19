import { type ApiExperience } from "~/database/model";

import { ContextDrawer } from "~/components/drawers/ContextDrawer";
import { ResumeModelDrawerTile } from "~/features/resume/components/tiles/ResumeModelDrawerTile";

export interface ExperienceDrawerContentProps {
  readonly experience: ApiExperience<["skills", "details"]>;
}

export const ExperienceDrawerContent = ({ experience }: ExperienceDrawerContentProps) => (
  <ContextDrawer.Content>
    <ResumeModelDrawerTile
      model={experience}
      titleProps={{
        className: "pr-[30px]",
      }}
    />
  </ContextDrawer.Content>
);

export default ExperienceDrawerContent;
