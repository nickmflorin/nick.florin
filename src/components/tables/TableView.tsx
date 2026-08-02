import { type JSX, memo } from 'react';

import { type ComponentProps } from '~/components/types';

import { TableControlBar } from './TableControlBar';
import { TableFilterBar } from './TableFilterBar';
import { TableViewContainer } from './TableViewContainer';
import { TableViewContent } from './TableViewContent';
import { TableViewFooter } from './TableViewFooter';
import { TableViewHeader } from './TableViewHeader';

export interface TableViewProps extends ComponentProps {
  readonly children: JSX.Element;
  readonly contentClassName?: ComponentProps['className'];
  readonly controlBarTargetId?: null | string;
  readonly footer?: JSX.Element;
  readonly footerProps?: ComponentProps;
  readonly header?: JSX.Element;
  readonly headerProps?: ComponentProps;
  readonly isLoading?: boolean;
}

const LocalTableView = ({
  children,
  contentClassName,
  controlBarTargetId,
  footer,
  footerProps,
  header,
  headerProps,
  isLoading = false,
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

export const TableView = Object.assign(memo(LocalTableView), {
  Container: TableViewContainer,
  Content: TableViewContent,
  ControlBar: TableControlBar,
  FilterBar: TableFilterBar,
});
