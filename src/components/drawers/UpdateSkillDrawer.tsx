import { isUuid } from "~/lib/typeguards";
import type { BrandSkill } from "~/prisma/model";
import { ApiResponseState } from "~/components/feedback/ApiResponseState";
import { useSkillForm } from "~/components/forms/skills/hooks";
import UpdateSkillForm from "~/components/forms/skills/UpdateSkillForm";
import { useSkill } from "~/hooks";

import { DrawerForm } from "./DrawerForm";
import { type ExtendingDrawerProps } from "./provider";

interface UpdateCourseDrawerProps
  extends ExtendingDrawerProps<{
    readonly skillId: string;
    readonly eager: Pick<BrandSkill, "label">;
  }> {}

export const UpdateCourseDrawer = ({ skillId, eager }: UpdateCourseDrawerProps): JSX.Element => {
  const { data, isLoading, error, isValidating } = useSkill(isUuid(skillId) ? skillId : null, {
    includes: ["projects", "educations", "experiences"],
    keepPreviousData: true,
    visibility: "admin",
  });
  const form = useSkillForm();

  return (
    <DrawerForm form={form} titleField="label" titlePlaceholder={eager.label}>
      <ApiResponseState error={error} isLoading={isLoading || isValidating} data={data}>
        {skill => <UpdateSkillForm form={form} skill={skill} />}
      </ApiResponseState>
    </DrawerForm>
  );
};

export default UpdateCourseDrawer;
