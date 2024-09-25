import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { deleteEducations } from "~/actions-v2/educations/delete-educations";

import { Dialog } from "~/components/dialogs/Dialog";
import { ButtonFooter } from "~/components/structural/ButtonFooter";
import type { EducationsTableModel } from "~/features/educations";

export interface DeleteEducationsConfirmationDialogProps {
  readonly isOpen: boolean;
  readonly rows: EducationsTableModel[];
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly onCancel: () => void;
}

export const DeleteEducationsConfirmationDialog = ({
  isOpen,
  rows,
  onSuccess,
  onCancel,
  onClose,
}: DeleteEducationsConfirmationDialogProps) => {
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
            {`You are about to delete ${rows.length} educations. Would you like to continue?`}
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
              let response: Awaited<ReturnType<typeof deleteEducations>> | null = null;
              try {
                response = await deleteEducations(rows.map(sub => sub.id));
              } catch (e) {
                logger.errorUnsafe(e, "There was an error deleting the education(s)!", {
                  educations: rows.map(sub => sub.id),
                });
                toast.error(
                  `There was an error deleting the education${rows.length === 1 ? "" : "s"}.`,
                );
              }
              if (response) {
                const { error } = response;
                if (error) {
                  logger.error("There was an error deleting the education(s)!", {
                    educations: rows.map(sub => sub.id),
                    error,
                  });
                  toast.error(
                    `There was an error deleting the education${rows.length === 1 ? "" : "s"}.`,
                  );
                } else {
                  toast.success(
                    rows.length === 1
                      ? "Successfully deleted the education."
                      : "Successfully deleted the educations.",
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

export default DeleteEducationsConfirmationDialog;
