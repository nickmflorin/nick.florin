import { type ApiCourse } from "~/prisma/model";

import { Skills } from "~/components/badges/collections/Skills";
import { ResumeModelCondensedTile } from "~/components/tiles/resume/ResumeModelCondensedTile";

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
      <ResumeModelCondensedTile model={education} pushOnExpandTitle />
    </DetailDrawerSection>
  </DetailDrawerContent>
);

export default CourseDrawerContent;
