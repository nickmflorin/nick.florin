import { fetchCompanies } from "~/actions-v2/companies/fetch-companies";
import { fetchSchools } from "~/actions-v2/schools/fetch-schools";

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
  school: async () => {
    const fetcher = fetchSchools(["educations"]);
    const { data: schools } = await fetcher({ visibility: "admin", filters: {} }, { strict: true });
    return schools;
  },
};

export const CompaniesSchoolsMenuContent = async <M extends ModelType>({
  modelType,
}: CompaniesSchoolsMenuContentProps<M>) => {
  const data = await fetchers[modelType]();
  return <ClientCompaniesSchoolsMenuContent data={data} modelType={modelType} />;
};
