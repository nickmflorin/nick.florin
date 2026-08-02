import { type JSX, memo } from 'react';

import { ConnectedTableControlBar } from '~/components/tables/ConnectedTableControlBar';

import { useDataTable } from './hooks';
import { TableFilterBar } from './TableFilterBar';
import { TableView, type TableViewProps } from './TableView';

export interface ConnectedTableViewProps extends Omit<TableViewProps, 'controlBarTargetId'> {}

const LocalConnectedTableView = (props: ConnectedTableViewProps): JSX.Element => {
  const { controlBarTargetId } = useDataTable();
  return (
    <TableView {...props} controlBarTargetId={controlBarTargetId}>
      {props.children}
    </TableView>
  );
};

export const ConnectedTableView = Object.assign(memo(LocalConnectedTableView), {
  ControlBar: ConnectedTableControlBar,
  FilterBar: TableFilterBar,
});
