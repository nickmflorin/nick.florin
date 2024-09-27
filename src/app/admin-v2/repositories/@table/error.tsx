"use client";
import { ErrorView } from "~/components/errors/ErrorView";
import { RepositoriesTableControlBarPlaceholder } from "~/features/repositories/components/tables-v2/RepositoriesTableControlBarPlaceholder";

export default function LoadingPage() {
  return (
    <>
      <RepositoriesTableControlBarPlaceholder />
      <ErrorView>
        There was an error loading the repositories. Do not worry, we are on it.
      </ErrorView>
      ;
    </>
  );
}
