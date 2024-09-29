"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { updateProject } from "~/actions/projects/update-project";

import type * as types from "~/components/tables/types";
import type { ProjectsTableColumn, ProjectsTableModel } from "~/features/projects/types";
import { ClientSkillsSelect } from "~/features/skills/components/input/ClientSkillsSelect";

interface SkillsCellProps {
  readonly project: ProjectsTableModel;
  readonly table: types.CellDataTableInstance<ProjectsTableModel, ProjectsTableColumn>;
}

export const SkillsCell = ({ project, table }: SkillsCellProps): JSX.Element => {
  const [value, setValue] = useState(project.skills.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(project.skills.map(exp => exp.id));
  }, [project.skills]);

  return (
    <ClientSkillsSelect
      visibility="admin"
      inputClassName="w-full"
      inPortal
      value={value}
      behavior="multi"
      summarizeValueAfter={2}
      isClearable
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        item?.setLoading(true);
        table.setRowLoading(project.id, true);

        let response: Awaited<ReturnType<typeof updateProject>> | undefined = undefined;
        try {
          response = await updateProject(project.id, { skills: v });
        } catch (e) {
          logger.errorUnsafe(
            e,
            "There was a server error updating the skills for the project with " +
              `ID '${project.id}'.`,
            { project: project.id, skills: v },
          );
          item?.setLoading(false);
          table.setRowLoading(project.id, false);
          return toast.error("There was an error updating the project.");
        }
        const { error } = response;
        if (error) {
          logger.error(
            error,
            "There was a client error updating the skills for the project with ID " +
              `'${project.id}': ${error.code}`,
            { project, skills: v },
          );
          item?.setLoading(false);
          table.setRowLoading(project.id, false);
          return toast.error("There was an error updating the project.");
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        transition(() => {
          router.refresh();
          item?.setLoading(false);
          table.setRowLoading(project.id, false);
        });
      }}
    />
  );
};
