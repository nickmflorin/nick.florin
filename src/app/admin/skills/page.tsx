import { Suspense } from "react";

import { Loading } from "~/components/views/Loading";

import SkillsAdminTable from "./SkillsAdminTable";

interface SkillsPageProps {
  readonly searchParams: { readonly search?: string; readonly page?: string };
}

export default async function SkillsPage({ searchParams: { search, page } }: SkillsPageProps) {
  return (
    <Suspense key={search} fallback={<Loading loading={true} />}>
      <SkillsAdminTable search={search} page={page} />
    </Suspense>
  );
}
