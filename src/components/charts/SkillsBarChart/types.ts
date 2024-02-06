import { z } from "zod";

export const SkillBarChartFormSchema = z.object({
  showTopSkills: z.union([z.literal(5), z.literal(8), z.literal(12), z.literal("all")]),
});
