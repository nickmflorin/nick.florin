import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { type ApiRepository } from "~/prisma/model";
import { updateRepository } from "~/actions/mutations/repositories";
import { isApiClientErrorJson } from "~/api";
import { SkillsSelect } from "~/components/input/select/SkillsSelect";

interface SkillsCellProps {
  readonly repository: ApiRepository<["skills"]>;
}

export const SkillsCell = ({ repository }: SkillsCellProps) => {
  const [optimisticValue, setOptimisticValue] = useState<string[]>(
    repository.skills.map(s => s.id),
  );
  const [_, transition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setOptimisticValue(repository.skills.map(s => s.id));
  }, [repository.skills]);

  return (
    <SkillsSelect
      value={optimisticValue}
      onChange={async (v, { item }) => {
        setOptimisticValue(v);
        item.setLoading(true);
        let response: Awaited<ReturnType<typeof updateRepository>> | null = null;
        try {
          response = await updateRepository(repository.id, { skills: v });
        } catch (e) {
          logger.error(
            "There was a server error updating the skills for the repository with " +
              `ID '${repository.id}':\n${e}`,
            {
              error: e,
              repository,
              skills: v,
            },
          );
          toast.error("There was an error updating the repository.");
        } finally {
          item.setLoading(false);
        }
        if (isApiClientErrorJson(response)) {
          logger.error(
            "There was a client error updating the skills for the repository with " +
              `ID '${repository.id}'.`,
            {
              response,
              repository,
              skills: v,
            },
          );
          toast.error("There was an error updating the repository.");
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
