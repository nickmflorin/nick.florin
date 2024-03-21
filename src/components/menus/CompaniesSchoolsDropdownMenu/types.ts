import { type Company, type School } from "~/prisma/model";

export type ModelType = "company" | "school";

export type Model<T extends ModelType> = {
  company: Company;
  school: School;
}[T];
