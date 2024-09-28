import type { BrandExperience } from "~/database/model";

import { ApiResponseState } from "~/components/ApiResponseState";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { useExperienceForm } from "~/features/experiences/components/forms/hooks";
import { UpdateExperienceForm } from "~/features/experiences/components/forms/UpdateExperienceForm";
import { useExperience } from "~/hooks/api-v2";

interface UpdateExperienceDrawerProps extends ExtendingDrawerProps {
  readonly experienceId: string;
  readonly eager: Pick<BrandExperience, "title">;
}

export const UpdateExperienceDrawer = ({
  experienceId,
  eager,
  onClose,
}: UpdateExperienceDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useExperience(experienceId, {
    keepPreviousData: true,
    query: { visibility: "admin", includes: ["skills"] },
  });
  const form = useExperienceForm({ experience: data });

  return (
    <DrawerForm form={form} titleField="title" eagerTitle={eager.title}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {experience => (
          <UpdateExperienceForm
            form={form}
            experience={experience}
            onCancel={() => onClose()}
            onSuccess={() => onClose()}
          />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateExperienceDrawer;
