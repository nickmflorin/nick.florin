import { Suspense, type ReactNode } from "react";

import { SearchInput } from "./SearchInput";

interface SkillsLayoutProps {
  readonly children: ReactNode;
  readonly drawer: ReactNode;
}

export default async function SkillsLayout({ children, drawer }: SkillsLayoutProps) {
  return (
    <>
      <Suspense>
        <SearchInput className="mb-[18px]" />
      </Suspense>
      <div className="grow overflow-hidden w-full relative">{children}</div>
      {drawer}
    </>
  );
}
