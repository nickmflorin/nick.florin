import { useRouter } from 'next/navigation';
import { type JSX, useEffect } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { type ApiClientErrorJson, isApiClientErrorJson } from '~/api';

import { ReadWriteTextInput, useReadWriteTextInput } from '~/components/input/ReadWriteTextInput';
import type * as types from '~/components/tables/types';

/**
 * @deprecated Keeping this around just for reference, even though it is not used.
 */
export interface EditableStringCellProps<
  M extends { id: string } & Record<K, null | string>,
  K extends keyof M,
  P extends Record<K, string>,
  T,
> {
  readonly action: (data: P) => Promise<ApiClientErrorJson | T>;
  readonly errorMessage: string;
  readonly field: K;
  readonly model: M;
  readonly table: types.CellDataTableInstance<M>;
}

/**
 * @deprecated Keeping this around just for reference, even though it is not used.
 */
export type EditableStringCellComponent = <
  M extends { id: string } & Record<K, null | string>,
  K extends keyof M,
  P extends Record<K, string>,
  T,
>(
  props: EditableStringCellProps<M, K, P, T>,
) => JSX.Element;

/**
 * @deprecated Keeping this around just for reference, even though it is not used.
 */
export const EditableStringCell = <
  M extends { id: string } & Record<K, null | string>,
  K extends keyof M,
  P extends Record<K, string>,
  T,
>({
  action,
  errorMessage,
  field,
  model,
  table,
}: EditableStringCellProps<M, K, P, T>): JSX.Element => {
  const router = useRouter();

  const input = useReadWriteTextInput();

  useEffect(() => {
    input.current.setValue(model[field] ?? '');
  }, [model, field, input]);

  return (
    <ReadWriteTextInput
      initialValue={model[field] ?? ''}
      onPersist={async value => {
        table.setRowLoading(model.id, true);

        let response: ApiClientErrorJson | null | T = null;
        try {
          response = await action({ [field]: value } as P);
        } catch (e) {
          logger.error(
            `There was a server error updating the field '${String(field)}' for the model:\n` +
              String(e),
            {
              error: e,
              field,
              model,
            },
          );
          toast.error(errorMessage);
        } finally {
          table.setRowLoading(model.id, false);
        }
        if (isApiClientErrorJson(response)) {
          logger.error(
            `There was a client error updating the field '${String(field)}' for the model.`,
            {
              field,
              model,
              response,
            },
          );
          toast.error(errorMessage);
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        router.refresh();
      }}
      ref={input}
    />
  );
};
