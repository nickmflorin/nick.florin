import { Suspense } from "react";

import { ExperiencesFiltersObj } from "~/actions-v2";

import { LoadingText } from "~/components/loading/LoadingText";

import { ExperiencesTitle } from "./ExperiencesTitle";

export interface ExperiencesTitlePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function ExperiencesTitlePage({ searchParams }: ExperiencesTitlePageProps) {
  const filters = ExperiencesFiltersObj.parse(searchParams);
  return (
    <Suspense key={JSON.stringify(filters)} fallback={<LoadingText />}>
      <ExperiencesTitle filters={filters} />
    </Suspense>
  );
}
