import { useRouter } from 'next/navigation';
import { type ComponentType, type JSX, useEffect, useState, useTransition } from 'react';

import { toast } from 'react-toastify';

import { logger } from '~/internal/logger';

import { type MutationActionResponse } from '~/actions';

import {
  type AllowedSelectValue,
  type DataSelectModel,
  type SelectBehaviorType,
  type SelectChangeHandler,
  type SelectValue,
} from '~/components/input/select';
import type * as types from '~/components/tables/types';

/**
 * Sets the loading state of the connected menu item associated with a SelectCell change event, when
 * one is available.
 *
 * The item is not defined when the change event is a 'clear', since a clear does not correspond to
 * a specific menu item.
 *
 * @param {{ setLoading: (v: boolean) => void } | undefined} item
 *   The menu item instance associated with the change event, if any.
 * @param {boolean} isLoading The loading state that should be applied to the item.
 */
const setSelectChangeItemLoading = (
  item: { setLoading: (v: boolean) => void } | undefined,
  isLoading: boolean,
) => item?.setLoading(isLoading);

interface BaseSelectProps<
  B extends SelectBehaviorType,
  M extends DataSelectModel<V>,
  V extends AllowedSelectValue,
> {
  readonly behavior: B;
  readonly inputClassName: string;
  readonly isClearable?: boolean;
  readonly isInPortal?: boolean;
  readonly onChange: SelectChangeHandler<
    {
      model: M;
      options: { behavior: B; getModelValue: (m: M) => V };
    },
    { item: true; modelValue: true }
  >;
  readonly popoverClassName?: string;
  readonly summarizeValueAfter?: number;
  readonly value: SelectValue<{ behavior: B; value: V }>;
}

interface SelectCellProps<
  B extends SelectBehaviorType,
  M extends DataSelectModel<V>,
  R extends types.DataTableDatum,
  V extends AllowedSelectValue,
  T,
> {
  readonly action: (
    value: SelectValue<{ behavior: B; value: V }>,
  ) => Promise<MutationActionResponse<T>>;
  readonly attribute: string;
  readonly behavior: B;
  readonly component: ComponentType<BaseSelectProps<B, M, V>>;
  readonly errorMessage: string;
  readonly inputClassName?: string;
  readonly row: R;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  readonly table: types.CellDataTableInstance<R, any>;
  readonly value: SelectValue<{ behavior: B; value: V }>;
}

export const SelectCell = <
  B extends SelectBehaviorType,
  M extends DataSelectModel<V>,
  R extends types.DataTableDatum,
  V extends AllowedSelectValue,
  T,
>({
  action,
  attribute,
  behavior,
  component: Component,
  errorMessage,
  inputClassName = 'w-full',
  row,
  table,
  value: _value,
}: SelectCellProps<B, M, R, V, T>): JSX.Element => {
  const [value, setValue] = useState<SelectValue<{ behavior: B; value: V }>>(_value);
  const router = useRouter();
  const [_, transition] = useTransition();

  useEffect(() => {
    setValue(_value);
  }, [_value]);

  return (
    <Component
      behavior={behavior}
      inputClassName={inputClassName}
      isClearable
      isInPortal
      onChange={async (v, params) => {
        setValue(v);
        table.setRowLoading(row.id, true);
        setSelectChangeItemLoading(params.item, true);

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
          setSelectChangeItemLoading(params.item, false);
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
          setSelectChangeItemLoading(params.item, false);
          return toast.error(errorMessage);
        }
        /* Refresh the state from the server regardless of whether or not the request succeeded.
           In the case the request failed, this is required to revert the changes back to their
           original state. */
        transition(() => {
          router.refresh();
          table.setRowLoading(row.id, false);
          setSelectChangeItemLoading(params.item, false);
        });
      }}
      summarizeValueAfter={2}
      value={value}
    />
  );
};
