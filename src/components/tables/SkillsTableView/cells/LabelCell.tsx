"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { toast } from "react-toastify";

import type * as types from "../../types";

import { logger } from "~/application/logger";
import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/update-skill";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";

interface LabelCellProps {
  readonly skill: ApiSkill;
  readonly table: types.TableInstance<ApiSkill>;
}

export const LabelCell = ({ skill, table }: LabelCellProps): JSX.Element => {
  const router = useRouter();

  const input = useReadWriteTextInput();

  useEffect(() => {
    input.current.setValue(skill.label);
  }, [skill, input]);

  return (
    <ReadWriteTextInput
      ref={input}
      initialValue={skill.label}
      onPersist={async label => {
        table.setRowLoading(skill.id, true);
        try {
          await updateSkill(skill.id, { label });
        } catch (e) {
          logger.error(e);
          toast.error("There was an error updating the skill.");
        } finally {
          table.setRowLoading(skill.id, false);
          /* Refresh regardless of the outcome because if there is an error, the field needs to
             be reverted.  We may consider manually applying the reversion without a round trip
             server request in the future. */
          router.refresh();
        }
      }}
    />
  );
};
