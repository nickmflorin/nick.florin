"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition, useRef } from "react";

import isEqual from "lodash.isequal";

import { updateSkill } from "~/app/actions/updateSkill";
import { ExperienceSelect } from "~/components/input/select/ExperienceSelect";
import { type ApiSkill, type ApiExperience } from "~/prisma/model";

interface ExperiencesCellProps {
  readonly skill: ApiSkill;
  readonly experiences: Omit<ApiExperience, "skills" | "details">[];
}

export const ExperiencesCell = ({ skill, experiences }: ExperiencesCellProps): JSX.Element => {
  const lastSaved = useRef<string[]>(skill.experiences.map(exp => exp.id));
  const [value, setValue] = useState(skill.experiences.map(exp => exp.id));
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(skill.experiences.map(exp => exp.id));
  }, [skill.experiences]);

  return (
    <ExperienceSelect
      inputClassName="w-[300px]"
      menuClassName="max-h-[260px]"
      data={experiences}
      value={value}
      onChange={v => setValue(v)}
      onClose={async (e, { instance }) => {
        /* Note: We may run into race conditions here if the user closes the select, reopens it
           and then makes a change before the original change had time to complete it's round trip
           request to the API.  Should be investigated further... */
        if (!isEqual(value, lastSaved.current)) {
          // TODO: Consider reverting the change if the request fails.
          instance.setLoading(true);
          try {
            await updateSkill(skill.id, { experiences: value });
          } catch (e) {
            /* eslint-disable-next-line no-console -- Need to handle the error better! */
            console.error(e);
            return false;
          } finally {
            lastSaved.current = value;
            instance.setLoading(false);
          }
          // TODO: Do we need to do this?  The updated value should be in state?
          transition(() => {
            router.refresh();
          });
        }
      }}
    />
  );
};

export default ExperiencesCell;
