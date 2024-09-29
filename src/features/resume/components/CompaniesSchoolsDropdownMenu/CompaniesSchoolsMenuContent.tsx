import { getSchools } from "~/actions/fetches/schools";
import { fetchCompanies } from "~/actions-v2/companies/fetch-companies";

import { ClientCompaniesSchoolsMenuContent } from "./ClientCompaniesSchoolsMenuContent";
import { type ModelType, type Model } from "./types";

export interface CompaniesSchoolsMenuContentProps<M extends ModelType> {
  readonly modelType: M;
}

const fetchers: { [key in ModelType]: () => Promise<Model<key>[]> } = {
  company: async () => {
    const fetcher = fetchCompanies(["experiences"]);
    const { data: companies } = await fetcher(
      { visibility: "admin", filters: {} },
      { strict: true },
    );
    return companies;
  },
  school: async () => await getSchools({ includes: ["educations"], visibility: "admin" }),
};

export const CompaniesSchoolsMenuContent = async <M extends ModelType>({
  modelType,
}: CompaniesSchoolsMenuContentProps<M>) => {
  const data = await fetchers[modelType]();
  return <ClientCompaniesSchoolsMenuContent data={data} modelType={modelType} />;
};
