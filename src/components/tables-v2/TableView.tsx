import React from "react";

import { Loading } from "~/components/loading/Loading";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

import { TableControlBar } from "./TableControlBar";
import { TableFilterBar } from "./TableFilterBar";
import { TableViewFooter } from "./TableViewFooter";
import { TableViewHeader } from "./TableViewHeader";

export interface TableViewProps extends ComponentProps {
  readonly children: JSX.Element;
  readonly headerProps?: ComponentProps;
  readonly isLoading?: boolean;
  readonly contentClassName?: ComponentProps["className"];
  readonly footer?: JSX.Element;
  readonly footerProps?: ComponentProps;
  readonly header?: JSX.Element;
  readonly controlBarTargetId?: string;
}

const LocalTableView = ({
  children,
  contentClassName,
  isLoading = false,
  footer,
  headerProps,
  footerProps,
  header,
  controlBarTargetId,
  ...props
}: TableViewProps): JSX.Element => (
  <div
    {...props}
    className={classNames("table-view", { "table-view--loading": isLoading }, props.className)}
  >
    <TableViewHeader {...headerProps} controlBarTargetId={controlBarTargetId}>
      {header}
    </TableViewHeader>
    <div className={classNames("table-view__content", contentClassName)}>
      <Loading isLoading={isLoading}>
        <div className="max-h-full h-full overflow-x-auto">{children}</div>
      </Loading>
    </div>
    <TableViewFooter {...footerProps}>{footer}</TableViewFooter>
  </div>
);

export const TableView = Object.assign(React.memo(LocalTableView), {
  FilterBar: TableFilterBar,
  ControlBar: TableControlBar,
});
