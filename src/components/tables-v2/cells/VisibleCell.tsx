import { useRouter } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { isApiClientErrorJson, type ApiClientErrorJson } from "~/api-v2";

import { Checkbox } from "~/components/input/Checkbox";
import type * as types from "~/components/tables-v2/types";

export interface VisibleCellProps<
  M extends { id: string; visible: boolean },
  C extends types.DataTableColumnConfig<M>,
  T,
> {
  readonly model: M;
  readonly table: types.CellDataTableInstance<M, C>;
  readonly errorMessage: string;
  readonly action: (id: string, data: { visible: boolean }) => Promise<T | ApiClientErrorJson>;
}

export type VisibleCellComponent = {
  <M extends { id: string; visible: boolean }, C extends types.DataTableColumnConfig<M>, T>(
    props: VisibleCellProps<M, C, T>,
  ): JSX.Element;
};

export const VisibleCell = <
  M extends { id: string; visible: boolean },
  C extends types.DataTableColumnConfig<M>,
  T,
>({
  model,
  action,
  errorMessage,
  table,
}: VisibleCellProps<M, C, T>): JSX.Element => {
  const router = useRouter();
  const [_, transition] = useTransition();
  const [checked, setChecked] = useState(model.visible);

  useEffect(() => {
    setChecked(model.visible);
  }, [model.visible]);

  return (
    <div className="flex flex-row items-center justify-center">
      <Checkbox
        value={checked}
        onChange={async e => {
          e.stopPropagation();
          e.preventDefault();

          // Set checked state optimistically.
          setChecked(e.target.checked);
          table.setRowLoading(model.id, true);

          let response: Awaited<ReturnType<typeof action>> | null = null;
          try {
            response = await action(model.id, { visible: e.target.checked });
          } catch (e) {
            logger.error(`There was a server error changing the visibility for the model.`, {
              error: e,
              model,
            });
            toast.error(errorMessage);
          } finally {
            table.setRowLoading(model.id, false);
          }
          if (isApiClientErrorJson(response)) {
            logger.error("There was a server error changing the visibility for the model.", {
              response,
              model,
            });
            toast.error(errorMessage);
          }
          /* Refresh the state from the server regardless of whether or not the request succeeded.
             In the case the request failed, this is required to revert the changes back to their
             original state. */
          transition(() => {
            router.refresh();
          });
        }}
      />
    </div>
  );
};

export default VisibleCell;
