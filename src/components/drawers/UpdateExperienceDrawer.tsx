import { isUuid } from "~/lib/typeguards";
import type { BrandExperience } from "~/prisma/model";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useExperienceForm } from "~/components/forms/experiences/hooks";
import { UpdateExperienceForm } from "~/components/forms/experiences/UpdateExperienceForm";
import { useExperience } from "~/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

interface UpdateExperienceDrawerProps extends ExtendingDrawerProps {
  readonly experienceId: string;
  readonly eager: Pick<BrandExperience, "title">;
}

export const UpdateExperienceDrawer = ({
  experienceId,
  eager,
}: UpdateExperienceDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useExperience(
    isUuid(experienceId) ? experienceId : null,
    { keepPreviousData: true, query: { visibility: "admin", includes: ["skills"] } },
  );
  const form = useExperienceForm();

  return (
    <DrawerForm form={form} titleField="title" eagerTitle={eager.title}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {experience => <UpdateExperienceForm form={form} experience={experience} />}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateExperienceDrawer;
