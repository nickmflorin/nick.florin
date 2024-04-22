import { type ApiCourse } from "~/prisma/model";
import { Skills } from "~/components/badges/collections/Skills";
import { ResumeModelTile } from "~/components/tiles/ResumeModelTile";

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
      <ResumeModelTile>
        <ResumeModelTile.Header model={education} size="small">
          <ResumeModelTile.Title model={education} size="small" />
          <ResumeModelTile.SubTitle model={education} size="small" />
        </ResumeModelTile.Header>
      </ResumeModelTile>
    </DetailDrawerSection>
  </DetailDrawerContent>
);

export default CourseDrawerContent;
