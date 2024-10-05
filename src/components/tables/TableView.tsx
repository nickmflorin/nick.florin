import React from "react";

import type { ComponentProps } from "~/components/types";

import { TableControlBar } from "./TableControlBar";
import { TableFilterBar } from "./TableFilterBar";
import { TableViewContainer } from "./TableViewContainer";
import { TableViewContent } from "./TableViewContent";
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
  readonly controlBarTargetId?: string | null;
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
  <TableViewContainer {...props}>
    <TableViewHeader {...headerProps} controlBarTargetId={controlBarTargetId}>
      {header}
    </TableViewHeader>
    <TableViewContent className={contentClassName} isLoading={isLoading}>
      {children}
    </TableViewContent>
    <TableViewFooter {...footerProps}>{footer}</TableViewFooter>
  </TableViewContainer>
);

export const TableView = Object.assign(React.memo(LocalTableView), {
  FilterBar: TableFilterBar,
  ControlBar: TableControlBar,
  Content: TableViewContent,
  Container: TableViewContainer,
});
