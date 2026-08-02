import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { type MutationActionResponse } from '~/actions';

import { Dialog } from '~/components/dialogs/Dialog';
import { ButtonFooter } from '~/components/structural/ButtonFooter';
import { type DataTableDatum } from '~/components/tables';

export interface DeleteConfirmationDialogProps<M extends DataTableDatum, T> {
  readonly action: (ids: string[]) => Promise<MutationActionResponse<T>>;
  readonly data: M[];
  readonly isOpen: boolean;
  readonly modelName?: string;
  readonly onCancel: () => void;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

export const DeleteConfirmationDialog = <M extends DataTableDatum, T>({
  action,
  data,
  isOpen,
  modelName = 'row',
  onCancel,
  onClose,
  onSuccess,
}: DeleteConfirmationDialogProps<M, T>) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, transition] = useTransition();
  const router = useRouter();

  if (data.length === 0) {
    return null;
  }
  const reference = `${modelName.toLowerCase()}${data.length === 1 ? '' : 's'}`;

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose}>
      <Dialog className='w-[500px]'>
        <Dialog.Close />
        <Dialog.Title>Confirmation</Dialog.Title>
        <Dialog.Content>
          <Dialog.Description>
            {`You are about to delete ${data.length} ${reference}. Would you like to continue?`}
          </Dialog.Description>
        </Dialog.Content>
        <Dialog.Footer>
          <ButtonFooter
            isSubmitting={isDeleting || pending}
            onCancel={onCancel}
            onSubmit={async () => {
              setIsDeleting(true);
              let response: Awaited<ReturnType<typeof action>> | null = null;
              try {
                response = await action(data.map(d => d.id));
              } catch (e) {
                logger.errorUnsafe(e, `There was an error deleting the ${reference}!`, {
                  [reference]: data.map(sub => sub.id),
                });
                toast.error(`There was an error deleting the ${reference}.`);
              }
              if (response) {
                const { error } = response;
                if (error) {
                  logger.error(error, `There was an error deleting the ${reference}!`, {
                    [reference]: data.map(d => d.id),
                  });
                  toast.error(`There was an error deleting the ${reference}.`);
                } else {
                  toast.success(`Successfully deleted the ${reference}.`);
                  transition(() => {
                    router.refresh();
                    onSuccess();
                  });
                }
              }
            }}
            orientation='full-width'
            submitButtonType='button'
            submitText='Delete'
          />
        </Dialog.Footer>
      </Dialog>
    </Dialog.Root>
  );
};
