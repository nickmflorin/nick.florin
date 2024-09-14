import { isUuid } from "~/lib/typeguards";
import type { BrandEducation } from "~/prisma/model";

import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useEducationForm } from "~/components/forms/educations/hooks";
import { UpdateEducationForm } from "~/components/forms/educations/UpdateEducationForm";
import { useEducation } from "~/hooks";

interface UpdateEducationDrawerProps extends ExtendingDrawerProps {
  readonly educationId: string;
  readonly eager: Pick<BrandEducation, "major">;
}

export const UpdateEducationDrawer = ({
  educationId,
  eager,
}: UpdateEducationDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useEducation(
    isUuid(educationId) ? educationId : null,
    { keepPreviousData: true, query: { visibility: "admin", includes: ["skills"] } },
  );
  const form = useEducationForm({ education: data });

  return (
    <DrawerForm form={form} titleField="major" eagerTitle={eager.major}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {education => <UpdateEducationForm form={form} education={education} />}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateEducationDrawer;
