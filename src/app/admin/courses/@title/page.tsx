import { Suspense } from "react";

import { CoursesFiltersObj } from "~/actions";

import { LoadingText } from "~/components/loading/LoadingText";

import { CoursesTitle } from "./CoursesTitle";

export interface CoursesTitlePageProps {
  readonly searchParams: Record<string, string>;
}

export default async function CoursesTitlePage({ searchParams }: CoursesTitlePageProps) {
  const filters = CoursesFiltersObj.parse(searchParams);
  return (
    <Suspense key={JSON.stringify(filters)} fallback={<LoadingText />}>
      <CoursesTitle filters={filters} />
    </Suspense>
  );
}
