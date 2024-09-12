import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";
import { type ApiExperience } from "~/prisma/model";

import { updateExperience } from "~/actions/mutations/experiences";
import { isApiClientErrorJson } from "~/api";

import { SkillsSelect, type SkillSelectValueModel } from "~/components/input/select/SkillsSelect";

interface SkillsCellProps {
  readonly experience: ApiExperience<["skills"]>;
}

export const SkillsCell = ({ experience }: SkillsCellProps) => {
  const [optimisticValue, setOptimisticValue] = useState<SkillSelectValueModel[]>(
    experience.skills.map(s => ({ id: s.id, label: s.label, value: s.id })),
  );
  const [_, transition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setOptimisticValue(experience.skills.map(s => ({ id: s.id, label: s.label, value: s.id })));
  }, [experience.skills]);

  return (
    <SkillsSelect
      value={optimisticValue}
      onChange={async (v, { item }) => {
        setOptimisticValue(v);
        item.setLoading(true);
        let response: Awaited<ReturnType<typeof updateExperience>> | null = null;
        try {
          response = await updateExperience(experience.id, { skills: v.map(sk => sk.id) });
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
          item.setLoading(false);
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
