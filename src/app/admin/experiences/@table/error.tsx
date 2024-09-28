"use client";
import { ErrorView } from "~/components/errors/ErrorView";
import { ExperiencesTableControlBarPlaceholder } from "~/features/experiences/components/tables/ExperiencesTableControlBarPlaceholder";

export default function LoadingPage() {
  return (
    <>
      <ExperiencesTableControlBarPlaceholder />
      <ErrorView>There was an error loading the experiences. Do not worry, we are on it.</ErrorView>
      ;
    </>
  );
}
