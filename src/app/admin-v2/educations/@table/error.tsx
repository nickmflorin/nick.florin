"use client";
import { ErrorView } from "~/components/errors/ErrorView";
import { EducationsTableControlBarPlaceholder } from "~/features/educations/components/tables-v2/EducationsTableControlBarPlaceholder";

export default function LoadingPage() {
  return (
    <>
      <EducationsTableControlBarPlaceholder />
      <ErrorView>There was an error loading the educations. Do not worry, we are on it.</ErrorView>;
    </>
  );
}
