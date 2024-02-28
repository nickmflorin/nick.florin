import { getExperiences } from "~/actions/fetches/get-experiences";
import { type ComponentProps } from "~/components/types";

import { CommitTimeline } from "../CommitTimeline";

import { ExperienceTile } from "./ExperienceTile";

export type ExperienceTimelineProps = ComponentProps;

export const ExperienceTimeline = async (props: ExperienceTimelineProps): Promise<JSX.Element> => {
  const experiences = await getExperiences({ skills: true, details: true });
  return (
    <CommitTimeline {...props}>
      {experiences.map(experience => (
        <ExperienceTile key={experience.id} experience={experience} />
      ))}
    </CommitTimeline>
  );
};

export default ExperienceTimeline;
