import clsx from "clsx";

import { Button } from "~/components/buttons/generic";

import { TableSearchInput, type TableSearchInputProps } from "./TableSearchInput";

export interface TableSearchBarProps extends TableSearchInputProps {
  readonly children?: JSX.Element | JSX.Element;
  readonly onNew: () => void;
}

export const TableSearchBar = ({
  onNew,
  searchParamName,
  children,
  onCreate,
  ...props
}: TableSearchBarProps) => (
  <div {...props} className={clsx("flex flex-row w-full gap-[8px]", props.className)}>
    <TableSearchInput className="grow" searchParamName={searchParamName} onCreate={onCreate} />
    <Button.Primary onClick={() => onNew()}>New</Button.Primary>
    {children}
  </div>
);

export default TableSearchBar;
