import { type JSX, type ReactNode } from 'react';

import { DeleteButton } from '~/components/buttons/DeleteButton';
import { Checkbox } from '~/components/input/Checkbox';
import { type Action, Actions } from '~/components/structural/Actions';
import { ColumnSelect } from '~/components/tables/ColumnSelect';
import { classNames, type ComponentProps } from '~/components/types';

import {
  TableControlBarPlaceholderAction,
  type TableControlBarPlaceholderActionConfig,
} from './TableControlBarPlaceholderAction';
import { TableControlBarPortal } from './TableControlBarPortal';

export interface TableControlBarPlaceholderProps extends ComponentProps {
  readonly actions?: TableControlBarPlaceholderActionConfig[];
  readonly areColumnsSelectable?: boolean;
  readonly areRowsDeletable?: boolean;
  readonly children?: ReactNode;
  readonly columnsSelect?: JSX.Element;
  readonly extra?: Action[];
  readonly targetId: null | string;
}

export const TableControlBarPlaceholder = ({
  actions,
  areColumnsSelectable = true,
  areRowsDeletable = false,
  children,
  columnsSelect,
  extra,
  targetId,
  ...props
}: TableControlBarPlaceholderProps): JSX.Element => (
  <TableControlBarPortal targetId={targetId}>
    <div {...props} className={classNames('table-view__control-bar', props.className)}>
      <div className='table-view__control-bar__left'>
        <div className='table-view__control-bar__checkbox-wrapper'>
          <Checkbox isChecked={false} isDisabled readOnly />
        </div>
        <div className='table-view__control-bar-actions'>
          {areRowsDeletable && <DeleteButton isDisabled />}
          {actions !== undefined && actions.length !== 0 ? (
            actions.map((action, i) => <TableControlBarPlaceholderAction {...action} key={i} />)
          ) : (
            <>{children}</>
          )}
        </div>
      </div>
      <div className='table-view__control-bar__right'>
        {columnsSelect ?? (areColumnsSelectable ? <ColumnSelect columns={[]} isDisabled /> : null)}
        <Actions>{extra}</Actions>
      </div>
    </div>
  </TableControlBarPortal>
);
