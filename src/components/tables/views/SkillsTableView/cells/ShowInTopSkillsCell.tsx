"use client";
import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/mutations/skills";
import { isApiClientErrorJson } from "~/api";
import { Checkbox } from "~/components/input/Checkbox";
import type * as types from "~/components/tables/types";

interface ShowInTopSkillsCellProps {
  readonly skill: ApiSkill<["experiences", "educations", "projects"]>;
  readonly table: types.TableInstance<ApiSkill<["experiences", "educations", "projects"]>>;
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

          let response: Awaited<ReturnType<typeof updateSkill>> | undefined = undefined;
          try {
            response = await updateSkill(skill.id, { includeInTopSkills: e.target.checked });
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
          if (isApiClientErrorJson(response)) {
            logger.error(
              `There was an error updating the top skills flag for the skill with ID '${skill.id}'.`,
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

export default ShowInTopSkillsCell;
