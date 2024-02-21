import { type ReactNode } from "react";
import { Suspense } from "react";

import { preloadEducations } from "~/fetches/get-educations";
import { preloadExperiences } from "~/fetches/get-experiences";

import { SearchInput } from "./SearchInput";

interface SkillsLayoutProps {
  readonly children: ReactNode;
  readonly drawer: ReactNode;
}

export default async function SkillsLayout({ children, drawer }: SkillsLayoutProps) {
  preloadEducations({});
  preloadExperiences({});

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
