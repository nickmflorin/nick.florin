"use client";
import { updateRepository } from "~/actions-v2/repositories/update-repository";

import { CheckboxCell } from "~/components/tables/cells/CheckboxCell";
import type * as types from "~/components/tables/types";
import type {
  RepositoriesTableModel,
  RepositoriesTableColumn,
} from "~/features/repositories/types";

interface VisibleCellProps {
  readonly repository: RepositoriesTableModel;
  readonly table: types.CellDataTableInstance<RepositoriesTableModel, RepositoriesTableColumn>;
}

export const VisibleCell = ({ repository, table }: VisibleCellProps): JSX.Element => (
  <CheckboxCell
    attribute="visible"
    model={repository}
    table={table}
    errorMessage="There was an error updating the repository."
    action={async (id, value) => await updateRepository(id, { visible: value })}
  />
);
