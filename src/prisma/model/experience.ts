import { type Experience, type Company, type Skill, type Detail } from "@prisma/client";

export type ApiExperience = Experience & {
  readonly company: Company;
  readonly details: Detail[];
  readonly skills: Skill[];
};
