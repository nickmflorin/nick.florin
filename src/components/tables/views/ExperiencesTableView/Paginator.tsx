import dynamic from "next/dynamic";

import { PAGE_SIZES } from "~/actions/fetches/constants";
import { getExperiencesCount } from "~/actions/fetches/experiences";

const RootPaginator = dynamic(() => import("~/components/pagination/Paginator"), {});

import { type Filters } from "./types";

interface PaginatorProps {
  readonly filters: Filters;
}

export const Paginator = async ({ filters }: PaginatorProps) => {
  const count = await getExperiencesCount({ filters, visibility: "admin" });
  return <RootPaginator count={count} pageSize={PAGE_SIZES.experience} />;
};
