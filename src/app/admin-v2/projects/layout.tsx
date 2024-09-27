import { type ReactNode, Suspense } from "react";

import { TableTitle } from "~/components/tables-v2/TableTitle";
import { TableViewContainer } from "~/components/tables-v2/TableViewContainer";
import { TableViewContent } from "~/components/tables-v2/TableViewContent";
import { TableViewFooter } from "~/components/tables-v2/TableViewFooter";
import { TableViewHeader } from "~/components/tables-v2/TableViewHeader";
import { ProjectsTableWrapper } from "~/features/projects/components/tables-v2/ProjectsTableWrapper";

import { ProjectsTableFilterBar } from "./ProjectsTableFilterBar";

interface ProjectsLayoutProps {
  readonly table: ReactNode;
  readonly title: ReactNode;
  readonly pagination: ReactNode;
}

export default function ProjectsLayout({ table, title, pagination }: ProjectsLayoutProps) {
  return (
    <div className="flex flex-col gap-[16px] max-h-full h-full">
      <TableTitle count={title}>Projects</TableTitle>
      <div className="flex flex-row items-center grow min-h-[0px] overflow-auto">
        <TableViewContainer>
          <TableViewHeader>
            <Suspense>
              <ProjectsTableFilterBar />
            </Suspense>
          </TableViewHeader>
          <TableViewContent>
            <ProjectsTableWrapper>{table}</ProjectsTableWrapper>
          </TableViewContent>
          <TableViewFooter>{pagination}</TableViewFooter>
        </TableViewContainer>
      </div>
    </div>
  );
}
