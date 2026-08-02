import type * as types from './types';

import { Button } from '~/components/buttons';
import { CaretIcon } from '~/components/icons/CaretIcon';
import { DataSelect, type DataSelectProps } from '~/components/input/select/DataSelect';

const getModelValue = <D extends types.DataTableDatum, C extends types.DataTableColumnConfig<D>>(
  m: C,
): C['id'] => m.id;

export interface ColumnSelectProps<
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
> extends Omit<
  DataSelectProps<C, { behavior: 'multi'; getModelValue: typeof getModelValue<D, C> }>,
  'data' | 'options'
> {
  readonly columns: C[];
}

export const ColumnSelect = <
  D extends types.DataTableDatum,
  C extends types.DataTableColumnConfig<D>,
>({
  columns,
  ...props
}: ColumnSelectProps<D, C>) => (
  <DataSelect<C, { behavior: 'multi'; getModelValue: typeof getModelValue<D, C> }>
    {...props}
    data={columns.filter(c => c.isHideable !== false)}
    getModelValueLabel={(m: C) => m.label ?? ''}
    inputClassName='w-[240px]'
    itemRenderer={m => m.label ?? ''}
    options={{ behavior: 'multi', getModelValue: getModelValue as typeof getModelValue<D, C> }}
    popoverClassName='z-50'
    popoverMaxHeight={260}
    popoverOffset={{ crossAxis: -50, mainAxis: 4 }}
    popoverWidth='available'
  >
    {({ isOpen, params, ref }) => (
      <Button.Solid
        {...params}
        icon={{ right: <CaretIcon isOpen={isOpen} /> }}
        ref={ref}
        scheme='secondary'
      >
        Columns
      </Button.Solid>
    )}
  </DataSelect>
);
