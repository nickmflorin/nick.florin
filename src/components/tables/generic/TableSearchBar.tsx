import clsx from "clsx";

import { type ComponentProps } from "~/components/types";

export interface TableSearchBarProps extends ComponentProps {
  readonly children?: JSX.Element | JSX.Element[];
}

export const TableSearchBar = ({ children, ...props }: TableSearchBarProps) => (
  <div {...props} className={clsx("flex flex-row w-full gap-[8px]", props.className)}>
    {children}
  </div>
);

export default TableSearchBar;
