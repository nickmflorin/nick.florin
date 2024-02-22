"use client";
import { type ApiSkill } from "~/prisma/model";

import { Badge, type BadgeProps } from "./Badge";

export interface SkillExperienceBadgeProps
  extends Omit<BadgeProps, "children" | "icon" | "iconClassName"> {
  readonly skill: Pick<ApiSkill, "experience" | "autoExperience">;
}

export const SkillExperienceBadge = ({
  skill,
  ...props
}: SkillExperienceBadgeProps): JSX.Element => (
  <Badge {...props}>
    {skill.experience ? `${skill.experience} years` : `${skill.autoExperience} years`}
  </Badge>
);
