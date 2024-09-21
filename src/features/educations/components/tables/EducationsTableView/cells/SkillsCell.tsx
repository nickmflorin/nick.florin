import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { toast } from "react-toastify";

import { type ApiEducation } from "~/database/model";
import { logger } from "~/internal/logger";

import { updateEducation } from "~/actions/mutations/educations";
import { isApiClientErrorJson } from "~/api";

import { SkillsSelect } from "~/features/skills/components/input/SkillsSelect";

interface SkillsCellProps {
  readonly education: ApiEducation<["skills"]>;
}

export const SkillsCell = ({ education }: SkillsCellProps) => {
  const [optimisticValue, setOptimisticValue] = useState<string[]>(education.skills.map(s => s.id));
  const [_, transition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setOptimisticValue(education.skills.map(s => s.id));
  }, [education.skills]);

  return (
    <SkillsSelect
      behavior="multi"
      value={optimisticValue}
      summarizeValueAfter={2}
      onChange={async (v, { item }) => {
        setOptimisticValue(v);
        item?.setLoading(true);
        let response: Awaited<ReturnType<typeof updateEducation>> | null = null;
        try {
          response = await updateEducation(education.id, { skills: v });
        } catch (e) {
          logger.error(
            "There was a server error updating the skills for the education with " +
              `ID '${education.id}':\n${e}`,
            {
              error: e,
              education,
              skills: v,
            },
          );
          toast.error("There was an error updating the education.");
        } finally {
          item?.setLoading(false);
        }
        if (isApiClientErrorJson(response)) {
          logger.error(
            "There was a client error updating the skills for the education with " +
              `ID '${education.id}'.`,
            {
              response,
              education,
              skills: v,
            },
          );
          toast.error("There was an error updating the education.");
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
