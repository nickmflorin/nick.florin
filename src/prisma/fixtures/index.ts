import { type Experience, type Company, type Detail, type NestedDetail } from "../model";

import companies from "./companies.json";
import profile from "./profile.json";
import schools from "./schools.json";

export type JsonSkill = string;

export type JsonDetail = Pick<Detail, "label" | "description"> & {
  readonly nestedDetails?: Pick<NestedDetail, "label" | "description">[];
};

export type JsonExperience = Pick<
  Experience,
  "description" | "title" | "shortTitle" | "isRemote"
> & {
  readonly startDate: string;
  readonly endDate?: string;
  readonly skills?: JsonSkill[];
  readonly details?: JsonDetail[];
};

export type JsonCompany = Pick<
  Company,
  "city" | "logoImageUrl" | "name" | "description" | "state" | "websiteUrl"
> & {
  readonly experiences: JsonExperience[];
};

export const json = {
  schools: schools.schools,
  companies: companies.companies as JsonCompany[],
  profile,
};
