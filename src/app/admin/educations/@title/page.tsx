import { Suspense } from "react";

import { EducationsFiltersObj } from "~/actions";

import { LoadingText } from "~/components/loading/LoadingText";

import { EducationsTitle } from "./EducationsTitle";

export interface EducationsTitlePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function EducationsTitlePage({ searchParams }: EducationsTitlePageProps) {
  const filters = EducationsFiltersObj.parse(searchParams);
  return (
    <Suspense key={JSON.stringify(filters)} fallback={<LoadingText />}>
      <EducationsTitle filters={filters} />
    </Suspense>
  );
}
