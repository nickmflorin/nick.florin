import { type ApiCourse } from "~/database/model";

import { DetailDrawerContent } from "~/components/drawers/details/DetailDrawerContent";
import { DetailDrawerSection } from "~/components/drawers/details/DetailDrawerSection";
import { ResumeModelCondensedTile } from "~/features/resume/components/tiles/ResumeModelCondensedTile";
import { Skills } from "~/features/skills/components/badges";

export interface CourseDrawerContentProps {
  readonly course: ApiCourse<["skills", "education"]>;
}

export const CourseDrawerContent = ({
  course: { education, skills, name, description },
}: CourseDrawerContentProps) => (
  <DetailDrawerContent description={description} title={name}>
    <Skills skills={skills} />
    <DetailDrawerSection label="Education">
      <ResumeModelCondensedTile model={education} />
    </DetailDrawerSection>
  </DetailDrawerContent>
);

export default CourseDrawerContent;
