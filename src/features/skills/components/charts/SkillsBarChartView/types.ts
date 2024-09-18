import { type ApiSkill } from "~/database/model";

export type SkillsBarChartDatum = Pick<ApiSkill, "id" | "label" | "slug"> & {
  readonly experience: number;
};
