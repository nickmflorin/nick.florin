import { ApiResponseState } from "~/components/ApiResponseState";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { ContextDrawer } from "~/components/drawers/ContextDrawer";
import { useEducation } from "~/hooks";

import { EducationDrawerContent } from "./EducationDrawerContent";

export interface SkillDrawerProps extends ExtendingDrawerProps {
  readonly educationId: string;
}

export const EducationDrawer = ({ educationId }: SkillDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useEducation(educationId, {
    query: {
      includes: ["skills", "details", "courses"],
      visibility: "public",
    },
    keepPreviousData: true,
  });
  return (
    <ContextDrawer>
      <ApiResponseState error={error} isLoading={isLoading} data={data}>
        {education => <EducationDrawerContent education={education} />}
      </ApiResponseState>
    </ContextDrawer>
  );
};

export default EducationDrawer;
