"use client";
import { useExperience } from "~/hooks";
import { type ComponentProps } from "~/components/types";

import { ExperienceTile } from "./ExperienceTile";
import { ResumeSection } from "./ResumeSection";

export type ExperienceProps = ComponentProps;

export const Experience = (props: ExperienceProps): JSX.Element => {
  const { data, error, isLoading } = useExperience();

  return (
    <ResumeSection className="flex flex-col gap-[18px]">
      {data ? (
        data.map(experience => <ExperienceTile key={experience.id} experience={experience} />)
      ) : (
        <></>
      )}
    </ResumeSection>
  );
};
