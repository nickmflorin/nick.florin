import { cache } from "react";

import { prisma } from "~/prisma/client";
import { constructOrSearch } from "~/prisma/util";
import { Paginator } from "~/components/pagination/Paginator";

const PAGE_SIZE = 16;

interface SkillsAdminTableProps {
  readonly search: string | undefined;
}

const getCount = cache(
  async (search: string | undefined) =>
    await prisma.skill.count({
      where: { AND: constructOrSearch(search, ["slug", "label"]) },
    }),
);

export const SkillsAdminTablePaginator = async ({ search }: SkillsAdminTableProps) => {
  const count = await getCount(search);
  return <Paginator count={count} pageSize={PAGE_SIZE} />;
};
