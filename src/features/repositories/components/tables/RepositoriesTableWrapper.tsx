import type { ReactNode } from "react";
import { Suspense } from "react";

import { DataTableProvider } from "~/components/tables/DataTableProvider";
import { RepositoriesTableColumns, type RepositoriesTableColumnId } from "~/features/repositories";

import { RepositoriesDataTableWrapper } from "./RepositoriesDataTableWrapper";

export interface RepositoriesTableWrapperProps {
  readonly children: ReactNode;
  readonly excludeColumns?: RepositoriesTableColumnId[];
}

export const RepositoriesTableWrapper = ({ children, ...props }: RepositoriesTableWrapperProps) => (
  <DataTableProvider
    columns={RepositoriesTableColumns}
    controlBarTargetId="repositories-admin-table-control-bar"
    rowsAreDeletable
    rowsAreSelectable
    rowsHaveActions
  >
    <Suspense fallback={<></>}>
      <RepositoriesDataTableWrapper {...props}>{children}</RepositoriesDataTableWrapper>
    </Suspense>
  </DataTableProvider>
);
