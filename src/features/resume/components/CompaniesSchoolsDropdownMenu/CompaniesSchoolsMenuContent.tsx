import { getCompanies } from "~/actions/fetches/companies";
import { getSchools } from "~/actions/fetches/schools";

import { ClientCompaniesSchoolsMenuContent } from "./ClientCompaniesSchoolsMenuContent";
import { type ModelType, type Model } from "./types";

export interface CompaniesSchoolsMenuContentProps<M extends ModelType> {
  readonly modelType: M;
}

const fetchers: { [key in ModelType]: () => Promise<Model<key>[]> } = {
  company: async () => await getCompanies({ includes: ["experiences"], visibility: "admin" }),
  school: async () => await getSchools({ includes: ["educations"], visibility: "admin" }),
};

export const CompaniesSchoolsMenuContent = async <M extends ModelType>({
  modelType,
}: CompaniesSchoolsMenuContentProps<M>) => {
  const data = await fetchers[modelType]();
  return <ClientCompaniesSchoolsMenuContent data={data} modelType={modelType} />;
};
