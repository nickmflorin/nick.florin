import { useRouter } from "next/navigation";
import { useState, useEffect, useTransition } from "react";

import { toast } from "react-toastify";

import { logger } from "~/internal/logger";

import { type MutationActionResponse } from "~/actions";

import type {
  AllowedSelectValue,
  DataSelectChangeHandler,
  SelectBehaviorType,
  SelectValue,
  DataSelectModel,
} from "~/components/input/select";
import type * as types from "~/components/tables/types";

interface BaseSelectProps<
  B extends SelectBehaviorType,
  M extends DataSelectModel<V>,
  V extends AllowedSelectValue,
> {
  readonly isClearable?: boolean;
  readonly popoverClassName?: string;
  readonly inputClassName: string;
  readonly summarizeValueAfter?: number;
  readonly inPortal?: boolean;
  readonly value: SelectValue<V, B>;
  readonly behavior: B;
  readonly onChange: DataSelectChangeHandler<M, { behavior: B; getItemValue: (m: M) => V }>;
}

interface SelectCellProps<
  B extends SelectBehaviorType,
  M extends DataSelectModel<V>,
  R extends types.DataTableDatum,
  V extends AllowedSelectValue,
  T,
> {
  readonly inputClassName?: string;
  readonly errorMessage: string;
  readonly row: R;
  readonly behavior: B;
  readonly attribute: string;
  readonly value: SelectValue<V, B>;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly table: types.CellDataTableInstance<R, any>;
  readonly component: React.ComponentType<BaseSelectProps<B, M, V>>;
  readonly action: (value: SelectValue<V, B>) => Promise<MutationActionResponse<T>>;
}

export const SelectCell = <
  B extends SelectBehaviorType,
  M extends DataSelectModel<V>,
  R extends types.DataTableDatum,
  V extends AllowedSelectValue,
  T,
>({
  row,
  behavior,
  attribute,
  action,
  table,
  value: _value,
  errorMessage,
  inputClassName = "w-full",
  component: Component,
}: SelectCellProps<B, M, R, V, T>): JSX.Element => {
  const [value, setValue] = useState<SelectValue<V, B>>(_value);
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(_value);
  }, [_value]);

  return (
    <Component
      inputClassName={inputClassName}
      value={value}
      summarizeValueAfter={2}
      isClearable
      inPortal
      behavior={behavior}
      onChange={async (v, { item }) => {
        // Optimistically update the value.
        setValue(v);
        table.setRowLoading(row.id, true);
        item?.setLoading(true);

        let response: MutationActionResponse<T> | undefined = undefined;
        try {
          response = await action(v);
        } catch (e) {
          logger.errorUnsafe(
            e,
            `There was an error updating the ${String(attribute)} of the ${row.id}.`,
            { value: v },
          );
          table.setRowLoading(row.id, false);
          item?.setLoading(false);
          return toast.error(errorMessage);
        }
        const { error } = response;
        if (error) {
          logger.error(
            error,
            `There was an error updating the ${String(attribute)} of the ${row.id}.`,
            { value: v },
          );
          table.setRowLoading(row.id, false);
          item?.setLoading(false);
          return toast.error(errorMessage);
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        transition(() => {
          router.refresh();
          table.setRowLoading(row.id, false);
          item?.setLoading(false);
        });
      }}
    />
  );
};
