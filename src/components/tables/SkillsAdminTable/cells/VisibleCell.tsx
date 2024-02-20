"use client";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

import { toast } from "react-toastify";

import type * as types from "../../types";

import { logger } from "~/application/logger";
import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/updateSkill";
import { Checkbox } from "~/components/input/Checkbox";

interface VisibleCellProps {
  readonly skill: ApiSkill;
  readonly table: types.TableInstance<ApiSkill>;
}

export const VisibleCell = ({ skill, table }: VisibleCellProps): JSX.Element => {
  const router = useRouter();
  const [_, transition] = useTransition();
  const [checked, setChecked] = useState(skill.visible);

  useEffect(() => {
    setChecked(skill.visible);
  }, [skill.visible]);

  return (
    <div className="flex flex-row items-center justify-center">
      <Checkbox
        checked={checked}
        onChange={async e => {
          // Set checked state optimistically.
          setChecked(e.target.checked);
          table.setRowLoading(skill.id, true);
          try {
            await updateSkill(skill.id, { visible: e.target.checked });
          } catch (e) {
            logger.error(e);
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

export default VisibleCell;
