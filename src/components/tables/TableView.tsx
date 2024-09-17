import { memo } from "react";

import { classNames } from "~/components/types";
import { type ComponentProps } from "~/components/types";

import { ControlContainer } from "./ControlContainer";

export interface TableViewProps extends ComponentProps {
  readonly searchBar?: JSX.Element;
  readonly controlBar?: JSX.Element;
  readonly paginator?: JSX.Element;
  readonly children: JSX.Element;
}

export const TableView = memo(
  ({ searchBar, paginator, controlBar, children, ...props }: TableViewProps) => (
    <div
      {...props}
      className={classNames(
        "flex flex-col h-full relative overflow-hidden gap-[16px]",
        props.className,
      )}
    >
      <ControlContainer>{searchBar}</ControlContainer>
      <ControlContainer>{controlBar}</ControlContainer>
      <div className="flex flex-grow flex-col relative min-h-0">{children}</div>
      <ControlContainer>{paginator}</ControlContainer>
    </div>
  ),
);

export default TableView;
