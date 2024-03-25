"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";

import { toast } from "react-toastify";

import type * as types from "../../types";

import { slugify } from "~/lib/formatters";
import { type ApiSkill } from "~/prisma/model";
import { updateSkill } from "~/actions/mutations/update-skill";
import { IconButton } from "~/components/buttons";
import { ReadWriteTextInput, useReadWriteTextInput } from "~/components/input/ReadWriteTextInput";

interface SlugCellProps {
  readonly skill: ApiSkill;
  readonly table: types.TableInstance<ApiSkill>;
}

export const SlugCell = ({ skill, table }: SlugCellProps): JSX.Element => {
  const input = useReadWriteTextInput();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    input.current.setValue(skill.slug);
  }, [skill, input]);

  return (
    <div className="flex flex-row justify-between gap-[12px]">
      <ReadWriteTextInput
        ref={input}
        initialValue={skill.slug}
        onPersist={async slug => {
          table.setRowLoading(skill.id, true);
          try {
            await updateSkill(skill.id, { slug });
          } catch (e) {
            const logger = (await import("~/application/logger")).logger;
            logger.error(
              `There was an error updating the slug for the skill with ID '${skill.id}':\n${e}`,
              {
                error: e,
                skill: skill.id,
                slug,
              },
            );
            toast.error("There was an error updating the skill.");
          } finally {
            table.setRowLoading(skill.id, false);
          }
          transition(() => {
            router.refresh();
          });
        }}
      />
      <IconButton.Transparent
        icon={{ name: "refresh" }}
        className="text-blue-600"
        disabledClassName="text-disabled"
        isLoading={loading}
        isDisabled={skill.slug === slugify(skill.label)}
        onClick={async () => {
          setLoading(true);
          try {
            await updateSkill(skill.id, { slug: null });
          } catch (e) {
            const logger = (await import("~/application/logger")).logger;
            logger.error(
              `There was an error updating the slug for the skill with ID '${skill.id}':\n${e}`,
              {
                error: e,
                skill: skill.id,
                slug: null,
              },
            );
            toast.error("There was an error updating the skill.");
          } finally {
            setLoading(false);
            /* Refresh regardless of the outcome because if there is an error, the field needs to
               be reverted.  We may consider manually applying the reversion without a round trip
               server request in the future. */
            transition(() => {
              router.refresh();
            });
          }
        }}
      />
    </div>
  );
};

export default SlugCell;
