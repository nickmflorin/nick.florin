"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/update-skill";
import { ClientExperienceSelect } from "~/components/input/select/ClientExperienceSelect";

interface ExperiencesCellProps {
  readonly skill: ApiSkill;
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

export default ExperiencesCell;
