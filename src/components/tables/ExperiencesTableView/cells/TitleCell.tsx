"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import type * as types from "../../types";

import { logger } from "~/application/logger";
import { type ApiExperience } from "~/prisma/model";
import { updateSkill } from "~/actions/update-skill";

import { EditableStringCell } from "../../cells";

interface LabelCellProps {
  readonly experience: ApiExperience;
  readonly table: types.TableInstance<ApiExperience>;
}

export const TitleCell = ({ experience, table }: LabelCellProps): JSX.Element => {
  const router = useRouter();
  const [_, transition] = useTransition();

  return (
    <EditableStringCell
      value={experience.title}
      onPersist={async label => {
        table.setRowLoading(experience.id, true);
        try {
          await updateSkill(experience.id, { label });
        } catch (e) {
          logger.error(e);
        } finally {
          table.setRowLoading(experience.id, false);
        }
        transition(() => {
          router.refresh();
        });
      }}
    />
  );
};
