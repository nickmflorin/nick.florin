import dynamic from "next/dynamic";

import { PAGE_SIZES } from "~/actions/fetches/constants";
import { getExperiencesCount, type GetExperiencesFilters } from "~/actions/fetches/experiences";

const RootPaginator = dynamic(() => import("~/components/pagination/Paginator"), {});

interface PaginatorProps {
  readonly filters: GetExperiencesFilters;
}

export const Paginator = async ({ filters }: PaginatorProps) => {
  const count = await getExperiencesCount({ filters, visibility: "admin" });
  return <RootPaginator count={count} pageSize={PAGE_SIZES.experience} />;
};
