"use client";
import { updateRepository } from "~/actions-v2/repositories/update-repository";

import { CheckboxCell } from "~/components/tables-v2/cells/CheckboxCell";
import type * as types from "~/components/tables-v2/types";
import type {
  RepositoriesTableModel,
  RepositoriesTableColumn,
} from "~/features/repositories/types";

interface HighlightedCellProps {
  readonly repository: RepositoriesTableModel;
  readonly table: types.CellDataTableInstance<RepositoriesTableModel, RepositoriesTableColumn>;
}

export const HighlightedCell = ({ repository, table }: HighlightedCellProps): JSX.Element => (
  <CheckboxCell
    attribute="highlighted"
    model={repository}
    table={table}
    errorMessage="There was an error updating the repository."
    action={async (id, value) => await updateRepository(id, { highlighted: value })}
  />
);
