"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { updateSkill } from "~/actions/mutations/skills";
import { isApiClientErrorJson } from "~/api";

import type * as types from "~/components/tables-v2/types";
import { ProjectSelect } from "~/features/projects/components/input/ProjectSelect";
import { type SkillsTableColumn, type SkillsTableModel } from "~/features/skills/types";

interface ProjectsCellProps {
  readonly skill: SkillsTableModel;
  readonly table: types.CellDataTableInstance<SkillsTableModel, SkillsTableColumn>;
}

export const ProjectsCell = ({ skill, table }: ProjectsCellProps): JSX.Element => {
  const [value, setValue] = useState(skill.projects.map(p => p.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(skill.projects.map(p => p.id));
  }, [skill.projects]);

  return (
    <ProjectSelect
      inputClassName="w-full"
      value={value}
      behavior="multi"
      isClearable
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        if (item) {
          item.setLoading(true);
        } else {
          table.setRowLoading(skill.id, true);
        }
        let response: Awaited<ReturnType<typeof updateSkill>> | undefined = undefined;
        try {
          response = await updateSkill(skill.id, { projects: v });
        } catch (e) {
          logger.error(
            `There was an error updating the projects for the skill with ID '${skill.id}':\n${e}`,
            {
              error: e,
              skill: skill.id,
              experiences: v,
            },
          );
          toast.error("There was an error updating the skill.");
        } finally {
          if (item) {
            item.setLoading(false);
          } else {
            table.setRowLoading(skill.id, false);
          }
        }
        if (isApiClientErrorJson(response)) {
          logger.error(
            "There was a client error updating the projects for the skill with ID " +
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

export default ProjectsCell;
