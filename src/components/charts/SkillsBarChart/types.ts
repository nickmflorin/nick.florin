import { z } from "zod";

import { type ApiSkill } from "~/prisma/model";

export const SkillsBarChartFormSchema = z.object({
  showTopSkills: z.union([z.literal(5), z.literal(8), z.literal(12), z.literal("all")]),
});

export type SkillsBarChartDatum = Pick<ApiSkill, "id" | "label" | "slug"> & {
  readonly experience: number;
};
