"use client";
import { ErrorView } from "~/components/errors/ErrorView";
import { CoursesTableControlBarPlaceholder } from "~/features/courses/components/tables/CoursesTableControlBarPlaceholder";

export default function LoadingPage() {
  return (
    <>
      <CoursesTableControlBarPlaceholder />
      <ErrorView>There was an error loading the courses. Do not worry, we are on it.</ErrorView>;
    </>
  );
}
