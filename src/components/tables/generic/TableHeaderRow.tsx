import { type ClassName, classNames } from '~/components/types';

import { AbstractTableRow, type AbstractTableRowProps } from './AbstractTableRow';

export interface TableHeaderRowProps extends AbstractTableRowProps {
  readonly hoveredClassName?: ClassName;
  readonly shouldHighlightOnHover?: boolean;
}

export const TableHeaderRow = (props: TableHeaderRowProps) => (
  <AbstractTableRow {...props} className={classNames('table__header-row', props.className)} />
);
