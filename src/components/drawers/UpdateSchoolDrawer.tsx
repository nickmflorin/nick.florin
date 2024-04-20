import { isUuid } from "~/lib/typeguards";
import type { BrandSchool } from "~/prisma/model";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useSchoolForm } from "~/components/forms/schools/hooks";
import UpdateSchoolForm from "~/components/forms/schools/UpdateSchoolForm";
import { useSchool } from "~/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

interface UpdateCourseDrawerProps
  extends ExtendingDrawerProps<{
    readonly schoolId: string;
    readonly eager: Pick<BrandSchool, "name">;
  }> {}

export const UpdateCourseDrawer = ({ schoolId, eager }: UpdateCourseDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useSchool(isUuid(schoolId) ? schoolId : null, {
    keepPreviousData: true,
    query: { visibility: "admin", includes: [] },
  });
  const form = useSchoolForm();

  return (
    <DrawerForm form={form} titleField="name" eagerTitle={eager.name}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {school => <UpdateSchoolForm form={form} school={school} />}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateCourseDrawer;
