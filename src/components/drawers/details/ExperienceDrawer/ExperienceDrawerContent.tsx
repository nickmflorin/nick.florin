import { type ApiExperience } from "~/prisma/model";
import { DrawerContent } from "~/components/drawers/DrawerContent";
import { ResumeModelDrawerTile } from "~/components/tiles/resume/ResumeModelDrawerTile";

export interface ExperienceDrawerContentProps {
  readonly experience: ApiExperience<["skills", "details"]>;
}

export const ExperienceDrawerContent = ({ experience }: ExperienceDrawerContentProps) => (
  <DrawerContent>
    <ResumeModelDrawerTile model={experience} />
  </DrawerContent>
);

export default ExperienceDrawerContent;
