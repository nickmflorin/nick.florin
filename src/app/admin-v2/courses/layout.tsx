import { type ReactNode, Suspense } from "react";

import { TableTitle } from "~/components/tables-v2/TableTitle";
import { TableViewContainer } from "~/components/tables-v2/TableViewContainer";
import { TableViewContent } from "~/components/tables-v2/TableViewContent";
import { TableViewFooter } from "~/components/tables-v2/TableViewFooter";
import { TableViewHeader } from "~/components/tables-v2/TableViewHeader";
import { CoursesTableWrapper } from "~/features/courses/components/tables-v2/CoursesTableWrapper";

import { CoursesTableFilterBar } from "./CoursesTableFilterBar";

interface CoursesLayoutProps {
  readonly table: ReactNode;
  readonly title: ReactNode;
  readonly pagination: ReactNode;
}

export default function CoursesLayout({ table, title, pagination }: CoursesLayoutProps) {
  return (
    <div className="flex flex-col gap-[16px] max-h-full h-full">
      <TableTitle count={title}>Courses</TableTitle>
      <div className="flex flex-row items-center grow min-h-[0px] overflow-auto">
        <TableViewContainer>
          <TableViewHeader>
            <Suspense>
              <CoursesTableFilterBar />
            </Suspense>
          </TableViewHeader>
          <TableViewContent>
            <CoursesTableWrapper>{table}</CoursesTableWrapper>
          </TableViewContent>
          <TableViewFooter>{pagination}</TableViewFooter>
        </TableViewContainer>
      </div>
    </div>
  );
}
