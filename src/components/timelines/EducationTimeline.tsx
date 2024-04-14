import dynamic from "next/dynamic";

import uniqBy from "lodash.uniqby";

import { removeRedundantTopLevelSkills } from "~/prisma/model";
import { getEducations } from "~/actions/fetches/educations";
import { Loading } from "~/components/feedback/Loading";
import { TimelineIcon } from "~/components/icons/TimelineIcon";
import { ResumeModelTile } from "~/components/tiles/ResumeModelTile";
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
  /* Remove redundant top-level skills from each education that are also skills for details nested
     under the education.  Eventually, we may want to consider moving this logic to the BE to be
     more consistent with how skills are handled for details. */
  const educations = _educations.map(removeRedundantTopLevelSkills).map(education => ({
    ...education,
    /* Include skills for each education that are skills for the courses nested underneath the
       education.  Eventually, we may want to consider doing some of this logic in the BE to be
       more consistent with how this skill handling is done with details. */
    skills: uniqBy([...education.skills, ...education.courses.flatMap(c => c.skills)], sk => sk.id),
  }));

  return (
    <CommitTimeline {...props}>
      {educations.map(education => (
        <TimelineItem key={education.id} bullet={<TimelineIcon />}>
          <ResumeModelTile model={education} />
        </TimelineItem>
      ))}
    </CommitTimeline>
  );
};

export default EducationTimeline;
