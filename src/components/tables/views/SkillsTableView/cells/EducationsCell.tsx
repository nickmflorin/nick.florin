"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/mutations/skills";
import { isApiClientErrorJson } from "~/api";
import { ClientEducationSelect } from "~/components/input/select/ClientEducationSelect";

interface EducationsCellProps {
  readonly skill: ApiSkill<["experiences", "educations", "projects", "repositories"]>;
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
      inputClassName="w-full"
      menuClassName="max-h-[260px]"
      options={{ isMulti: true }}
      value={value}
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item.setLoading(true);
        let response: Awaited<ReturnType<typeof updateSkill>> | undefined = undefined;
        try {
          response = await updateSkill(skill.id, { educations: v });
        } catch (e) {
          logger.error(
            `There was a server error updating the educations for the skill with ID '${skill.id}':\n${e}`,
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
        if (isApiClientErrorJson(response)) {
          logger.error(
            "There was a client error updating the educations for the skill with ID " +
              `'${skill.id}': ${response.code}`,
            {
              response,
              skill: skill.id,
              experiences: v,
            },
          );
          toast.error("There was an error updating the skill.");
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        transition(() => {
          router.refresh();
        });
      }}
    />
  );
};

export default EducationsCell;
