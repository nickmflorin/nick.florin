import type { BrandEducation } from "~/database/model";

import { ApiResponseState } from "~/components/ApiResponseState";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { useEducationForm } from "~/features/educations/components/forms/hooks";
import { UpdateEducationForm } from "~/features/educations/components/forms/UpdateEducationForm";
import { useEducation } from "~/hooks/api";

interface UpdateEducationDrawerProps extends ExtendingDrawerProps {
  readonly educationId: string;
  readonly eager: Pick<BrandEducation, "major">;
}

export const UpdateEducationDrawer = ({
  educationId,
  eager,
  onClose,
}: UpdateEducationDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useEducation(educationId, {
    keepPreviousData: true,
    query: { visibility: "admin", includes: ["skills"] },
  });
  const form = useEducationForm({ education: data });

  return (
    <DrawerForm form={form} titleField="major" eagerTitle={eager.major}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {education => (
          <UpdateEducationForm
            form={form}
            education={education}
            onSuccess={() => onClose()}
            onCancel={() => onClose()}
          />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateEducationDrawer;
