import clsx from "clsx";

import { Button } from "~/components/buttons/generic";

import { TableSearchInput, type TableSearchInputProps } from "./TableSearchInput";

export interface TableSearchBarProps extends TableSearchInputProps {
  readonly onNew: () => void;
}

export const TableSearchBar = ({
  onNew,
  searchParamName,
  onCreate,
  ...props
}: TableSearchBarProps) => (
  <div {...props} className={clsx("flex flex-row w-full gap-[8px]", props.className)}>
    <TableSearchInput searchParamName={searchParamName} onCreate={onCreate} />
    <Button.Primary onClick={() => onNew()}>New</Button.Primary>
  </div>
);

export default TableSearchBar;
