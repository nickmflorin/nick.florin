import { type Ref } from 'react';

import { FilterButton, type FilterButtonInstance, type FilterButtonProps } from './FilterButton';

export interface HighlightedFilterButtonProps extends Omit<
  FilterButtonProps,
  'classNames' | 'icons' | 'ref'
> {
  readonly ref?: Ref<FilterButtonInstance>;
}

export const HighlightedFilterButton = ({ ref, ...props }: HighlightedFilterButtonProps) => (
  <FilterButton {...props} icons={{ false: 'ban', true: 'star' }} ref={ref} />
);
