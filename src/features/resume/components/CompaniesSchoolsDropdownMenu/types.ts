import { type ApiCompany, type ApiSchool } from '~/database/model';

export type ModelType = 'company' | 'school';

export type Model<T extends ModelType> = {
  company: ApiCompany<['experiences']>;
  school: ApiSchool<['educations']>;
}[T];
