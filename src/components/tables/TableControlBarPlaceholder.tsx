import { type ReactNode } from "react";

import { DeleteButton } from "~/components/buttons/DeleteButton";
import { Checkbox } from "~/components/input/Checkbox";
import { Actions, type Action } from "~/components/structural/Actions";
import { ColumnSelect } from "~/components/tables/ColumnSelect";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

import {
  TableControlBarPlaceholderAction,
  type TableControlBarPlaceholderActionConfig,
} from "./TableControlBarPlaceholderAction";
import { TableControlBarPortal } from "./TableControlBarPortal";

export interface TableControlBarPlaceholderProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly rowsAreDeletable?: boolean;
  readonly columnsAreSelectable?: boolean;
  readonly targetId: string | null;
  readonly actions?: TableControlBarPlaceholderActionConfig[];
  readonly extra?: Action[];
  readonly columnsSelect?: JSX.Element;
}

export const TableControlBarPlaceholder = ({
  children,
  actions,
  targetId,
  extra,
  rowsAreDeletable = false,
  columnsAreSelectable = true,
  columnsSelect,
  ...props
}: TableControlBarPlaceholderProps): JSX.Element => (
  <TableControlBarPortal targetId={targetId}>
    <div {...props} className={classNames("table-view__control-bar", props.className)}>
      <div className="table-view__control-bar__left">
        <div className="table-view__control-bar__checkbox-wrapper">
          <Checkbox readOnly value={false} isDisabled={true} />
        </div>
        <div className="table-view__control-bar-actions">
          {rowsAreDeletable && <DeleteButton isDisabled={true} />}
          {actions !== undefined && actions.length !== 0 ? (
            actions.map((action, i) => <TableControlBarPlaceholderAction {...action} key={i} />)
          ) : (
            <>{children}</>
          )}
        </div>
      </div>
      <div className="table-view__control-bar__right">
        {columnsSelect ? (
          columnsSelect
        ) : columnsAreSelectable ? (
          <ColumnSelect isDisabled columns={[]} />
        ) : (
          <></>
        )}
        <Actions>{extra}</Actions>
      </div>
    </div>
  </TableControlBarPortal>
);
