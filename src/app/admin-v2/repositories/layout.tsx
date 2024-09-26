import { type ReactNode } from "react";

import { TableTitle } from "~/components/tables-v2/TableTitle";

interface RepositoriesLayoutProps {
  readonly table: ReactNode;
  readonly title: ReactNode;
}

export default function RepositoriesLayout({ table, title }: RepositoriesLayoutProps) {
  return (
    <div className="flex flex-col gap-[16px] max-h-full h-full">
      <TableTitle count={title}>Repositories</TableTitle>
      <div className="flex flex-row items-center grow min-h-[0px] overflow-auto">{table}</div>
    </div>
  );
}
