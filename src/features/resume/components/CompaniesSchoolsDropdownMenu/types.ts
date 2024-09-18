import { type ApiSchool, type ApiCompany } from "~/database/model";

export type ModelType = "company" | "school";

export type Model<T extends ModelType> = {
  company: ApiCompany<["experiences"]>;
  school: ApiSchool<["educations"]>;
}[T];
