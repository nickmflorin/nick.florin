import { z } from "zod";

type TopSkillNum = 5 | 8 | 12;

const showTopSkillsSchema = z
  .union([z.literal(5), z.literal(8), z.literal(12), z.enum(["5", "8", "12", "all"])])
  .transform((val): TopSkillNum | "all" =>
    typeof val === "string" && val !== "all" ? (parseInt(val) as TopSkillNum) : val,
  );

export type ShowTopSkills = z.infer<typeof showTopSkillsSchema>;

export const SHOW_TOP_SKILLS = [5, 8, 12, "all"] as const;
export const SHOW_TOP_SKILLS_STRINGS = ["5", "8", "12", "all"] as const;

export type ShowTopSkillsString = (typeof SHOW_TOP_SKILLS_STRINGS)[number];

export const SkillQuerySchema = z.object({
  showTopSkills: showTopSkillsSchema.default(8),
});

export type SkillQuery = z.infer<typeof SkillQuerySchema>;
