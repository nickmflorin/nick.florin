"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiSkill } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateSkill } from "~/actions/mutations/skills";
import { isApiClientErrorJson } from "~/api";

import type * as types from "~/components/tables/types";
import { ClientRepositorySelect } from "~/features/repositories/components/input/ClientRepositorySelect";

interface RepositoriesCellProps {
  readonly skill: ApiSkill<["experiences", "educations", "projects", "repositories"]>;
  readonly table: types.CellTableInstance<
    ApiSkill<["experiences", "educations", "projects", "repositories"]>
  >;
}

export const RepositoriesCell = ({ skill, table }: RepositoriesCellProps): JSX.Element => {
  const [value, setValue] = useState(skill.repositories.map(p => p.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(skill.repositories.map(p => p.id));
  }, [skill.repositories]);

  return (
    <ClientRepositorySelect
      behavior="multi"
      isClearable
      inputClassName="w-full"
      value={value}
      summarizeValueAfter={2}
      onChange={async v => {
        // Optimistically update the value.
        setValue(v);
        table.setRowLoading(skill.id, true);
        let response: Awaited<ReturnType<typeof updateSkill>> | undefined = undefined;
        try {
          response = await updateSkill(skill.id, { repositories: v });
        } catch (e) {
          logger.error(
            `There was an error updating the repositories for the skill with ID '${skill.id}':\n${e}`,
            {
              error: e,
              skill: skill.id,
              experiences: v,
            },
          );
          toast.error("There was an error updating the skill.");
        } finally {
          table.setRowLoading(skill.id, false);
        }
        if (isApiClientErrorJson(response)) {
          logger.error(
            "There was a client error updating the repositories for the skill with ID " +
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

export default RepositoriesCell;
