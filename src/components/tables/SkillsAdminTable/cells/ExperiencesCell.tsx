"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { updateSkill } from "~/app/actions/updateSkill";
import { logger } from "~/application/logger";
import { type ApiSkill, type ApiExperience } from "~/prisma/model";
import { ExperienceSelect } from "~/components/input/select/ExperienceSelect";

interface ExperiencesCellProps {
  readonly skill: ApiSkill;
  readonly experiences: Omit<ApiExperience, "skills" | "details">[];
}

export const ExperiencesCell = ({ skill, experiences }: ExperiencesCellProps): JSX.Element => {
  const [value, setValue] = useState(skill.experiences.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(skill.experiences.map(exp => exp.id));
  }, [skill.experiences]);

  return (
    <ExperienceSelect
      inputClassName="w-[300px]"
      menuClassName="max-h-[260px]"
      data={experiences}
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
