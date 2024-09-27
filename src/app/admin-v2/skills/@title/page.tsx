import { Suspense } from "react";

import { SkillsFiltersObj } from "~/actions-v2";

import { LoadingText } from "~/components/loading/LoadingText";

import { SkillsTitle } from "./SkillsTitle";

export interface SkillsTitlePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function SkillsTitlePage({ searchParams }: SkillsTitlePageProps) {
  const filters = SkillsFiltersObj.parse(searchParams);
  return (
    <Suspense key={JSON.stringify(filters)} fallback={<LoadingText />}>
      <SkillsTitle filters={filters} />
    </Suspense>
  );
}
