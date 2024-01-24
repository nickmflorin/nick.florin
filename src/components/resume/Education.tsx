"use client";
import { useEducation } from "~/hooks";
import { type ComponentProps } from "~/components/types";

import { EducationTile } from "./EducationTile";
import { ResumeSection } from "./ResumeSection";

export type EducationProps = ComponentProps;

export const Education = (props: EducationProps): JSX.Element => {
  const { data, error, isLoading } = useEducation();

  return (
    <ResumeSection className="flex flex-col gap-[18px]">
      {data ? (
        data.map(education => <EducationTile key={education.id} education={education} />)
      ) : (
        <></>
      )}
    </ResumeSection>
  );
};
