import dynamic from 'next/dynamic';
import { type JSX } from 'react';

import { uniqBy } from 'lodash-es';

import { type ApiEducation, removeRedundantTopLevelSkills } from '~/database/model';

import { fetchEducations } from '~/actions/educations/fetch-educations';

import { TimelineIcon } from '~/components/icons/TimelineIcon';
import { Loading } from '~/components/loading/Loading';
import { CommitTimeline } from '~/components/timelines/CommitTimeline';
import { type ComponentProps } from '~/components/types';
import { ResumeModelPageTile } from '~/features/resume/components/tiles/ResumeModelPageTile';

const TimelineItem = dynamic(() => import('@mantine/core').then(mod => mod.TimelineItem), {
  loading: () => <Loading isLoading />,
});

export type EducationTimelineProps = ComponentProps;

/**
 * Returns the skills for an education, including the skills of its nested courses, so that
 * {@link removeRedundantTopLevelSkills} also treats a skill introduced only through a course as
 * redundant with an identical skill already present at the detail level.
 */
const getEducationSkills = (education: ApiEducation<['skills', 'details', 'courses']>) =>
  uniqBy([...education.skills, ...education.courses.flatMap(c => c.skills)], sk => sk.id);

export const EducationTimeline = async (props: EducationTimelineProps): Promise<JSX.Element> => {
  const fetcher = fetchEducations(['skills', 'details', 'courses']);
  const { data: _educations } = await fetcher(
    { filters: { visible: true }, visibility: 'public' },
    { strict: true },
  );

  const educations = _educations.map(education =>
    removeRedundantTopLevelSkills({ ...education, skills: getEducationSkills(education) }),
  );

  return (
    <CommitTimeline {...props}>
      {educations.map(education => (
        <TimelineItem bullet={<TimelineIcon />} key={education.id}>
          <ResumeModelPageTile model={education} />
        </TimelineItem>
      ))}
    </CommitTimeline>
  );
};
