import { type ApiSkill } from "~/prisma/model";

export type SkillsBarChartDatum = Pick<ApiSkill, "id" | "label" | "slug"> & {
  readonly experience: number;
};
