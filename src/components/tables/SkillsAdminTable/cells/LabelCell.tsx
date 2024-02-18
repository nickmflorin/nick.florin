"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import type * as types from "../../types";

import { updateSkill } from "~/app/actions/updateSkill";
import { logger } from "~/application/logger";
import { type ApiSkill } from "~/prisma/model";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";

interface LabelCellProps {
  readonly skill: ApiSkill;
  readonly table: types.TableInstance<ApiSkill>;
}

export const LabelCell = ({ skill, table }: LabelCellProps): JSX.Element => {
  const input = useReadWriteTextInput();
  const router = useRouter();
  const [_, transition] = useTransition();

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
        } finally {
          table.setRowLoading(skill.id, false);
        }
        transition(() => {
          router.refresh();
        });
      }}
    />
  );
};

export default LabelCell;
