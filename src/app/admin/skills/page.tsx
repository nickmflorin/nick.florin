import { z } from "zod";

import { decodeQueryParam } from "~/lib/urls";
import { preloadEducations } from "~/actions/fetches/get-educations";
import { preloadExperiences } from "~/actions/fetches/get-experiences";
import { SkillsTableView } from "~/components/tables/SkillsTableView";

interface SkillsPageProps {
  readonly searchParams: {
    readonly search?: string;
    readonly page?: string;
    readonly checkedRows?: string;
    readonly educations?: string;
    readonly experiences?: string;
  };
}

export default async function SkillsPage({
  searchParams: { search, checkedRows, page: _page, educations, experiences },
}: SkillsPageProps) {
  /* We might want to look into setting a maximum here so that we don't wind up with empty results
     when the page is too large. */
  const parsed = z.coerce.number().min(1).int().default(1).safeParse(_page);
  let page: number = 1;
  if (parsed.success) {
    page = parsed.data;
  }

  preloadEducations({ skills: true });
  preloadExperiences({ skills: true });

  const filters = {
    educations: educations ? decodeQueryParam(educations, { form: ["array"] as const }) ?? [] : [],
    search: search ?? "",
    experiences: experiences
      ? decodeQueryParam(experiences, { form: ["array"] as const }) ?? []
      : [],
  };

  return (
    <SkillsTableView
      filters={filters}
      page={page}
      checkedRows={
        checkedRows ? decodeQueryParam(checkedRows, { form: ["array"] as const }) ?? [] : []
      }
    />
  );
}
