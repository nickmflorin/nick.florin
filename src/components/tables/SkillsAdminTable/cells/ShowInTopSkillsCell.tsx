"use client";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

import { toast } from "react-toastify";

import type * as types from "../../types";

import { updateSkill } from "~/app/actions/updateSkill";
import { logger } from "~/application/logger";
import { Checkbox } from "~/components/input/Checkbox";
import { type ApiSkill } from "~/prisma/model";

interface ShowInTopSkillsCellProps {
  readonly skill: ApiSkill;
  readonly table: types.TableInstance<ApiSkill>;
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
        checked={checked}
        onChange={async e => {
          // Set checked state optimistically.
          setChecked(e.target.checked);
          table.setRowLoading(skill.id, true);
          try {
            await updateSkill(skill.id, { includeInTopSkills: e.target.checked });
          } catch (e) {
            logger.error(e);
            toast.error("There was an error updating the skill.");
            return false;
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
