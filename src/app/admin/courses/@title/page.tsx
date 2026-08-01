import { Suspense } from "react";

import { CoursesFiltersObj } from "~/actions";

import { LoadingText } from "~/components/loading/LoadingText";

import { CoursesTitle } from "./CoursesTitle";

export interface CoursesTitlePageProps {
  readonly searchParams: Promise<Record<string, string>>;
}

export default async function CoursesTitlePage(props: CoursesTitlePageProps) {
  const searchParams = await props.searchParams;
  const filters = CoursesFiltersObj.parse(searchParams);
  return (
    <Suspense key={JSON.stringify(filters)} fallback={<LoadingText />}>
      <CoursesTitle filters={filters} />
    </Suspense>
  );
}
