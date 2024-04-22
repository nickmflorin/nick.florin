import dynamic from "next/dynamic";

import { removeRedundantTopLevelSkills } from "~/prisma/model";
import { getExperiences } from "~/actions/fetches/experiences";
import { Loading } from "~/components/feedback/Loading";
import { TimelineIcon } from "~/components/icons/TimelineIcon";
import { ResumeModelTile } from "~/components/tiles/ResumeModelTile";
import { type ComponentProps } from "~/components/types";

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
          <ResumeModelTile>
            <ResumeModelTile.Header model={experience} size="large">
              <ResumeModelTile.Title model={experience} size="large" />
              <ResumeModelTile.SubTitle model={experience} size="large" />
            </ResumeModelTile.Header>
            <ResumeModelTile.Body model={experience} alignment="inset" />
          </ResumeModelTile>
        </TimelineItem>
      ))}
    </CommitTimeline>
  );
};

export default ExperienceTimeline;
