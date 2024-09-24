import { type ReactNode } from "react";

import { TableTitle } from "~/components/tables-v2/TableTitle";

interface SkillsLayoutProps {
  readonly table: ReactNode;
  readonly title: ReactNode;
}

export default function SkillsLayout({ table, title }: SkillsLayoutProps) {
  return (
    <div className="flex flex-col gap-[16px] max-h-full h-full">
      <TableTitle count={title}>Skills</TableTitle>
      <div className="flex flex-row items-center grow min-h-[0px] overflow-auto">{table}</div>
    </div>
  );
}