"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { type ApiSkill } from "~/prisma/model";
import { deleteSkill } from "~/actions/deleteSkill";

import { ActionsCell as RootActionsCell } from "../../cells/ActionsCell";

export const ActionsCell = ({ model }: { model: ApiSkill }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [_, transition] = useTransition();
  const { refresh, replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  return (
    <RootActionsCell
      isDeleting={isDeleting}
      onEdit={() => {
        const params = new URLSearchParams(searchParams?.toString());
        params.set("updateSkillId", model.id);
        replace(`${pathname}?${params.toString()}`);
      }}
      onDelete={async () => {
        let success = true;
        setIsDeleting(true);
        try {
          await deleteSkill(model.id);
        } catch (e) {
          success = false;
          logger.error("There was an error deleting the skill.", {
            error: e,
            skill: model.id,
          });
          toast.error("There was an error deleting the skill.");
        } finally {
          setIsDeleting(false);
        }
        if (success) {
          transition(() => {
            refresh();
          });
        }
      }}
    />
  );
};
