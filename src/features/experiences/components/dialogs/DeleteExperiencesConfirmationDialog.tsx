import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { deleteExperiences } from "~/actions-v2/experiences/delete-experiences";

import { Dialog } from "~/components/dialogs/Dialog";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import type { ExperiencesTableModel } from "~/features/experiences";

export interface DeleteExperiencesConfirmationDialogProps {
  readonly isOpen: boolean;
  readonly rows: ExperiencesTableModel[];
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly onCancel: () => void;
}

export const DeleteExperiencesConfirmationDialog = ({
  isOpen,
  rows,
  onSuccess,
  onCancel,
  onClose,
}: DeleteExperiencesConfirmationDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, transition] = useTransition();
  const { refresh } = useRouter();

  return (
    <Dialog.Provider isOpen={isOpen} onClose={onClose}>
      <Dialog className="w-[500px]">
        <Dialog.Close />
        <Dialog.Title>Confirm</Dialog.Title>
        <Dialog.Content>
          <Dialog.Description>
            {`You are about to delete ${rows.length} experiences. Would you like to continue?`}
          </Dialog.Description>
        </Dialog.Content>
        <Dialog.Footer>
          <ButtonFooter
            submitText="Delete"
            submitButtonType="button"
            orientation="full-width"
            isSubmitting={isDeleting || pending}
            onCancel={onCancel}
            onSubmit={async () => {
              setIsDeleting(true);
              let response: Awaited<ReturnType<typeof deleteExperiences>> | null = null;
              try {
                response = await deleteExperiences(rows.map(sub => sub.id));
              } catch (e) {
                logger.errorUnsafe(e, "There was an error deleting the experience(s)!", {
                  experiences: rows.map(sub => sub.id),
                });
                toast.error(
                  `There was an error deleting the experience${rows.length === 1 ? "" : "s"}.`,
                );
              }
              if (response) {
                const { error } = response;
                if (error) {
                  logger.error("There was an error deleting the experience(s)!", {
                    experiences: rows.map(sub => sub.id),
                    error,
                  });
                  toast.error(
                    `There was an error deleting the experience${rows.length === 1 ? "" : "s"}.`,
                  );
                } else {
                  toast.success(
                    rows.length === 1
                      ? "Successfully deleted the experience."
                      : "Successfully deleted the experiences.",
                  );
                  transition(() => {
                    refresh();
                    onSuccess?.();
                  });
                }
              }
            }}
          />
        </Dialog.Footer>
      </Dialog>
    </Dialog.Provider>
  );
};

export default DeleteExperiencesConfirmationDialog;
