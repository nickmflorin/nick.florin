"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/mutations/skills";
import { ClientExperienceSelect } from "~/components/input/select/ClientExperienceSelect";

interface ExperiencesCellProps {
  readonly skill: ApiSkill<{ experiences: true; educations: true; projects: true }>;
}

export const ExperiencesCell = ({ skill }: ExperiencesCellProps): JSX.Element => {
  const [value, setValue] = useState(skill.experiences.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(skill.experiences.map(exp => exp.id));
  }, [skill.experiences]);

  return (
    <ClientExperienceSelect
      visibility="admin"
      inputClassName="w-[300px]"
      menuClassName="max-h-[260px]"
      value={value}
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item.setLoading(true);
        try {
          await updateSkill(skill.id, { experiences: v });
        } catch (e) {
          const logger = (await import("~/application/logger")).logger;
          logger.error(
            `There was an error updating the experiences for the skill with ID '${skill.id}':\n${e}`,
            {
              error: e,
              skill: skill.id,
              experiences: v,
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

export default ExperiencesCell;
