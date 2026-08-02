import { type JSX } from 'react';

import { Checkbox } from '~/components/input/Checkbox';

export interface RowSelectCellProps {
  readonly isSelected: boolean;
  readonly onSelect?: (checked: boolean) => void;
}

export const RowSelectCell = ({ isSelected, onSelect }: RowSelectCellProps): JSX.Element => (
  <div className='flex flex-row items-center justify-center'>
    <Checkbox isChecked={isSelected} onChange={e => onSelect?.(e.target.checked)} readOnly />
  </div>
);
