import type { BrandSchool } from "~/database/model";
import { isUuid } from "~/lib/typeguards";

import { ApiResponseState } from "~/components/ApiResponseState";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { useSchoolForm } from "~/features/schools/components/forms/hooks";
import UpdateSchoolForm from "~/features/schools/components/forms/UpdateSchoolForm";
import { useSchool } from "~/hooks";

interface UpdateCourseDrawerProps extends ExtendingDrawerProps {
  readonly schoolId: string;
  readonly eager: Pick<BrandSchool, "name">;
}

export const UpdateCourseDrawer = ({
  schoolId,
  eager,
  onClose,
}: UpdateCourseDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useSchool(isUuid(schoolId) ? schoolId : null, {
    keepPreviousData: true,
    query: { visibility: "admin", includes: [] },
  });
  const form = useSchoolForm();

  return (
    <DrawerForm form={form} titleField="name" eagerTitle={eager.name}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {school => (
          <UpdateSchoolForm form={form} school={school} onSuccess={onClose} onCancel={onClose} />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateCourseDrawer;
