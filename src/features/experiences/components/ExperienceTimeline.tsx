import { type JSX } from 'react';

import { TimelineItem } from '@mantine/core';

import { removeRedundantTopLevelSkills } from '~/database/model';

import { fetchExperiences } from '~/actions/experiences/fetch-experiences';

import { TimelineIcon } from '~/components/icons/TimelineIcon';
import { CommitTimeline } from '~/components/timelines/CommitTimeline';
import { type ComponentProps } from '~/components/types';
import { ResumeModelPageTile } from '~/features/resume/components/tiles/ResumeModelPageTile';

export type ExperienceTimelineProps = ComponentProps;

export const ExperienceTimeline = async (props: ExperienceTimelineProps): Promise<JSX.Element> => {
  const fetcher = fetchExperiences(['skills', 'details']);
  const { data: _experiences } = await fetcher(
    {
      filters: { visible: true },
      visibility: 'public',
    },
    { strict: true },
  );

  const experiences = _experiences.map(removeRedundantTopLevelSkills);

  return (
    <CommitTimeline {...props}>
      {experiences.map(experience => (
        <TimelineItem bullet={<TimelineIcon />} key={experience.id}>
          <ResumeModelPageTile model={experience} />
        </TimelineItem>
      ))}
    </CommitTimeline>
  );
};
