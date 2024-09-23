"use client";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

import { toast } from "react-toastify";

import { type ApiSkill } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateSkill } from "~/actions/mutations/skills";
import { isApiClientErrorJson } from "~/api";

import { Checkbox } from "~/components/input/Checkbox";
import type * as types from "~/components/tables/types";

interface HighlightedCellProps {
  readonly skill: ApiSkill<["experiences", "educations", "projects", "repositories"]>;
  readonly table: types.CellTableInstance<
    ApiSkill<["experiences", "educations", "projects", "repositories"]>
  >;
}

export const HighlightedCell = ({ skill, table }: HighlightedCellProps): JSX.Element => {
  const router = useRouter();
  const [_, transition] = useTransition();
  const [checked, setChecked] = useState(skill.highlighted);

  useEffect(() => {
    setChecked(skill.highlighted);
  }, [skill.highlighted]);

  return (
    <div className="flex flex-row items-center justify-center">
      <Checkbox
        value={checked}
        onChange={async e => {
          // Set checked state optimistically.
          setChecked(e.target.checked);
          table.setRowLoading(skill.id, true);

          let response: Awaited<ReturnType<typeof updateSkill>> | undefined = undefined;
          try {
            response = await updateSkill(skill.id, { highlighted: e.target.checked });
          } catch (e) {
            logger.errorUnsafe(
              e,
              `There was an error changing the highlighted state of the skill with ID '${skill.id}':\n${e}`,
              { skill: skill.id },
            );
            toast.error("There was an error updating the skill.");
          } finally {
            table.setRowLoading(skill.id, false);
          }
          if (isApiClientErrorJson(response)) {
            logger.error(
              `There was an error changing the highlighted state of the skill with ID '${skill.id}'.`,
              {
                response,
                skill: skill.id,
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
    </div>
  );
};

export default HighlightedCell;
