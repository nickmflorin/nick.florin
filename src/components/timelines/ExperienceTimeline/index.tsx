import dynamic from "next/dynamic";

import { getExperiences } from "~/actions/fetches/experiences";
import { TimelineIcon } from "~/components/icons/TimelineIcon";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { CommitTimeline } from "../CommitTimeline";

const TimelineItem = dynamic(() => import("@mantine/core").then(mod => mod.TimelineItem), {
  loading: () => <Loading loading={true} />,
});

const ExperienceTile = dynamic(() => import("./ExperienceTile"), {
  loading: () => <Loading loading={true} />,
});

export type ExperienceTimelineProps = ComponentProps;

export const ExperienceTimeline = async (props: ExperienceTimelineProps): Promise<JSX.Element> => {
  const experiences = await getExperiences({
    includes: { skills: true, details: true },
    visibility: "public",
  });
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
