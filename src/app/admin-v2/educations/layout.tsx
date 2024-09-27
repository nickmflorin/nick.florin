import { type ReactNode, Suspense } from "react";

import { TableTitle } from "~/components/tables-v2/TableTitle";
import { TableViewContainer } from "~/components/tables-v2/TableViewContainer";
import { TableViewContent } from "~/components/tables-v2/TableViewContent";
import { TableViewFooter } from "~/components/tables-v2/TableViewFooter";
import { TableViewHeader } from "~/components/tables-v2/TableViewHeader";
import { EducationsTableWrapper } from "~/features/educations/components/tables-v2/EducationsTableWrapper";

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
          <TableViewHeader>
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
