import dynamic from "next/dynamic";

import { removeRedundantTopLevelSkills } from "~/prisma/model";
import { getExperiences } from "~/actions/fetches/experiences";
import { TimelineIcon } from "~/components/icons/TimelineIcon";
import { ExperienceTile } from "~/components/tiles/ExperienceTile";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { CommitTimeline } from "./CommitTimeline";

const TimelineItem = dynamic(() => import("@mantine/core").then(mod => mod.TimelineItem), {
  loading: () => <Loading isLoading={true} />,
});

export type ExperienceTimelineProps = ComponentProps;

export const ExperienceTimeline = async (props: ExperienceTimelineProps): Promise<JSX.Element> => {
  const _experiences = await getExperiences({
    includes: ["skills", "details"],
    visibility: "public",
  });
  const experiences = _experiences.map(removeRedundantTopLevelSkills);

  return (
    <CommitTimeline {...props}>
      {experiences.map(experience => (
        <TimelineItem key={experience.id} bullet={<TimelineIcon />}>
          <ExperienceTile experience={experience} />
        </TimelineItem>
      ))}
    </CommitTimeline>
  );
};

export default ExperienceTimeline;
