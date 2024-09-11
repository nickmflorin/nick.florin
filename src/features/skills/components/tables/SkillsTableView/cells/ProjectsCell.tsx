"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { type ApiSkill } from "~/prisma/model";

import { updateSkill } from "~/actions/mutations/skills";
import { isApiClientErrorJson } from "~/api";

import { ClientProjectSelect } from "~/components/input/select/ClientProjectSelect";
import type * as types from "~/components/tables/types";

interface ProjectsCellProps {
  readonly skill: ApiSkill<["experiences", "educations", "projects", "repositories"]>;
  readonly table: types.CellTableInstance<
    ApiSkill<["experiences", "educations", "projects", "repositories"]>
  >;
}

export const ProjectsCell = ({ skill, table }: ProjectsCellProps): JSX.Element => {
  const [value, setValue] = useState(skill.projects.map(p => p.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(skill.projects.map(p => p.id));
  }, [skill.projects]);

  return (
    <ClientProjectSelect
      options={{ isMulti: true, isClearable: true }}
      inputClassName="w-full"
      menuClassName="max-h-[260px]"
      value={value}
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