import { type ReactNode } from "react";

import { DeleteButton } from "~/components/buttons/DeleteButton";
import { Checkbox } from "~/components/input/Checkbox";
import { Actions, type Action } from "~/components/structural/Actions";
import { ColumnSelect } from "~/components/tables-v2/ColumnSelect";
import type { ComponentProps } from "~/components/types";
import { classNames } from "~/components/types";

import { TableControlBarPortal } from "./TableControlBarPortal";

export interface TableControlBarPlaceholderProps extends ComponentProps {
  readonly children?: ReactNode;
  readonly rowsAreDeletable?: boolean;
  readonly columnsAreSelectable?: boolean;
  readonly targetId: string | null;
  readonly actions?: Action[];
  readonly columnsSelect?: JSX.Element;
}

export const TableControlBarPlaceholder = ({
  children,
  actions,
  targetId,
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
          {children}
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
        <Actions>{actions}</Actions>
      </div>
    </div>
  </TableControlBarPortal>
);
