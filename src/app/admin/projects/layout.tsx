import { type ReactNode, Suspense } from "react";

import { TableTitle } from "~/components/tables/TableTitle";
import { TableViewContainer } from "~/components/tables/TableViewContainer";
import { TableViewContent } from "~/components/tables/TableViewContent";
import { TableViewFooter } from "~/components/tables/TableViewFooter";
import { TableViewHeader } from "~/components/tables/TableViewHeader";
import { ProjectsTableWrapper } from "~/features/projects/components/tables/ProjectsTableWrapper";

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
          <TableViewHeader controlBarTargetId="projects-admin-table-control-bar">
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
