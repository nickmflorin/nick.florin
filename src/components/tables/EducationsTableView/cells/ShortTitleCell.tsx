"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { toast } from "react-toastify";

import type * as types from "../../types";

import { logger } from "~/application/logger";
import { type ApiExperience } from "~/prisma/model";
import { updateExperience } from "~/actions/update-experience";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";

interface ShortTitleCellProps {
  readonly experience: ApiExperience;
  readonly table: types.TableInstance<ApiExperience>;
}

export const ShortTitleCell = ({ experience, table }: ShortTitleCellProps): JSX.Element => {
  const router = useRouter();

  const input = useReadWriteTextInput();

  useEffect(() => {
    input.current.setValue(experience.shortTitle ?? "");
  }, [experience, input]);

  return (
    <ReadWriteTextInput
      ref={input}
      initialValue={experience.shortTitle ?? ""}
      onPersist={async shortTitle => {
        table.setRowLoading(experience.id, true);
        try {
          await updateExperience(experience.id, { shortTitle });
        } catch (e) {
          logger.error(e);
          toast.error("There was an error updating the experience.");
        } finally {
          table.setRowLoading(experience.id, false);
          /* Refresh regardless of the outcome because if there is an error, the field needs to
             be reverted.  We may consider manually applying the reversion without a round trip
             server request in the future. */
          router.refresh();
        }
      }}
    />
  );
};
