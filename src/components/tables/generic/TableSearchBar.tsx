import { memo } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

export interface TableSearchBarProps extends ComponentProps {
  readonly children?: JSX.Element | JSX.Element[];
}

export const TableSearchBar = memo(({ children, ...props }: TableSearchBarProps) => (
  <div {...props} className={classNames("flex flex-row w-full gap-[8px]", props.className)}>
    {children}
  </div>
));

export default TableSearchBar;
