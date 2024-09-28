import { type ReactNode, Suspense } from "react";

import { TableTitle } from "~/components/tables/TableTitle";
import { TableViewContainer } from "~/components/tables/TableViewContainer";
import { TableViewContent } from "~/components/tables/TableViewContent";
import { TableViewFooter } from "~/components/tables/TableViewFooter";
import { TableViewHeader } from "~/components/tables/TableViewHeader";
import { EducationsTableWrapper } from "~/features/educations/components/tables/EducationsTableWrapper";

import { EducationsTableFilterBar } from "./EducationsTableFilterBar";

interface EducationsLayoutProps {
  readonly table: ReactNode;
  readonly title: ReactNode;
  readonly pagination: ReactNode;
}

export default function EducationsLayout({ table, title, pagination }: EducationsLayoutProps) {
  return (
    <div className="flex flex-col gap-[16px] max-h-full h-full">
      <TableTitle count={title}>Educations</TableTitle>
      <div className="flex flex-row items-center grow min-h-[0px] overflow-auto">
        <TableViewContainer>
          <TableViewHeader controlBarTargetId="educations-admin-table-control-bar">
            <Suspense>
              <EducationsTableFilterBar />
            </Suspense>
          </TableViewHeader>
          <TableViewContent>
            <EducationsTableWrapper>{table}</EducationsTableWrapper>
          </TableViewContent>
          <TableViewFooter>{pagination}</TableViewFooter>
        </TableViewContainer>
      </div>
    </div>
  );
}
