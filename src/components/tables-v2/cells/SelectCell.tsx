import { Checkbox } from "~/components/input/Checkbox";

export interface SelectCellProps {
  readonly isSelected: boolean;
  readonly onSelect?: (checked: boolean) => void;
}

export const SelectCell = ({ isSelected, onSelect }: SelectCellProps): JSX.Element => (
  <div className="flex flex-row items-center justify-center">
    <Checkbox readOnly value={isSelected} onChange={e => onSelect?.(e.target.checked)} />
  </div>
);

export default SelectCell;
