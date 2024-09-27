import { type ReactNode, Suspense } from "react";

import { TableTitle } from "~/components/tables-v2/TableTitle";
import { TableViewContainer } from "~/components/tables-v2/TableViewContainer";
import { TableViewContent } from "~/components/tables-v2/TableViewContent";
import { TableViewFooter } from "~/components/tables-v2/TableViewFooter";
import { TableViewHeader } from "~/components/tables-v2/TableViewHeader";
import { ExperiencesTableWrapper } from "~/features/experiences/components/tables-v2/ExperiencesTableWrapper";

import { ExperiencesTableFilterBar } from "./ExperiencesTableFilterBar";

interface ExperiencesLayoutProps {
  readonly table: ReactNode;
  readonly title: ReactNode;
  readonly pagination: ReactNode;
}

export default function ExperiencesLayout({ table, title, pagination }: ExperiencesLayoutProps) {
  return (
    <div className="flex flex-col gap-[16px] max-h-full h-full">
      <TableTitle count={title}>Experiences</TableTitle>
      <div className="flex flex-row items-center grow min-h-[0px] overflow-auto">
        <TableViewContainer>
          <TableViewHeader>
            <Suspense>
              <ExperiencesTableFilterBar />
            </Suspense>
          </TableViewHeader>
          <TableViewContent>
            <ExperiencesTableWrapper>{table}</ExperiencesTableWrapper>
          </TableViewContent>
          <TableViewFooter>{pagination}</TableViewFooter>
        </TableViewContainer>
      </div>
    </div>
  );
}
