"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "react-toastify";

import type * as types from "../../types";

import { updateSkill } from "~/app/actions/updateSkill";
import { logger } from "~/application/logger";
import { slugify } from "~/lib/formatters";
import { type ApiSkill, type Skill } from "~/prisma/model";
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
            logger.error(e);
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
          let updatedSkill: Skill | undefined = undefined;
          try {
            updatedSkill = await updateSkill(skill.id, { refreshSlug: true });
          } catch (e) {
            logger.error(e);
            toast.error("There was an error updating the skill.");
          } finally {
            setLoading(false);
          }
          if (updatedSkill) {
            input.current.setValue(updatedSkill.slug, { state: "reading" });
          }
          transition(() => {
            router.refresh();
          });
        }}
      />
    </div>
  );
};

export default SlugCell;
