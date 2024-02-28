import { getEducations } from "~/actions/fetches/get-educations";
import { type ComponentProps } from "~/components/types";

import { CommitTimeline } from "../CommitTimeline";

import { EducationTile } from "./EducationTile";

export type EducationTimelineProps = ComponentProps;

export const EducationTimeline = async (props: EducationTimelineProps): Promise<JSX.Element> => {
  const educations = await getEducations({ skills: true, details: true });
  return (
    <CommitTimeline {...props}>
      {educations.map(education => (
        <EducationTile key={education.id} education={education} />
      ))}
    </CommitTimeline>
  );
};

export default EducationTimeline;
