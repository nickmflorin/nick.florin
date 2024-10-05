import dynamic from "next/dynamic";

import { uniqBy } from "lodash-es";

import { removeRedundantTopLevelSkills } from "~/database/model";

import { fetchEducations } from "~/actions/educations/fetch-educations";

import { TimelineIcon } from "~/components/icons/TimelineIcon";
import { Loading } from "~/components/loading/Loading";
import { CommitTimeline } from "~/components/timelines/CommitTimeline";
import { type ComponentProps } from "~/components/types";
import { ResumeModelPageTile } from "~/features/resume/components/tiles/ResumeModelPageTile";

const TimelineItem = dynamic(() => import("@mantine/core").then(mod => mod.TimelineItem), {
  loading: () => <Loading isLoading={true} />,
});

export type EducationTimelineProps = ComponentProps;

export const EducationTimeline = async (props: EducationTimelineProps): Promise<JSX.Element> => {
  const fetcher = fetchEducations(["skills", "details", "courses"]);
  const { data: _educations } = await fetcher(
    { visibility: "public", filters: { visible: true } },
    { strict: true },
  );
  /* Remove redundant top-level skills from each education that are also skills for details nested
     under the education.  Eventually, we may want to consider moving this logic to the BE to be
     more consistent with how skills are handled for details. */
  const educations = _educations.map(education =>
    removeRedundantTopLevelSkills({
      ...education,
      /* Include skills for each education that are skills for the courses nested underneath the
         education.  Eventually, we may want to consider doing some of this logic in the BE to be
         more consistent with how this skill handling is done with details. */
      skills: uniqBy(
        [...education.skills, ...education.courses.flatMap(c => c.skills)],
        sk => sk.id,
      ),
    }),
  );

  return (
    <CommitTimeline {...props}>
      {educations.map(education => (
        <TimelineItem key={education.id} bullet={<TimelineIcon />}>
          <ResumeModelPageTile model={education} />
        </TimelineItem>
      ))}
    </CommitTimeline>
  );
};

export default EducationTimeline;
