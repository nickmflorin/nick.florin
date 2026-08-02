import { FilterButton, type FilterButtonProps } from './FilterButton';

export interface VisibleFilterButtonProps extends Omit<FilterButtonProps, 'classNames' | 'icons'> {}

export const VisibleFilterButton = (props: VisibleFilterButtonProps) => (
  <FilterButton {...props} icons={{ false: 'eye-slash', true: 'eye' }} />
);
