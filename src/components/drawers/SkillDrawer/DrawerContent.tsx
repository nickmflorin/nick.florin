import { type ApiSkill } from "~/prisma/model";
import { ProgrammingDomains } from "~/components/badges/collections/ProgrammingDomains";
import { ProgrammingLanguages } from "~/components/badges/collections/ProgrammingLanguages";
import { SkillCategories } from "~/components/badges/collections/SkillCategories";
import { SkillExperienceBadge } from "~/components/badges/SkillExperienceBadge";
import { Link } from "~/components/buttons";
import { RepositoryTile } from "~/components/tiles/RepositoryTile";
import { ResumeTileHeader } from "~/components/tiles/ResumeTileHeader";
import { Description } from "~/components/typography/Description";
import { Label } from "~/components/typography/Label";
import { Title } from "~/components/typography/Title";
import { ShowHide } from "~/components/util";

import { DrawerContent } from "../DrawerContent";

interface SkillDrawerSectionProps {
  readonly label: string;
  readonly children: JSX.Element[];
}

const SkillDrawerSection = ({ label, children }: SkillDrawerSectionProps) =>
  children.length === 0 ? (
    <></>
  ) : (
    <div className="flex flex-col gap-[8px]">
      <hr className="w-full border-t border-gray-200" />
      <div className="flex flex-col gap-[12px]">
        <Label size="sm" fontWeight="medium">
          {label}
        </Label>
        <div className="flex flex-col gap-[12px]">{children}</div>
      </div>
    </div>
  );

export interface SkillDrawerContentProps {
  readonly skill: ApiSkill<["educations", "experiences", "projects", "repositories"]>;
}

export const SkillDrawerContent = ({
  skill: {
    experiences,
    educations,
    projects,
    label,
    description,
    categories,
    programmingDomains,
    programmingLanguages,
    experience,
    repositories,
    autoExperience,
  },
}: SkillDrawerContentProps) => (
  <DrawerContent className="gap-[14px]">
    <div className="flex flex-col gap-[8px]">
      <div className="flex flex-col gap-[6px]">
        <Title order={2} className="text-gray-700 max-w-fit">
          {label}
        </Title>
        <SkillExperienceBadge skill={{ experience, autoExperience }} />
      </div>
      <Description description={description} />
    </div>
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
    <div className="flex flex-col gap-[14px]">
      <SkillDrawerSection label="Repositories">
        {repositories.map((repo, index) => (
          <RepositoryTile key={index} repository={repo} />
        ))}
      </SkillDrawerSection>
      <SkillDrawerSection label="Experiences">
        {experiences.map((experience, index) => (
          <ResumeTileHeader key={index} model={experience} size="small" />
        ))}
      </SkillDrawerSection>
      <SkillDrawerSection label="Educations">
        {educations.map((education, index) => (
          <ResumeTileHeader key={index} model={education} size="small" />
        ))}
      </SkillDrawerSection>
      <SkillDrawerSection label="Projects">
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
      </SkillDrawerSection>
    </div>
  </DrawerContent>
);

export default SkillDrawerContent;
