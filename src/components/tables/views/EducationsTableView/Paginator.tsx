import dynamic from "next/dynamic";

import { PAGE_SIZES } from "~/actions/fetches/constants";
import { getEducationsCount, type GetEducationsFilters } from "~/actions/fetches/educations";

const RootPaginator = dynamic(() => import("~/components/pagination/Paginator"), {});

interface PaginatorProps {
  readonly filters: Omit<GetEducationsFilters, "highlighted">;
}

export const Paginator = async ({ filters }: PaginatorProps) => {
  const count = await getEducationsCount({ filters, visibility: "admin" });
  return <RootPaginator count={count} pageSize={PAGE_SIZES.education} />;
};
