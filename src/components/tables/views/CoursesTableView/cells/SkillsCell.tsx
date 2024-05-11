import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { type ApiCourse } from "~/prisma/model";
import { updateCourse } from "~/actions/mutations/courses";
import { isApiClientErrorJson } from "~/api";
import { SkillsSelect, type SkillSelectValueModel } from "~/components/input/select/SkillsSelect";

interface SkillsCellProps {
  readonly course: ApiCourse<["skills"]>;
}

export const SkillsCell = ({ course }: SkillsCellProps) => {
  const [optimisticValue, setOptimisticValue] = useState<SkillSelectValueModel[]>(
    course.skills.map(s => ({ id: s.id, label: s.label, value: s.id })),
  );
  const [_, transition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setOptimisticValue(course.skills.map(s => ({ id: s.id, label: s.label, value: s.id })));
  }, [course.skills]);

  return (
    <SkillsSelect
      value={optimisticValue}
      onChange={async (v, { item }) => {
        setOptimisticValue(v);
        item.setLoading(true);
        let response: Awaited<ReturnType<typeof updateCourse>> | null = null;
        try {
          response = await updateCourse(course.id, { skills: v.map(sk => sk.id) });
        } catch (e) {
          logger.error(
            "There was a server error updating the skills for the course with " +
              `ID '${course.id}':\n${e}`,
            {
              error: e,
              course,
              skills: v,
            },
          );
          toast.error("There was an error updating the course.");
        } finally {
          item.setLoading(false);
        }
        if (isApiClientErrorJson(response)) {
          logger.error(
            "There was a client error updating the skills for the course with " +
              `ID '${course.id}'.`,
            {
              response,
              course,
              skills: v,
            },
          );
          toast.error("There was an error updating the course.");
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
