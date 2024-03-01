"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";

import { toast } from "react-toastify";

import { logger } from "~/application/logger";
import { type ApiExperience } from "~/prisma/model";
import { deleteExperience } from "~/actions/delete-experience";

import { ActionsCell as RootActionsCell } from "../../cells";

export const ActionsCell = ({ model }: { model: ApiExperience }) => {
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
        params.set("updateExperienceId", model.id);
        replace(`${pathname}?${params.toString()}`);
      }}
      onDelete={async () => {
        let success = true;
        setIsDeleting(true);
        try {
          await deleteExperience(model.id);
        } catch (e) {
          success = false;
          logger.error("There was an error deleting the experience.", {
            error: e,
            skill: model.id,
          });
          toast.error("There was an error deleting the experience.");
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
