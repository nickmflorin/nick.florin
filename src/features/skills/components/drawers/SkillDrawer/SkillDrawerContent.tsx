import { type ApiSkill } from '~/database/model';

import { DetailDrawerContent } from '~/components/drawers/details/DetailDrawerContent';
import { DetailDrawerSection } from '~/components/drawers/details/DetailDrawerSection';
import { Label } from '~/components/typography';
import { ShowHide } from '~/components/util';
import { Courses } from '~/features/courses/components/badges';
import { ProjectTile } from '~/features/projects/components/ProjectTile';
import { RepositoryTile } from '~/features/repositories/components/RepositoryTile';
import { ResumeModelCondensedTile } from '~/features/resume/components/tiles/ResumeModelCondensedTile';
import {
  ProgrammingDomains,
  ProgrammingLanguages,
  SkillCategories,
  SkillExperienceBadge,
} from '~/features/skills/components/badges';

export interface SkillDrawerContentProps {
  readonly skill: ApiSkill<['educations', 'experiences', 'projects', 'courses' | 'repositories']>;
}

export const SkillDrawerContent = ({
  skill: {
    calculatedExperience,
    categories,
    courses,
    description,
    educations,
    experiences,
    label,
    programmingDomains,
    programmingLanguages,
    projects,
    repositories,
  },
}: SkillDrawerContentProps) => (
  <DetailDrawerContent
    badge={<SkillExperienceBadge skill={{ calculatedExperience }} />}
    description={description}
    title={label}
  >
    <ShowHide
      show={
        categories.length !== 0 ||
        programmingLanguages.length !== 0 ||
        programmingDomains.length !== 0
      }
    >
      <div className='flex flex-col gap-[8px]'>
        <ShowHide show={categories.length !== 0}>
          <div className='flex flex-col gap-[8px]'>
            <Label fontSize='sm' fontWeight='medium'>
              Categories
            </Label>
            <SkillCategories categories={categories} />
          </div>
        </ShowHide>
        <ShowHide show={programmingLanguages.length !== 0}>
          <div className='flex flex-col gap-[8px]'>
            <Label fontSize='sm' fontWeight='medium'>
              Languages
            </Label>
            <ProgrammingLanguages languages={programmingLanguages} />
          </div>
        </ShowHide>
        <ShowHide show={programmingDomains.length !== 0}>
          <div className='flex flex-col gap-[8px]'>
            <Label fontSize='sm' fontWeight='medium'>
              Development
            </Label>
            <ProgrammingDomains domains={programmingDomains} />
          </div>
        </ShowHide>
      </div>
    </ShowHide>
    <DetailDrawerSection label='Repositories'>
      {repositories.map((repo, index) => (
        <RepositoryTile key={index} repository={repo} />
      ))}
    </DetailDrawerSection>
    <DetailDrawerSection label='Experiences'>
      {experiences.map((experience, index) => (
        <ResumeModelCondensedTile
          areTagsVisible={false}
          isTitleExpandable
          key={index}
          model={experience}
        />
      ))}
    </DetailDrawerSection>
    <DetailDrawerSection label='Educations'>
      {educations.map((education, index) => (
        <ResumeModelCondensedTile
          areTagsVisible={false}
          isTitleExpandable
          key={index}
          model={education}
        />
      ))}
    </DetailDrawerSection>
    <>
      {courses.length !== 0 && (
        <DetailDrawerSection label='Courses'>
          <Courses courses={courses} />
        </DetailDrawerSection>
      )}
    </>
    <DetailDrawerSection label='Projects'>
      {projects.map(project => (
        <ProjectTile key={project.id} project={project} />
      ))}
    </DetailDrawerSection>
  </DetailDrawerContent>
);
