import type { BrandSkill } from "~/database/model";

import { ApiResponseState } from "~/components/ApiResponseState";
import { type ExtendingDrawerProps } from "~/components/drawers";
import { DrawerForm } from "~/components/drawers/DrawerForm";
import { useSkillForm } from "~/features/skills/components/forms/hooks";
import UpdateSkillForm from "~/features/skills/components/forms/UpdateSkillForm";
import { useSkill } from "~/hooks/api-v2";

interface UpdateCourseDrawerProps extends ExtendingDrawerProps {
  readonly skillId: string;
  readonly eager: Pick<BrandSkill, "label">;
}

export const UpdateCourseDrawer = ({
  skillId,
  eager,
  onClose,
}: UpdateCourseDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useSkill(skillId, {
    query: {
      includes: ["projects", "educations", "experiences", "repositories", "courses"],
      visibility: "admin",
    },
    keepPreviousData: true,
  });
  const form = useSkillForm();

  return (
    <DrawerForm form={form} titleField="label" eagerTitle={eager.label}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {skill => (
          <UpdateSkillForm form={form} skill={skill} onCancel={onClose} onSuccess={onClose} />
        )}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateCourseDrawer;
