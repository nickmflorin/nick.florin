"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { updateSkill } from "~/app/actions/updateSkill";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";
import { type ApiSkill } from "~/prisma/model";

interface LabelCellProps {
  readonly skill: ApiSkill;
}

export const LabelCell = ({ skill }: LabelCellProps): JSX.Element => {
  const input = useReadWriteTextInput();
  const router = useRouter();
  const [_, transition] = useTransition();

  return (
    <ReadWriteTextInput
      ref={input}
      initialValue={skill.label}
      onPersist={async (label, instance) => {
        // TODO: Consider reverting the change if the request fails.
        instance.setLoading(true);
        try {
          await updateSkill(skill.id, { label });
        } catch (e) {
          /* eslint-disable-next-line no-console -- Need to handle the error better! */
          console.error(e);
          return false;
        } finally {
          instance.setLoading(false);
        }
        transition(() => {
          router.refresh();
        });
      }}
    />
  );
};

export default LabelCell;
