import { Suspense } from "react";

import { SkillsFiltersObj } from "~/actions";

import { LoadingText } from "~/components/loading/LoadingText";

import { SkillsTitle } from "./SkillsTitle";

export interface SkillsTitlePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

export default async function SkillsTitlePage(props: SkillsTitlePageProps) {
  const searchParams = await props.searchParams;
  const filters = SkillsFiltersObj.parse(searchParams);
  return (
    <Suspense key={JSON.stringify(filters)} fallback={<LoadingText />}>
      <SkillsTitle filters={filters} />
    </Suspense>
  );
}
