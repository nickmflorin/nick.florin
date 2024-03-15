import dynamic from "next/dynamic";

import { getEducations } from "~/actions/fetches/get-educations";
import { TimelineIcon } from "~/components/icons/TimelineIcon";
import { type ComponentProps } from "~/components/types";
import { Loading } from "~/components/views/Loading";

import { CommitTimeline } from "../CommitTimeline";

const TimelineItem = dynamic(() => import("@mantine/core").then(mod => mod.TimelineItem), {
  loading: () => <Loading loading={true} />,
});

const EducationTile = dynamic(() => import("./EducationTile"), {
  loading: () => <Loading loading={true} />,
});

export type EducationTimelineProps = ComponentProps;

export const EducationTimeline = async (props: EducationTimelineProps): Promise<JSX.Element> => {
  const educations = await getEducations({ skills: true, details: true });
  return (
    <CommitTimeline {...props}>
      {educations.map(education => (
        <TimelineItem key={education.id} bullet={<TimelineIcon />}>
          <EducationTile education={education} />
        </TimelineItem>
      ))}
    </CommitTimeline>
  );
};

export default EducationTimeline;
