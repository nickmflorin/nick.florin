"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/mutations/skills";
import { ClientEducationSelect } from "~/components/input/select/ClientEducationSelect";

interface EducationsCellProps {
  readonly skill: ApiSkill<["experiences", "educations", "projects"]>;
}

export const EducationsCell = ({ skill }: EducationsCellProps): JSX.Element => {
  const [value, setValue] = useState(skill.educations.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(skill.educations.map(exp => exp.id));
  }, [skill.educations]);

  return (
    <ClientEducationSelect
      visibility="admin"
      inputClassName="w-[300px]"
      menuClassName="max-h-[260px]"
      value={value}
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item.setLoading(true);
        try {
          await updateSkill(skill.id, { educations: v });
        } catch (e) {
          const logger = (await import("~/application/logger")).logger;
          logger.error(
            `There was an error updating the educations for the skill with ID '${skill.id}':\n${e}`,
            {
              error: e,
              skill: skill.id,
              educations: v,
            },
          );
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
