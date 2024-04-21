import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { type ApiProject } from "~/prisma/model";
import { updateProject } from "~/actions/mutations/projects";
import { isApiClientErrorJson } from "~/api";
import { SkillsSelect } from "~/components/input/select/SkillsSelect";

interface SkillsCellProps {
  readonly project: ApiProject<["skills"]>;
}

export const SkillsCell = ({ project }: SkillsCellProps) => {
  const [optimisticValue, setOptimisticValue] = useState<string[]>(project.skills.map(s => s.id));
  const [_, transition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setOptimisticValue(project.skills.map(s => s.id));
  }, [project.skills]);

  return (
    <SkillsSelect
      value={optimisticValue}
      onChange={async (v, { item }) => {
        setOptimisticValue(v);
        item.setLoading(true);
        let response: Awaited<ReturnType<typeof updateProject>> | null = null;
        try {
          response = await updateProject(project.id, { skills: v });
        } catch (e) {
          logger.error(
            "There was a server error updating the skills for the project with " +
              `ID '${project.id}':\n${e}`,
            {
              error: e,
              project,
              skills: v,
            },
          );
          toast.error("There was an error updating the project.");
        } finally {
          item.setLoading(false);
        }
        if (isApiClientErrorJson(response)) {
          logger.error(
            "There was a client error updating the skills for the project with " +
              `ID '${project.id}'.`,
            {
              response,
              project,
              skills: v,
            },
          );
          toast.error("There was an error updating the project.");
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

export default SkillsCell;
