import { Suspense } from "react";

import { RepositoriesFiltersObj } from "~/actions";

import { LoadingText } from "~/components/loading/LoadingText";

import { RepositoriesTitle } from "./RepositoriesTitle";

export interface RepositoriesTitlePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

export default async function RepositoriesTitlePage(props: RepositoriesTitlePageProps) {
  const searchParams = await props.searchParams;
  const filters = RepositoriesFiltersObj.parse(searchParams);
  return (
    <Suspense key={JSON.stringify(filters)} fallback={<LoadingText />}>
      <RepositoriesTitle filters={filters} />
    </Suspense>
  );
}
