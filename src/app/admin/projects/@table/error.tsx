"use client";
import { ErrorView } from "~/components/errors/ErrorView";
import { ProjectsTableControlBarPlaceholder } from "~/features/projects/components/tables/ProjectsTableControlBarPlaceholder";

export default function LoadingPage() {
  return (
    <>
      <ProjectsTableControlBarPlaceholder />
      <ErrorView>There was an error loading the projects. Do not worry, we are on it.</ErrorView>;
    </>
  );
}
