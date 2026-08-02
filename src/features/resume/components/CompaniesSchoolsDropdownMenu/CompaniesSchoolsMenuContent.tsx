import { fetchCompanies } from '~/actions/companies/fetch-companies';
import { fetchSchools } from '~/actions/schools/fetch-schools';

import { ClientCompaniesSchoolsMenuContent } from './ClientCompaniesSchoolsMenuContent';
import { type Model, type ModelType } from './types';

export interface CompaniesSchoolsMenuContentProps<M extends ModelType> {
  readonly modelType: M;
}

const fetchers: { [key in ModelType]: () => Promise<Model<key>[]> } = {
  company: async () => {
    const fetcher = fetchCompanies(['experiences']);
    const { data: companies } = await fetcher(
      { filters: {}, visibility: 'admin' },
      { strict: true },
    );
    return companies;
  },
  school: async () => {
    const fetcher = fetchSchools(['educations']);
    const { data: schools } = await fetcher({ filters: {}, visibility: 'admin' }, { strict: true });
    return schools;
  },
};

export const CompaniesSchoolsMenuContent = async <M extends ModelType>({
  modelType,
}: CompaniesSchoolsMenuContentProps<M>) => {
  const data = await fetchers[modelType]();
  return <ClientCompaniesSchoolsMenuContent data={data} modelType={modelType} />;
};
