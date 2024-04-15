import { type ApiCourse } from "~/prisma/model";
import { Skills } from "~/components/badges/collections/Skills";
import { ResumeModelTileHeader } from "~/components/tiles/ResumeModelTileHeader";

import { DetailDrawerContent } from "../DetailDrawerContent";
import { DetailDrawerSection } from "../DetailDrawerSection";

export interface CourseDrawerContentProps {
  readonly course: ApiCourse<["skills", "education"]>;
}

export const CourseDrawerContent = ({
  course: { education, skills, name, description },
}: CourseDrawerContentProps) => (
  <DetailDrawerContent description={description} title={name}>
    <Skills skills={skills} />
    <DetailDrawerSection label="Education">
      <ResumeModelTileHeader model={education} size="small" />
    </DetailDrawerSection>
  </DetailDrawerContent>
);

export default CourseDrawerContent;
