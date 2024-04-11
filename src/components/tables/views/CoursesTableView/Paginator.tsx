import dynamic from "next/dynamic";

import { PAGE_SIZES } from "~/actions/fetches/constants";
import { getCoursesCount } from "~/actions/fetches/courses";

import { type Filters } from "./types";

const RootPaginator = dynamic(() => import("~/components/pagination/Paginator"), {});

interface PaginatorProps {
  readonly filters: Filters;
}

export const Paginator = async ({ filters }: PaginatorProps) => {
  const count = await getCoursesCount({ filters, visibility: "admin" });
  return <RootPaginator count={count} pageSize={PAGE_SIZES.course} />;
};
