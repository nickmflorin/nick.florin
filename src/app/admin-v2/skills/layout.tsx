import { Suspense, type ReactNode } from "react";

import { TableTitle } from "~/components/tables-v2/TableTitle";
import { TableViewContainer } from "~/components/tables-v2/TableViewContainer";
import { TableViewContent } from "~/components/tables-v2/TableViewContent";
import { TableViewFooter } from "~/components/tables-v2/TableViewFooter";
import { TableViewHeader } from "~/components/tables-v2/TableViewHeader";
import { SkillsTableWrapper } from "~/features/skills/components/tables-v2/SkillsTableWrapper";

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
          <TableViewHeader>
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
