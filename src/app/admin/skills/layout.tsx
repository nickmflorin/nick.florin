import { Suspense, type ReactNode } from "react";

import { TableTitle } from "~/components/tables/TableTitle";
import { TableViewContainer } from "~/components/tables/TableViewContainer";
import { TableViewContent } from "~/components/tables/TableViewContent";
import { TableViewFooter } from "~/components/tables/TableViewFooter";
import { TableViewHeader } from "~/components/tables/TableViewHeader";
import { SkillsTableWrapper } from "~/features/skills/components/tables/SkillsTableWrapper";

import { SkillsTableFilterBar } from "./SkillsTableFilterBar";

interface SkillsLayoutProps {
  readonly table: ReactNode;
  readonly title: ReactNode;
  readonly pagination: ReactNode;
}

export default function SkillsLayout({ table, title, pagination }: SkillsLayoutProps) {
  return (
    <div className="flex flex-col gap-[16px] max-h-full h-full">
      <TableTitle count={title}>Skills</TableTitle>
      <div className="flex flex-row items-center grow min-h-[0px] overflow-auto">
        <TableViewContainer>
          <TableViewHeader controlBarTargetId="skills-admin-table-control-bar">
            <Suspense>
              <SkillsTableFilterBar />
            </Suspense>
          </TableViewHeader>
          <TableViewContent>
            <SkillsTableWrapper>{table}</SkillsTableWrapper>
          </TableViewContent>
          <TableViewFooter>{pagination}</TableViewFooter>
        </TableViewContainer>
      </div>
    </div>
  );
}
