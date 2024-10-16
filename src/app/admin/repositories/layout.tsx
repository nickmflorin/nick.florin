import { type ReactNode, Suspense } from "react";

import { TableTitle } from "~/components/tables/TableTitle";
import { TableViewContainer } from "~/components/tables/TableViewContainer";
import { TableViewContent } from "~/components/tables/TableViewContent";
import { TableViewFooter } from "~/components/tables/TableViewFooter";
import { TableViewHeader } from "~/components/tables/TableViewHeader";
import { RepositoriesTableWrapper } from "~/features/repositories/components/tables/RepositoriesTableWrapper";

import { RepositoriesTableFilterBar } from "./RepositoriesTableFilterBar";

interface RepositoriesLayoutProps {
  readonly table: ReactNode;
  readonly title: ReactNode;
  readonly pagination: ReactNode;
}

export default function RepositoriesLayout({ table, title, pagination }: RepositoriesLayoutProps) {
  return (
    <div className="flex flex-col gap-[16px] max-h-full h-full">
      <TableTitle count={title}>Repositories</TableTitle>
      <div className="flex flex-row items-center grow min-h-[0px] overflow-auto">
        <TableViewContainer>
          <TableViewHeader controlBarTargetId="repositories-admin-table-control-bar">
            <Suspense>
              <RepositoriesTableFilterBar />
            </Suspense>
          </TableViewHeader>
          <TableViewContent>
            <RepositoriesTableWrapper>{table}</RepositoriesTableWrapper>
          </TableViewContent>
          <TableViewFooter>{pagination}</TableViewFooter>
        </TableViewContainer>
      </div>
    </div>
  );
}
