import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useEducation } from "~/hooks";

import { Drawer } from "../../Drawer";
import { type ExtendingDrawerProps } from "../../provider";

import { EducationDrawerContent } from "./EducationDrawerContent";

export interface SkillDrawerProps
  extends ExtendingDrawerProps<{
    readonly educationId: string;
  }> {}

export const EducationDrawer = ({ educationId }: SkillDrawerProps): JSX.Element => {
  const { data, isLoading, error } = useEducation(educationId, {
    query: {
      includes: ["skills", "details", "courses"],
      visibility: "public",
    },
    keepPreviousData: true,
  });
  return (
    <Drawer>
      <ApiResponseState error={error} isLoading={isLoading} data={data}>
        {education => <EducationDrawerContent education={education} />}
      </ApiResponseState>
    </Drawer>
  );
};

export default EducationDrawer;
