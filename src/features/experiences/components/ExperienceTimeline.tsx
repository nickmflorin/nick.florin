import dynamic from "next/dynamic";

import { removeRedundantTopLevelSkills } from "~/database/model";

import { fetchExperiences } from "~/actions-v2/experiences/fetch-experiences";

import { TimelineIcon } from "~/components/icons/TimelineIcon";
import { Loading } from "~/components/loading/Loading";
import { CommitTimeline } from "~/components/timelines/CommitTimeline";
import { type ComponentProps } from "~/components/types";
import { ResumeModelPageTile } from "~/features/resume/components/tiles/ResumeModelPageTile";

const TimelineItem = dynamic(() => import("@mantine/core").then(mod => mod.TimelineItem), {
  loading: () => <Loading isLoading={true} />,
});

export type ExperienceTimelineProps = ComponentProps;

export const ExperienceTimeline = async (props: ExperienceTimelineProps): Promise<JSX.Element> => {
  const fetcher = fetchExperiences(["skills", "details"]);
  const { data: _experiences } = await fetcher(
    {
      visibility: "public",
      filters: { highlighted: true },
    },
    { strict: true },
  );

  const experiences = _experiences.map(removeRedundantTopLevelSkills);

  return (
    <CommitTimeline {...props}>
      {experiences.map(experience => (
        <TimelineItem key={experience.id} bullet={<TimelineIcon />}>
          <ResumeModelPageTile model={experience} />
        </TimelineItem>
      ))}
    </CommitTimeline>
  );
};

export default ExperienceTimeline;
