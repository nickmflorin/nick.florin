import { z } from "zod";

import { decodeQueryParam } from "~/lib/urls";
import { preloadAdminEducations } from "~/actions/fetches/get-educations";
import { preloadAdminExperiences } from "~/actions/fetches/get-experiences";
import { SkillsTableView } from "~/components/tables/SkillsTableView";

interface SkillsPageProps {
  readonly searchParams: {
    readonly search?: string;
    readonly page?: string;
    readonly educations?: string;
    readonly experiences?: string;
  };
}

export default async function SkillsPage({
  searchParams: { search, page: _page, educations, experiences },
}: SkillsPageProps) {
  /* Even if the 'page' query parameter is very large, the action to fetch the data will eventually
     truncate it based on the maximum possible page size - so we do not need to worry about
     sanitizing here. */
  const parsed = z.coerce.number().min(1).int().default(1).safeParse(_page);
  let page: number = 1;
  if (parsed.success) {
    page = parsed.data;
  }

  const filters = {
    educations: educations ? decodeQueryParam(educations, { form: ["array"] as const }) ?? [] : [],
    search: search ?? "",
    experiences: experiences
      ? decodeQueryParam(experiences, { form: ["array"] as const }) ?? []
      : [],
  };

  preloadAdminEducations({ page, filters });
  preloadAdminExperiences({ page, filters });

  return <SkillsTableView filters={filters} page={page} />;
}
