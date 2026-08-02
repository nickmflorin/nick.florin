import { type JSX, type MouseEventHandler } from 'react';

import type * as types from './types';

import { IconButton } from '~/components/buttons';
import { DataSelect } from '~/components/input/select/DataSelect';

/**
 * Narrows the `onClick` handler that the floating element library embeds in the reference props it
 * provides to the select's trigger, which it types as a record of unknown values.
 */
const isButtonClickHandler = (value: unknown): value is MouseEventHandler<HTMLButtonElement> =>
  typeof value === 'function';

export interface FiltersSelectProps<F extends types.TableFilters> {
  readonly configuration: types.TableFiltersConfiguration<F>;
  readonly excludeFilters?: types.TableFilterId<F>[];
  readonly onChange: (filters: types.TableFilterId<F>[]) => void;
  readonly value: types.TableFilterId<F>[];
}

export const FiltersSelect = <F extends types.TableFilters>({
  configuration,
  excludeFilters = [],
  ...props
}: FiltersSelectProps<F>): JSX.Element | null => {
  const filtered = configuration.filter(
    config => !excludeFilters.includes(config.id) && config.isHideable !== false,
  );
  if (filtered.length === 0) {
    return null;
  }
  return (
    <DataSelect
      {...props}
      data={filtered.map(config => ({ label: config.label, value: config.id }))}
      inputClassName='w-[240px]'
      options={{ behavior: 'multi' }}
      popoverClassName='z-50'
      popoverMaxHeight={260}
      popoverOffset={{ crossAxis: -50, mainAxis: 4 }}
      popoverPlacement='bottom-end'
      popoverWidth='available'
    >
      {({ isOpen, params, ref }) => (
        <IconButton.Transparent
          {...params}
          activeClassName='text-blue-700 bg-gray-100'
          className='text-gray-500 hover:bg-gray-100'
          element='button'
          icon='ellipsis-h'
          isActive={isOpen}
          onClick={e => {
            e.stopPropagation();
            if (isButtonClickHandler(params.onClick)) {
              params.onClick(e);
            }
          }}
          radius='full'
          ref={ref}
          size='medium'
        />
      )}
    </DataSelect>
  );
};
