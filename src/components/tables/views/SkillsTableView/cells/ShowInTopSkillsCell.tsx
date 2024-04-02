"use client";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

import { toast } from "react-toastify";

import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/mutations/skills";
import { Checkbox } from "~/components/input/Checkbox";
import type * as types from "~/components/tables/types";

interface ShowInTopSkillsCellProps {
  readonly skill: ApiSkill<{ experiences: true; educations: true; projects: true }>;
  readonly table: types.TableInstance<
    ApiSkill<{ experiences: true; educations: true; projects: true }>
  >;
}

export const ShowInTopSkillsCell = ({ skill, table }: ShowInTopSkillsCellProps): JSX.Element => {
  const router = useRouter();
  const [_, transition] = useTransition();
  const [checked, setChecked] = useState(skill.includeInTopSkills);

  useEffect(() => {
    setChecked(skill.includeInTopSkills);
  }, [skill.includeInTopSkills]);

  return (
    <div className="flex flex-row items-center justify-center">
      <Checkbox
        value={checked}
        onChange={async e => {
          // Set checked state optimistically.
          setChecked(e.target.checked);
          table.setRowLoading(skill.id, true);
          try {
            await updateSkill(skill.id, { includeInTopSkills: e.target.checked });
          } catch (e) {
            const logger = (await import("~/application/logger")).logger;
            logger.error(
              `There was an error updating the top skills flag for the skill with ID '${skill.id}':\n${e}`,
              {
                error: e,
                skill: skill.id,
              },
            );
            toast.error("There was an error updating the skill.");
          } finally {
            table.setRowLoading(skill.id, false);
          }
          transition(() => {
            router.refresh();
          });
        }}
      />
    </div>
  );
};

export default ShowInTopSkillsCell;
