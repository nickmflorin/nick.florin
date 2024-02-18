"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { updateSkill } from "~/app/actions/updateSkill";
import { logger } from "~/application/logger";
import { type ApiSkill, type ApiEducation } from "~/prisma/model";
import { EducationSelect } from "~/components/input/select/EducationSelect";

interface EducationsCellProps {
  readonly skill: ApiSkill;
  readonly educations: Omit<ApiEducation, "skills" | "details">[];
}

export const EducationsCell = ({ skill, educations }: EducationsCellProps): JSX.Element => {
  const [value, setValue] = useState(skill.educations.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(skill.educations.map(exp => exp.id));
  }, [skill.educations]);

  return (
    <EducationSelect
      inputClassName="w-[300px]"
      menuClassName="max-h-[260px]"
      data={educations}
      value={value}
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item.setLoading(true);
        try {
          await updateSkill(skill.id, { educations: v });
        } catch (e) {
          logger.error(e);
          toast.error("There was an error updating the skill.");
        } finally {
          item.setLoading(false);
        }
        /* Refresh the page state from the server.  This is not entirely necessary, but will
           revert any changes that were made if the request fails. */
        transition(() => {
          router.refresh();
        });
      }}
    />
  );
};

export default EducationsCell;
