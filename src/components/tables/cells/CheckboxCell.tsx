import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { type MutationActionResponse } from "~/actions-v2";

import { Checkbox } from "~/components/input/Checkbox";
import type * as types from "~/components/tables/types";

type CheckboxCellModel<N extends string> = { id: string; $kind: string } & {
  [key in N]: boolean;
};

type CheckboxCellAction<T> = (id: string, value: boolean) => Promise<MutationActionResponse<T>>;

interface CheckboxCellProps<
  M extends CheckboxCellModel<N>,
  N extends string,
  C extends types.DataTableColumnConfig<M>,
  T,
> {
  readonly model: M;
  readonly table: types.CellDataTableInstance<M, C>;
  readonly attribute: N;
  readonly errorMessage: string;
  readonly action: CheckboxCellAction<T>;
}

export const CheckboxCell = <
  M extends CheckboxCellModel<N>,
  N extends string,
  C extends types.DataTableColumnConfig<M>,
  T,
>({
  model,
  table,
  attribute,
  errorMessage,
  action,
}: CheckboxCellProps<M, N, C, T>): JSX.Element => {
  const router = useRouter();
  const [_, transition] = useTransition();
  const [checked, setChecked] = useState<boolean>(model[attribute]);

  useEffect(() => {
    setChecked(model[attribute]);
  }, [model, attribute]);

  return (
    <Checkbox
      value={checked}
      onChange={async evt => {
        // Set checked state optimistically.
        setChecked(evt.target.checked);
        table.setRowLoading(model.id, true);

        let response: Awaited<ReturnType<typeof action>> | undefined = undefined;
        try {
          response = await action(model.id, evt.target.checked);
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error changing the boolean attribute '${attribute}' for model of type ` +
              `'${model.$kind}' to '${evt.target.checked}'.`,
            { modelId: model.id },
          );
          table.setRowLoading(model.id, false);
          return toast.error(errorMessage);
        }
        const { error } = response;
        if (error) {
          logger.error(
            error,
            `There was an error changing the boolean attribute '${attribute}' for model of type ` +
              `'${model.$kind}' to '${evt.target.checked}'.`,
            { modelId: model.id },
          );
          table.setRowLoading(model.id, false);
          return toast.error(errorMessage);
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        transition(() => {
          router.refresh();
          table.setRowLoading(model.id, false);
        });
      }}
    />
  );
};
