import { type ApiSkill } from "~/prisma/model";
import { Courses } from "~/components/badges/collections/Courses";
import { ProgrammingDomains } from "~/components/badges/collections/ProgrammingDomains";
import { ProgrammingLanguages } from "~/components/badges/collections/ProgrammingLanguages";
import { SkillCategories } from "~/components/badges/collections/SkillCategories";
import { SkillExperienceBadge } from "~/components/badges/SkillExperienceBadge";
import { Link } from "~/components/buttons";
import { RepositoryTile } from "~/components/tiles/RepositoryTile";
import { ResumeModelTileHeader } from "~/components/tiles/ResumeModelTileHeader";
import { Label } from "~/components/typography/Label";
import { ShowHide } from "~/components/util";

import { DetailDrawerContent } from "../DetailDrawerContent";
import { DetailDrawerSection } from "../DetailDrawerSection";

export interface SkillDrawerContentProps {
  readonly skill: ApiSkill<["educations", "experiences", "projects", "repositories" | "courses"]>;
}

export const SkillDrawerContent = ({
  skill: {
    experiences,
    educations,
    projects,
    label,
    description,
    categories,
    courses,
    programmingDomains,
    programmingLanguages,
    experience,
    repositories,
    autoExperience,
  },
}: SkillDrawerContentProps) => (
  <DetailDrawerContent
    badge={<SkillExperienceBadge skill={{ experience, autoExperience }} />}
    description={description}
    title={label}
  >
    <div className="flex flex-col gap-[8px]">
      <ShowHide show={categories.length !== 0}>
        <div className="flex flex-col gap-[8px]">
          <Label size="sm" fontWeight="medium">
            Categories
          </Label>
          <SkillCategories categories={categories} />
        </div>
      </ShowHide>
      <ShowHide show={programmingLanguages.length !== 0}>
        <div className="flex flex-col gap-[8px]">
          <Label size="sm" fontWeight="medium">
            Languages
          </Label>
          <ProgrammingLanguages languages={programmingLanguages} />
        </div>
      </ShowHide>
      <ShowHide show={programmingDomains.length !== 0}>
        <div className="flex flex-col gap-[8px]">
          <Label size="sm" fontWeight="medium">
            Development
          </Label>
          <ProgrammingDomains domains={programmingDomains} />
        </div>
      </ShowHide>
    </div>
    <DetailDrawerSection label="Repositories">
      {repositories.map((repo, index) => (
        <RepositoryTile key={index} repository={repo} />
      ))}
    </DetailDrawerSection>
    <DetailDrawerSection label="Experiences">
      {experiences.map((experience, index) => (
        <ResumeModelTileHeader key={index} model={experience} size="small" />
      ))}
    </DetailDrawerSection>
    <DetailDrawerSection label="Educations">
      {educations.map((education, index) => (
        <ResumeModelTileHeader key={index} model={education} size="small" />
      ))}
    </DetailDrawerSection>
    {courses.length !== 0 ? (
      <DetailDrawerSection label="Courses">
        <Courses courses={courses} />
      </DetailDrawerSection>
    ) : (
      <></>
    )}
    <DetailDrawerSection label="Projects">
      {projects.map((project, index) => (
        <div className="flex flex-col gap-[8px]" key={index}>
          <Link
            options={{ as: "link" }}
            fontWeight="regular"
            fontSize="sm"
            href={`/projects/${project.slug}`}
          >
            {project.name}
          </Link>
        </div>
      ))}
    </DetailDrawerSection>
  </DetailDrawerContent>
);

export default SkillDrawerContent;
