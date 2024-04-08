import dynamic from "next/dynamic";

import { removeRedundantTopLevelSkills } from "~/prisma/model";
import { getEducations } from "~/actions/fetches/educations";
import { Loading } from "~/components/feedback/Loading";
import { TimelineIcon } from "~/components/icons/TimelineIcon";
import { ResumeTile } from "~/components/tiles/ResumeTile";
import { type ComponentProps } from "~/components/types";

import { CommitTimeline } from "./CommitTimeline";

const TimelineItem = dynamic(() => import("@mantine/core").then(mod => mod.TimelineItem), {
  loading: () => <Loading isLoading={true} />,
});

export type EducationTimelineProps = ComponentProps;

export const EducationTimeline = async (props: EducationTimelineProps): Promise<JSX.Element> => {
  const _educations = await getEducations({
    includes: ["skills", "details", "courses"],
    visibility: "public",
  });
  const educations = _educations.map(removeRedundantTopLevelSkills);
  return (
    <CommitTimeline {...props}>
      {educations.map(education => (
        <TimelineItem key={education.id} bullet={<TimelineIcon />}>
          <ResumeTile model={education} />
        </TimelineItem>
      ))}
    </CommitTimeline>
  );
};

export default EducationTimeline;
