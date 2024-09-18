import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiExperience } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateExperience } from "~/actions/mutations/experiences";
import { isApiClientErrorJson } from "~/api";

import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";

interface SkillsCellProps {
  readonly experience: ApiExperience<["skills"]>;
}

export const SkillsCell = ({ experience }: SkillsCellProps) => {
  const [optimisticValue, setOptimisticValue] = useState<string[]>(
    experience.skills.map(s => s.id),
  );
  const [_, transition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setOptimisticValue(experience.skills.map(s => s.id));
  }, [experience.skills]);

  return (
    <SkillsSelect
      behavior="multi"
      value={optimisticValue}
      onChange={async (v, { item }) => {
        setOptimisticValue(v);
        item?.setLoading(true);
        let response: Awaited<ReturnType<typeof updateExperience>> | null = null;
        try {
          response = await updateExperience(experience.id, { skills: v });
        } catch (e) {
          logger.error(
            "There was a server error updating the skills for the experience with " +
              `ID '${experience.id}':\n${e}`,
            {
              error: e,
              experience,
              skills: v,
            },
          );
          toast.error("There was an error updating the experience.");
        } finally {
          item?.setLoading(false);
        }
        if (isApiClientErrorJson(response)) {
          logger.error(
            "There was a client error updating the skills for the experience with " +
              `ID '${experience.id}'.`,
            {
              response,
              experience,
              skills: v,
            },
          );
          toast.error("There was an error updating the experience.");
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
