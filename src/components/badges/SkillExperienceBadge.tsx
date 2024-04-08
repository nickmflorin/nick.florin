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
    {skill.experience
      ? `${skill.experience} year${skill.experience === 1 ? "" : "s"}`
      : `${skill.autoExperience} year${skill.autoExperience === 1 ? "" : "s"}`}
  </Badge>
);
